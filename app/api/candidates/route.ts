import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidates = await prisma.candidate.findMany({
      where: { userId: session.user.id },
      include: { evaluation: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      candidates.map((c) => ({
        id: c.id,
        fileName: c.fileName,
        fileSize: c.fileSize,
        status: c.status,
        createdAt: c.createdAt,
        evaluation: c.evaluation
          ? {
              overallScore: c.evaluation.overallScore,
              summary: c.evaluation.summary,
              strengths: JSON.parse(c.evaluation.strengths),
              gaps: JSON.parse(c.evaluation.gaps),
              skills: JSON.parse(c.evaluation.skills),
              roles: JSON.parse(c.evaluation.roles),
              experience: c.evaluation.experience,
              education: c.evaluation.education,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

