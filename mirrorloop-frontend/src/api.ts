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
