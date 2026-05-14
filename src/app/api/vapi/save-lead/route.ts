import { NextResponse } from "next/server";
import { appendLead } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * VAPI tool endpoint — `save_customer_lead`.
 *
 * Replaces the slow n8n AI-Agent path for saving leads. Maria's tool call
 * lands directly here, appends a row to the "Customer Leads" Google Sheet,
 * and returns success in ~300-500ms.
 *
 * VAPI tool-call payload shape:
 *   {
 *     "message": {
 *       "type": "tool-calls",
 *       "toolCalls": [{
 *         "id": "...",
 *         "function": {
 *           "name": "save_customer_lead",
 *           "arguments": {
 *             "customerName": "Mark",
 *             "phoneNumber": "2407286051",
 *             "email": "mark123@gmail.com",
 *             "customerRequest": "BUYING - iPhone 17 Purple 256GB"
 *           }
 *         }
 *       }]
 *     }
 *   }
 *
 * Test shape:
 *   { "customerName": "...", "phoneNumber": "...", "email": "...", "customerRequest": "..." }
 *
 * Response shape (VAPI custom-tool standard):
 *   { "results": [{ "toolCallId": "...", "result": "Lead saved." }] }
 */

type SaveArgs = {
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  customerRequest?: string;
};

type VAPIBody = {
  message?: {
    type?: string;
    toolCalls?: Array<{
      id?: string;
      function?: {
        name?: string;
        arguments?: SaveArgs | string;
      };
    }>;
  };
  toolCallId?: string;
} & SaveArgs;

export async function POST(req: Request) {
  let body: VAPIBody;
  try {
    body = (await req.json()) as VAPIBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let toolCallId = body.toolCallId ?? "test";
  let args: SaveArgs = {
    customerName: body.customerName,
    phoneNumber: body.phoneNumber,
    email: body.email,
    customerRequest: body.customerRequest,
  };

  const toolCall = body.message?.toolCalls?.[0];
  if (toolCall) {
    toolCallId = toolCall.id ?? toolCallId;
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
  }

  // Normalize "blank" string back to empty (Maria sends "blank" when unknown).
  const normalize = (v: string | undefined): string => {
    if (!v) return "";
    const trimmed = v.trim();
    if (trimmed.toLowerCase() === "blank") return "";
    return trimmed;
  };

  const customerName = normalize(args.customerName);
  const phoneNumber = normalize(args.phoneNumber);
  const email = normalize(args.email);
  const customerRequest = normalize(args.customerRequest);

  // Customer Request is the one field that MUST be set so staff has context.
  if (!customerRequest) {
    return NextResponse.json(
      vapiErrorResponse(
        toolCallId,
        "Customer request is empty — cannot save lead without context",
      ),
      { status: 400 },
    );
  }

  try {
    const result = await appendLead({
      customerName,
      phoneNumber,
      email,
      customerRequest,
    });
    return NextResponse.json({
      results: [
        {
          toolCallId,
          result: "Lead saved successfully.",
        },
      ],
      meta: { rowIndex: result.rowIndex },
    });
  } catch (e) {
    console.error("[/api/vapi/save-lead] error", e);
    return NextResponse.json(
      vapiErrorResponse(
        toolCallId,
        e instanceof Error ? e.message : String(e),
      ),
      { status: 500 },
    );
  }
}

/** Health-check. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "save_customer_lead",
    description:
      "POST endpoint — appends a customer lead row to the Customer Leads sheet. Returns success status.",
  });
}

function vapiErrorResponse(toolCallId: string, message: string) {
  return {
    results: [
      {
        toolCallId,
        result: `Couldn't save the lead — ${message}. Please let our team know directly.`,
      },
    ],
  };
}
