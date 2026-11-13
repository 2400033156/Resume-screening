"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Award,
  Loader2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  total: number;
  completed: number;
  avgScore: number;
  topRoles: { role: string; count: number }[];
  scoreDistribution: { range: string; count: number }[];
  recentResumes: {
    id: string;
    fileName: string;
    status: string;
    score: number | null;
    createdAt: string;
  }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "oklch(0.65 0.18 200)",
  "oklch(0.7 0.17 150)",
  "oklch(0.75 0.16 80)",
  "oklch(0.65 0.22 30)",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center text-sm text-muted-foreground">
        Failed to load screening analytics. Please check your connection and refresh.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Screening Analytics
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Track compatibility trends, role match frequencies, and score distributions across all your evaluations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Resumes
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Uploaded for screening</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Evaluations
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completed}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Successfully analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Average Score
            </CardTitle>
            <Award className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgScore ? `${data.avgScore} / 100` : "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Overall compatibility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Matched Role
            </CardTitle>
            <BarChart3 className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold truncate">
              {data.topRoles[0]?.role || "—"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Most frequent match</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Distribution Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription className="text-xs">
              Resume compatibility scores grouped by performance ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[240px]">
            {data.scoreDistribution.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.scoreDistribution}>
                  <XAxis
                    dataKey="range"
                    stroke="currentColor"
                    className="text-[11px] text-muted-foreground"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-[11px] text-muted-foreground"
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="currentColor"
                    className="fill-primary"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                No score distribution data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Roles Distribution */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Role Recommendation Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Most frequently recommended job positions across your resumes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center min-h-[240px]">
            {data.topRoles.length > 0 ? (
              <div className="flex w-full flex-col sm:flex-row items-center gap-6">
                <div className="size-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topRoles}
                        dataKey="count"
                        nameKey="role"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
                      >
                        {data.topRoles.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                          color: "var(--foreground)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-1 flex-col gap-2 w-full">
                  {data.topRoles.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-foreground truncate">{r.role}</span>
                      </div>
                      <span className="font-mono text-muted-foreground ml-2">
                        {r.count} matches
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                No role recommendation data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations Table using shadcn Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evaluation History</CardTitle>
          <CardDescription className="text-xs">
            Review detailed reports from previous resume evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FolderOpen className="size-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No evaluation records yet.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Resume File</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Match Score</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentResumes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-xs max-w-[200px] truncate">
                        {r.fileName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.status === "completed" ? "outline" : "secondary"}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold">
                        {r.score !== null ? `${r.score}%` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            render={<Link href={`/results/${r.id}`} />}
                            className="text-xs"
                          >
                            View Report
                            <ExternalLink data-icon="inline-end" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
