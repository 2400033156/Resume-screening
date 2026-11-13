import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and TXT files are supported" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    let rawText = "";

    if (file.type === "application/pdf") {
      try {
        const { extractText } = await import("unpdf");
        const parsed = await extractText(new Uint8Array(bytes));
        const textArray = Array.isArray(parsed.text) ? parsed.text : [String(parsed.text || "")];
        rawText = textArray.join("\n\n").trim();
      } catch (err: any) {
        console.error("PDF extraction error with unpdf:", err?.message || err);
      }
    } else {
      rawText = Buffer.from(bytes).toString("utf-8");
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from your file. Please ensure the document is not an image-only scan or encrypted.",
        },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        rawText: rawText.slice(0, 15000), // Store up to 15,000 chars
        status: "pending",
      },
    });

    return NextResponse.json(
      { candidateId: candidate.id, fileName: candidate.fileName },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Upload error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to process resume upload" },
      { status: 500 }
    );
  }
}
