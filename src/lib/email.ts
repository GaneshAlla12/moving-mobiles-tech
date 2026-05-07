/**
 * Tiny email sender.
 *
 * - If RESEND_API_KEY is set, sends a real email via Resend (https://resend.com).
 * - If not, prints the email to the server console so the developer can
 *   click the link manually during setup.
 *
 * To enable real sending:
 *   1. Sign up at resend.com (free 3,000 emails/month)
 *   2. Get API key → add to Vercel env as RESEND_API_KEY
 *   3. Add a verified sender address to Vercel env as RESEND_FROM
 *      (or skip; falls back to "Moving Mobiles <onboarding@resend.dev>")
 */

const RESEND_FROM_DEFAULT =
  "Moving Mobiles <onboarding@resend.dev>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{
  ok: boolean;
  via: "resend" | "console";
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? RESEND_FROM_DEFAULT;

  // No email service configured → log so dev can grab the link
  if (!apiKey) {
    console.log("\n========== EMAIL (console fallback) ==========");
    console.log("To     :", input.to);
    console.log("Subject:", input.subject);
    if (input.text) {
      console.log("Body   :", input.text);
    } else {
      console.log("HTML   :", input.html.slice(0, 500), "...");
    }
    console.log("==============================================\n");
    return { ok: true, via: "console" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error:", res.status, body);
      return { ok: false, via: "resend", error: `${res.status}: ${body}` };
    }
    return { ok: true, via: "resend" };
  } catch (err) {
    console.error("[email] Resend exception:", err);
    return {
      ok: false,
      via: "resend",
      error: err instanceof Error ? err.message : "send failed",
    };
  }
}
