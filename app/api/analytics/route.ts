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

    const total = candidates.length;
    const completed = candidates.filter((c) => c.status === "completed").length;
    const avgScore =
      completed > 0
        ? Math.round(
            candidates
              .filter((c) => c.evaluation)
              .reduce((sum, c) => sum + (c.evaluation?.overallScore ?? 0), 0) / completed
          )
        : 0;

    // Top roles across all evaluations
    const roleCounts: Record<string, number> = {};
    candidates
      .filter((c) => c.evaluation?.roles)
      .forEach((c) => {
        try {
          const roles = JSON.parse(c.evaluation!.roles) as { role: string }[];
          roles.slice(0, 1).forEach((r) => {
            roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
          });
        } catch {}
      });

    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({ role, count }));

    // Score distribution
    const scoreDistribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];
    candidates.filter((c) => c.evaluation).forEach((c) => {
      const score = c.evaluation!.overallScore;
      if (score <= 20) scoreDistribution[0].count++;
      else if (score <= 40) scoreDistribution[1].count++;
      else if (score <= 60) scoreDistribution[2].count++;
      else if (score <= 80) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });

    return NextResponse.json({
      total,
      completed,
      avgScore,
      topRoles,
      scoreDistribution,
      recentResumes: candidates.slice(0, 5).map((c) => ({
        id: c.id,
        fileName: c.fileName,
        status: c.status,
        score: c.evaluation?.overallScore ?? null,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

