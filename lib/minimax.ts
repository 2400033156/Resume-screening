import axios from "axios";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY!;
const MINIMAX_BASE_URL = (process.env.MINIMAX_BASE_URL ?? "https://api.minimax.io/v1").replace(/\/$/, "");
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M3";

export interface ResumeEvaluation {
  overallScore: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  skills: string[];
  experience: string;
  education: string;
  roles: {
    role: string;
    match: number;
    description: string;
  }[];
}

export async function evaluateResume(resumeText: string): Promise<ResumeEvaluation> {
  const prompt = `You are an expert HR analyst and career counselor. Analyze the following candidate resume and produce a structured recruitment evaluation.

Resume Content:
---
${resumeText.slice(0, 8000)}
---

Respond ONLY with a valid JSON object in this exact format (keep strings concise and professional):
{
  "overallScore": <number 0-100 representing candidate quality>,
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap or area of improvement 1>", "<gap 2>"],
  "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "experience": "<1 sentence summary of candidate experience level>",
  "education": "<highest education qualification>",
  "roles": [
    {
      "role": "<best fitting job role title>",
      "match": <match percentage 0-100>,
      "description": "<one-sentence rationale for this match>"
    },
    {
      "role": "<second best fitting role>",
      "match": <match percentage 0-100>,
      "description": "<one-sentence rationale>"
    },
    {
      "role": "<third best fitting role>",
      "match": <match percentage 0-100>,
      "description": "<one-sentence rationale>"
    }
  ]
}`;

  try {
    const response = await axios.post(
      `${MINIMAX_BASE_URL}/text/chatcompletion_v2`,
      {
        model: MINIMAX_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert HR analyst. Always respond strictly with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${MINIMAX_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const baseResp = response.data?.base_resp;
    if (baseResp && baseResp.status_code !== 0 && baseResp.status_code !== 200) {
      throw new Error(`MiniMax API [${baseResp.status_code}]: ${baseResp.status_msg}`);
    }

    const content: string = response.data?.choices?.[0]?.message?.content || "";
    if (!content) {
      throw new Error("No evaluation response received from AI engine");
    }

    // Strip markdown code fences and extract valid JSON block
    const cleaned = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
    const evaluation = JSON.parse(jsonStr) as ResumeEvaluation;
    return evaluation;
  } catch (error: any) {
    console.error("AI Evaluation API Error:", error?.response?.data || error?.message || error);
    throw new Error(
      error?.response?.data?.base_resp?.status_msg ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to evaluate resume with AI engine"
    );
  }
}
