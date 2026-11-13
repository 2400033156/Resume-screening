import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateResume } from "@/lib/minimax";

export async function POST(req: NextRequest) {
  let candidateId: string | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    candidateId = body?.candidateId;

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, userId: session.user.id },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (candidate.status === "completed") {
      const evaluation = await prisma.evaluation.findUnique({
        where: { candidateId },
      });
      if (evaluation) {
        return NextResponse.json({
          evaluation: {
            ...evaluation,
            strengths: JSON.parse(evaluation.strengths || "[]"),
            gaps: JSON.parse(evaluation.gaps || "[]"),
            skills: JSON.parse(evaluation.skills || "[]"),
            roles: JSON.parse(evaluation.roles || "[]"),
          },
          cached: true,
        });
      }
    }

    // Update status to processing
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "processing" },
    });

    // Call MiniMax AI
    const result = await evaluateResume(candidate.rawText);

    // Upsert evaluation (in case of retry)
    const evaluation = await prisma.evaluation.upsert({
      where: { candidateId },
      update: {
        overallScore: result.overallScore,
        summary: result.summary,
        strengths: JSON.stringify(result.strengths),
        gaps: JSON.stringify(result.gaps),
        skills: JSON.stringify(result.skills),
        roles: JSON.stringify(result.roles),
        experience: result.experience,
        education: result.education,
      },
      create: {
        candidateId,
        overallScore: result.overallScore,
        summary: result.summary,
        strengths: JSON.stringify(result.strengths),
        gaps: JSON.stringify(result.gaps),
        skills: JSON.stringify(result.skills),
        roles: JSON.stringify(result.roles),
        experience: result.experience,
        education: result.education,
      },
    });

    // Mark as completed
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "completed" },
    });

    return NextResponse.json({
      evaluation: {
        ...evaluation,
        strengths: result.strengths,
        gaps: result.gaps,
        skills: result.skills,
        roles: result.roles,
      },
    });
  } catch (err: any) {
    console.error("Screening error:", err?.message || err);
    if (candidateId) {
      await prisma.candidate.update({
        where: { id: candidateId },
        data: { status: "failed" },
      }).catch(() => {});
    }
    return NextResponse.json(
      { error: err?.message || "AI evaluation failed" },
      { status: 500 }
    );
  }
}
