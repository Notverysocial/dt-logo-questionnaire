import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const runtime = "nodejs";

// GET /api/submissions
// Auth: Authorization: Bearer <ADMIN_TOKEN>
// Returns: { count, submissions: [{url, pathname, uploadedAt, size, data}] }
//
// data is the parsed JSON of each blob. Lists everything under submissions/ prefix.
export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured on server" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization") || "";
  const provided = auth.replace(/^Bearer\s+/i, "").trim();
  if (provided !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured" },
      { status: 500 }
    );
  }

  try {
    const { blobs } = await list({ prefix: "dt-logo-submissions/" });

    // Sort newest first
    const sorted = [...blobs].sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    // Fetch each blob's content and parse
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN!;
    const submissions = await Promise.all(
      sorted.map(async (b) => {
        try {
          const res = await fetch(b.url, {
            headers: { Authorization: `Bearer ${blobToken}` },
          });
          const data = await res.json();
          return {
            url: b.url,
            pathname: b.pathname,
            uploadedAt: b.uploadedAt,
            size: b.size,
            data,
          };
        } catch (err) {
          return {
            url: b.url,
            pathname: b.pathname,
            uploadedAt: b.uploadedAt,
            size: b.size,
            data: null,
            error: String(err),
          };
        }
      })
    );

    return NextResponse.json({
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list submissions", detail: String(err) },
      { status: 500 }
    );
  }
}
