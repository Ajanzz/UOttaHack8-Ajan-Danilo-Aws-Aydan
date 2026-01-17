import type { ApiResult, ComplaintInput } from "./types";
import { mockAnalyzeComplaint } from "./mock";

const API_BASE = "http://localhost:8001";

export async function analyzeComplaint(payload: ComplaintInput): Promise<ApiResult> {
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    console.warn("API unavailable, using mock data.");
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockAnalyzeComplaint(payload);
  }
}