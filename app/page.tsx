import Link from "next/link";
import {
  UploadCloud,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 px-4 text-center">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-medium">
            <Brain className="size-3.5 text-primary" />
            AI-Powered Career Intelligence
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-3xl leading-[1.15]">
            Screen Resumes. <br />
            <span className="text-muted-foreground">Match Candidates to Ideal Roles.</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Upload your resume to discover your best-fit job roles, uncover your core strengths, and receive actionable insights to level up your career.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/auth/signup" />}
              className="gap-2"
            >
              Get Started Free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href="/auth/signin" />}
            >
              Sign In
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Instant PDF parsing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Tailored role matching
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Actionable skill feedback
            </span>
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature Grid */}
      <section className="py-16 md:py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-6xl flex flex-col gap-12">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Everything You Need to Advance Your Search
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Get clear, data-driven evaluations of your skills and experience to find where you stand out most.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-col gap-2 pb-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* How it works */}
      <section className="py-16 md:py-24 px-4">
        <div className="mx-auto max-w-4xl flex flex-col gap-10">
          <div className="text-center flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              How It Works
            </h2>
            <p className="text-sm text-muted-foreground">
              Four simple steps from resume upload to comprehensive career insights.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, idx) => (
              <Card key={idx} className="bg-card">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-secondary-foreground">
                    0{idx + 1}
                  </div>
                  <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to find your ideal career fit?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg">
            Create an account in seconds, upload your resume, and get your personalized evaluation report.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/auth/signup" />}
            className="mt-2 gap-2"
          >
            Start Screening Free
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </section>

      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 ResumeAI. All rights reserved.
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: "Comprehensive Evaluation",
    description: "Evaluates your professional background, skills, and accomplishments against real-world job market standards.",
  },
  {
    icon: Target,
    title: "Best-Fit Role Matching",
    description: "Recommends your top 3 matching job roles with compatibility percentages and clear explanations.",
  },
  {
    icon: UploadCloud,
    title: "Instant Document Parsing",
    description: "Upload your resume in PDF or TXT format and get instant text analysis with zero manual data entry.",
  },
  {
    icon: Zap,
    title: "Strengths & Growth Areas",
    description: "Highlights key assets that set you apart along with actionable recommendations to make your resume stronger.",
  },
  {
    icon: BarChart3,
    title: "Screening Analytics",
    description: "Keep track of multiple versions of your resume over time and see how your scores evolve.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description: "Your uploaded resumes and evaluations are stored privately and securely associated with your account.",
  },
];

const steps = [
  { title: "Create Your Account", desc: "Sign up in seconds to access your personal dashboard and save all your evaluations." },
  { title: "Upload Your Resume", desc: "Drag and drop your PDF or plain text resume file for automatic parsing." },
  { title: "AI Analysis", desc: "Our engine evaluates your experience, detects your skills, and benchmarks role fits." },
  { title: "Review Your Report", desc: "Explore your overall score, top 3 recommended job roles, key strengths, and skill gaps." },
];
