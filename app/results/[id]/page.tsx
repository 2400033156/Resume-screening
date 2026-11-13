import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  Award,
  Code2,
  Target,
  Brain,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface RoleMatch {
  role: string;
  match: number;
  description: string;
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const candidate = await prisma.candidate.findFirst({
    where: { id, userId: session.user.id },
    include: { evaluation: true },
  });

  if (!candidate || !candidate.evaluation) notFound();

  const ev = candidate.evaluation;
  const strengths: string[] = JSON.parse(ev.strengths || "[]");
  const gaps: string[] = JSON.parse(ev.gaps || "[]");
  const skills: string[] = JSON.parse(ev.skills || "[]");
  const roles: RoleMatch[] = JSON.parse(ev.roles || "[]");

  const scoreColor =
    ev.overallScore >= 75
      ? "text-emerald-500"
      : ev.overallScore >= 50
      ? "text-amber-500"
      : "text-destructive";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard" />}
          className="text-xs"
        >
          <ArrowLeft data-icon="inline-start" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main Score Hero Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
          {/* Score Indicator */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-muted/30 p-6 shrink-0 size-36 text-center">
            <span className={`text-5xl font-black tracking-tight ${scoreColor}`}>
              {ev.overallScore}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
              Match Score
            </span>
          </div>

          {/* Candidate Overview */}
          <div className="flex flex-col gap-3 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Brain className="size-3 text-primary" />
                Role Fit Report
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Evaluation Report
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {candidate.fileName}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {ev.summary}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-muted-foreground">
              {ev.experience && (
                <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 bg-background">
                  <Briefcase className="size-3.5 text-primary" />
                  <span>{ev.experience}</span>
                </div>
              )}
              {ev.education && (
                <div className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 bg-background">
                  <GraduationCap className="size-3.5 text-primary" />
                  <span>{ev.education}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best-Fit Roles Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Recommended Job Roles
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {roles.map((r, i) => (
            <Card key={i} className={i === 0 ? "border-primary/50 shadow-sm" : ""}>
              <CardHeader className="flex flex-col gap-1.5 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={i === 0 ? "default" : "secondary"} className="text-[10px]">
                    {i === 0 ? "Top Recommendation" : `Option #${i + 1}`}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {r.match}%
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold">{r.role}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed min-h-[48px]">
                  {r.description}
                </p>
                <div className="flex flex-col gap-1">
                  <Progress value={r.match} />
                  <span className="text-[10px] text-muted-foreground text-right font-medium">
                    Match Score
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Strengths & Areas to Improve Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Strengths Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <CardTitle className="text-sm font-semibold">Key Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-0.5">
                    ✓
                  </span>
                  <span className="text-foreground leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Gaps / Areas to Improve Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <AlertCircle className="size-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold">Areas for Development</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              {gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mt-0.5 font-bold">
                    !
                  </span>
                  <span className="text-foreground leading-relaxed">{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Skills Extracted */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <Code2 className="size-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Detected Candidate Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
