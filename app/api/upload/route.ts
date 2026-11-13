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
    const buffer = Buffer.from(bytes);

    let rawText = "";

    if (file.type === "application/pdf") {
      // Dynamic import for pdf-parse (supports both v2 class API and v1 function API)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule: any = await import("pdf-parse");

      if (typeof pdfModule.PDFParse === "function") {
        const parser = new pdfModule.PDFParse({ data: buffer });
        const result = await parser.getText();
        rawText = result.text || "";
      } else if (typeof pdfModule.default === "function") {
        const result = await pdfModule.default(buffer);
        rawText = result.text || "";
      } else if (typeof pdfModule === "function") {
        const result = await pdfModule(buffer);
        rawText = result.text || "";
      } else {
        throw new Error("Unable to initialize PDF parser engine");
      }
    } else {
      rawText = buffer.toString("utf-8");
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ error: "Could not extract text from file. Please ensure the file is not scanned/image-only." }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        rawText: rawText.slice(0, 10000), // Limit stored text
        status: "pending",
      },
    });

    return NextResponse.json({ candidateId: candidate.id, fileName: candidate.fileName }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}
