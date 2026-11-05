import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const submissionsDirectory = path.join(process.cwd(), "data");
const submissionsFile = path.join(submissionsDirectory, "contact-submissions.json");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return NextResponse.json({ error: "Please provide a valid name, email, and message." }, { status: 400 });
    }

    await mkdir(submissionsDirectory, { recursive: true });
    let submissions: unknown[] = [];
    try {
      submissions = JSON.parse(await readFile(submissionsFile, "utf8"));
    } catch {
      submissions = [];
    }
    submissions.push({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
    await appendFile(submissionsFile + ".tmp", JSON.stringify(submissions, null, 2), "utf8");
    const { rename } = await import("node:fs/promises");
    await rename(submissionsFile + ".tmp", submissionsFile);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to submit your message." }, { status: 500 });
  }
}
