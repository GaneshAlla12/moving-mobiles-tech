import { NextResponse } from "next/server";
import { lookupProducts } from "@/lib/shopify-storefront";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * VAPI tool endpoint — `lookup_products`.
 *
 * Replaces the slow n8n AI-Agent middleware path. Now Maria's tool call
 * lands directly on this endpoint, hits Shopify (with Redis caching),
 * and returns a voice-ready summary in ~50–800ms.
 *
 * VAPI sends tool calls in one of these shapes (defensive on both):
 *   {
 *     "message": {
 *       "type": "tool-calls",
 *       "toolCalls": [
 *         { "id": "...", "function": { "arguments": { "searchTerm": "iPhone 17" } } }
 *       ]
 *     }
 *   }
 *
 * Or sometimes a simpler test-call:
 *   { "searchTerm": "iPhone 17" }
 *
 * Response shape (VAPI custom-tool standard):
 *   { "results": [{ "toolCallId": "...", "result": "<text>" }] }
 *
 * The `result` field is what Maria reads as the tool output — we put the
 * voice-friendly summary there.
 */

type VAPIBody = {
  message?: {
    type?: string;
    toolCalls?: Array<{
      id?: string;
      function?: {
        name?: string;
        arguments?: Record<string, unknown> | string;
      };
    }>;
  };
  // Test-mode shortcut: send body with just the params.
  searchTerm?: string;
  toolCallId?: string;
};

export async function POST(req: Request) {
  let body: VAPIBody;
  try {
    body = (await req.json()) as VAPIBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Extract searchTerm + toolCallId from either VAPI tool-call shape
  // or a simpler test shape.
  let searchTerm = "";
  let toolCallId = body.toolCallId ?? "test";

  const toolCall = body.message?.toolCalls?.[0];
  if (toolCall) {
    toolCallId = toolCall.id ?? toolCallId;
    let args: Record<string, unknown> = {};
    const rawArgs = toolCall.function?.arguments;
    if (typeof rawArgs === "string") {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = {};
      }
    } else if (rawArgs && typeof rawArgs === "object") {
      args = rawArgs;
    }
    if (typeof args.searchTerm === "string") {
      searchTerm = args.searchTerm;
    }
  } else if (typeof body.searchTerm === "string") {
    searchTerm = body.searchTerm;
  }

  if (!searchTerm.trim()) {
    return NextResponse.json(
      vapiErrorResponse(toolCallId, "No search term provided"),
      { status: 400 },
    );
  }

  try {
    const result = await lookupProducts(searchTerm);
    return NextResponse.json({
      results: [
        {
          toolCallId,
          result: result.summary,
        },
      ],
      // Extra context (not consumed by VAPI but useful for debugging):
      meta: {
        searchTerm: result.searchTerm,
        cached: result.cached,
        fetchedAt: result.fetchedAt,
        productCount: result.products.length,
      },
    });
  } catch (e) {
    console.error("[/api/vapi/lookup-products] error", e);
    return NextResponse.json(
      vapiErrorResponse(
        toolCallId,
        e instanceof Error ? e.message : String(e),
      ),
      { status: 500 },
    );
  }
}

/** Health-check for VAPI's "test webhook" button. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "lookup_products",
    description:
      "POST endpoint — searches Shopify catalog for the customer's query. Returns voice-friendly summary.",
  });
}

function vapiErrorResponse(toolCallId: string, message: string) {
  return {
    results: [
      {
        toolCallId,
        // Even on error, give Maria something to say so she doesn't go silent.
        result: `Sorry, I couldn't pull that up right now — ${message}. Want me to transfer you to our team?`,
      },
    ],
  };
}
