import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { put } from "@vercel/blob";
import type { DTLogoSubmission } from "../../../lib/intake-schema";
import {
  VISUAL_PAIRS,
  PRIMARY_FOR_OPTIONS,
  PRIMARY_TEXT_OPTIONS,
} from "../../../lib/intake-schema";

export const runtime = "nodejs";

const labelFromPrimaryFor = (id: string) =>
  PRIMARY_FOR_OPTIONS.find((o) => o.id === id)?.label || id;
const labelFromPrimaryText = (id: string) =>
  PRIMARY_TEXT_OPTIONS.find((o) => o.id === id)?.label || id;

function renderLogoBrief(data: DTLogoSubmission): string {
  const pairs = VISUAL_PAIRS.map((p) => {
    const choice = data.pairs?.[p.id];
    const opt = choice
      ? p.a.value === choice
        ? p.a
        : p.b.value === choice
        ? p.b
        : null
      : null;
    return opt
      ? `- ${p.question} **${opt.label}** (${opt.desc})`
      : `- ${p.question} (no answer)`;
  }).join("\n");

  return `# DT Logo Preferences — ${data.name || "(no name)"}

_Submitted ${new Date(data.submitted_at).toLocaleString()} by ${data.email} — ${data.role || "(no role)"}_

## Identity
- **One-word energy:** ${data.one_word}
- **Three adjectives:** ${data.three_adjectives}
- **Primary audience:** ${(data.primary_for || []).map(labelFromPrimaryFor).join(", ") || "(none)"}

## Visual style direction
${pairs}

## References
**Loves:**
${data.reference_urls.split("\n").map((r) => `- ${r.trim()}`).join("\n")}

**Avoid:**
${
  data.anti_reference_urls
    ? data.anti_reference_urls.split("\n").map((r) => `- ${r.trim()}`).join("\n")
    : "(none provided)"
}

## Specific elements
- **Primary visible text:** ${labelFromPrimaryText(data.primary_text)}
- **Imagery direction:** ${data.imagery || "(no specific direction)"}
- **Color preferences beyond black + gold:** ${data.color_preferences || "(none provided)"}
- **Avoid:** ${data.avoid || "(none provided)"}

## Final thoughts
${data.final_thoughts || "(none)"}

## Contact
- **Name:** ${data.name}
- **Email:** ${data.email}
- **Role:** ${data.role}
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderHtml(brief: string): string {
  return `<html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
<pre style="white-space: pre-wrap; word-wrap: break-word; font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.55;">${escapeHtml(
    brief
  )}</pre>
</body></html>`;
}

function slugify(s: string): string {
  return (s || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  let body: DTLogoSubmission;
  try {
    body = (await req.json()) as DTLogoSubmission;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic validation
  if (!body.email || !body.name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const brief = renderLogoBrief(body);
  const html = renderHtml(brief);

  // Log to server (always — captured by Vercel logs)
  console.log("=== NEW DT LOGO SUBMISSION ===");
  console.log("From:", body.email);
  console.log("Name:", body.name);
  console.log(brief);

  // Persist submission to Vercel Blob if configured (durable storage)
  let blobUrl: string | null = null;
  let blobError: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const ts = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19);
      const filename = `dt-logo-submissions/${ts}_${slugify(body.name)}_${slugify(body.email)}.json`;
      const result = await put(
        filename,
        JSON.stringify({ ...body, _brief: brief }, null, 2),
        {
          // Store is Private; SDK 0.27 types only accept "public" but runtime needs "private"
          access: "private" as unknown as "public",
          addRandomSuffix: true,
          contentType: "application/json",
        }
      );
      blobUrl = result.url;
      console.log("Saved to blob:", blobUrl);
    } catch (err) {
      blobError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error("Blob save failed:", blobError);
      // Don't fail the submission — logs still capture it
    }
  } else {
    console.warn("BLOB_READ_WRITE_TOKEN not set — submission logged but not persisted to Blob.");
  }

  // Send notification email if Resend is configured
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFICATION_EMAIL || "artemisexecutiveclub@gmail.com";
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);

      // Email to Antonio with the brief
      await resend.emails.send({
        from: fromEmail,
        to: notifyEmail,
        replyTo: body.email,
        subject: `DT Logo Questionnaire — ${body.name} (${body.role || "no role"})`,
        html,
        text: brief,
      });

      // Confirmation email back to the submitter
      const firstName = body.name.split(" ")[0] || "";
      await resend.emails.send({
        from: fromEmail,
        to: body.email,
        replyTo: notifyEmail,
        subject: `Got it — your DT logo input is in`,
        text: `Hi ${firstName},

Thanks for filling out the DT logo questionnaire. Antonio will roll your input together with the rest of the team's and send the next round of mockups in the next couple of days.

If anything needs to change, just reply to this email — no need to resubmit the form.

— Driven Talent`,
      });
    } catch (err) {
      console.error("Email send failed:", err);
      // Don't fail the submission — we have the logs as fallback
    }
  } else {
    console.warn(
      "RESEND_API_KEY not set — submission logged but not emailed."
    );
  }

  return NextResponse.json({ ok: true, stored: !!blobUrl, blobError });
}
