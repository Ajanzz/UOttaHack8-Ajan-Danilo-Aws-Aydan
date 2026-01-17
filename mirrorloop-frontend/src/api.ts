import type { ApiResult, ComplaintInput } from "./types";
import { mockAnalyzeComplaint } from "./mock";

const API_BASE = "http://localhost:8001";

export async function analyzeComplaint(payload: ComplaintInput): Promise<ApiResult> {
  // If backend isn't running, return a mock so the demo always works.
  // We still TRY the backend first to be real when available.
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Fall back to mock if backend returns error
      return mockAnalyzeComplaint(payload);
    }

    return await res.json();
  } catch {
    return mockAnalyzeComplaint(payload);
  }
}

// src/api.ts

export async function submitVote(survey_id: string, collector_id: string, score: number, question_index: number = 0) {
  try {
    await fetch(`http://localhost:8001/api/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ survey_id, collector_id, score, question_index }),
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// src/api.ts

export type SurveyAnswer = {
  question: string;
  answer: string;
  timestamp: string;
};

export async function fetchSurveyAnswers(surveyId: string): Promise<SurveyAnswer[]> {
  try {
    const res = await fetch(`http://localhost:8001/api/answers/${surveyId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}
