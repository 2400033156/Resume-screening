import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResumeUploader from "@/components/ResumeUploader";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  FolderOpen,
  ArrowUpRight,
  TrendingUp,
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

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1 text-[11px]">
          <CheckCircle2 className="size-3" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="border-amber-500/30 text-amber-400 gap-1 text-[11px]">
          <Loader2 className="size-3 animate-spin" />
          Evaluating
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="border-destructive/30 text-destructive gap-1 text-[11px]">
          <AlertCircle className="size-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 text-[11px]">
          <Clock className="size-3" />
          Pending
        </Badge>
      );
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const candidates = await prisma.candidate.findMany({
    where: { userId: session.user.id },
    include: { evaluation: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const completedCount = candidates.filter((c) => c.status === "completed").length;
  const scoredCandidates = candidates.filter((c) => c.evaluation);
  const avgScore =
    scoredCandidates.length > 0
      ? Math.round(
          scoredCandidates.reduce((sum, c) => sum + (c.evaluation?.overallScore ?? 0), 0) /
            scoredCandidates.length
        )
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Upload resumes to evaluate role fits, view your scores, and track your evaluation history.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Resumes Uploaded
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total files uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Evaluations
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Reports generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Average Match Score
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgScore !== null ? `${avgScore} / 100` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all evaluations</p>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Section: Uploader + Recent History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Screen New Resume</CardTitle>
            <CardDescription className="text-xs">
              Upload a PDF or TXT file to evaluate role compatibility and skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ResumeUploader />
          </CardContent>
        </Card>

        {/* Recent Evaluations Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Recent Evaluations</CardTitle>
              <CardDescription className="text-xs">
                Your past resume screenings and evaluation scores
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/analytics" />}
              className="text-xs"
            >
              Analytics
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1">
            {candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                  <FolderOpen className="size-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">No resumes uploaded yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                  Upload your first resume using the form on the left to get started.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-xs font-medium text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                          {c.fileName}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {c.evaluation && (
                        <span className="font-mono text-xs font-bold text-foreground">
                          {c.evaluation.overallScore}%
                        </span>
                      )}
                      {getStatusBadge(c.status)}

                      {c.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          nativeButton={false}
                          render={<Link href={`/results/${c.id}`} />}
                          aria-label="View evaluation results"
                        >
                          <ChevronRight className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
