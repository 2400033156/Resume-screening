"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ResumeUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "screening" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setStatus("idle");
      setErrorMsg("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleScreen = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      // Step 1: Upload
      const formData = new FormData();
      formData.append("resume", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // Step 2: Screen
      setStatus("screening");
      const screenRes = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: uploadData.candidateId }),
      });
      const screenData = await screenRes.json();
      if (!screenRes.ok) throw new Error(screenData.error || "Screening failed");

      setStatus("done");
      setTimeout(() => router.push(`/results/${uploadData.candidateId}`), 800);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during screening");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors mb-3">
          <UploadCloud className="size-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {isDragActive ? "Drop your resume file here" : "Click or drag resume file to upload"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports PDF or TXT formats (up to 5MB)
        </p>
      </div>

      {/* Selected file preview */}
      {file && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-card-foreground">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">Ready</Badge>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => { setFile(null); setStatus("idle"); }}
              aria-label="Remove file"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Progress & Status Indicators */}
      {status === "uploading" && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              Parsing document...
            </span>
            <span>40%</span>
          </div>
          <Progress value={40} />
        </div>
      )}

      {status === "screening" && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              Evaluating experience and role compatibility...
            </span>
            <span>85%</span>
          </div>
          <Progress value={85} />
        </div>
      )}

      {status === "done" && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Evaluation Complete</AlertTitle>
          <AlertDescription className="text-emerald-300/90 text-xs">
            Opening your evaluation report...
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Evaluation Error</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Action button */}
      <Button
        onClick={handleScreen}
        disabled={!file || status === "uploading" || status === "screening" || status === "done"}
        size="lg"
        className="w-full font-semibold"
      >
        {status === "uploading" || status === "screening" ? (
          <>
            <Loader2 className="animate-spin" data-icon="inline-start" />
            Analyzing Resume...
          </>
        ) : (
          "Analyze My Resume"
        )}
      </Button>
    </div>
  );
}
