// src/mock.ts
import type { ApiResult, ComplaintInput, ActionPlan, StructuredFeedback, FollowupSurveyDraft } from "./types";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function mockAnalyzeComplaint(input: ComplaintInput): ApiResult {
  const issue = pick(["ux", "bug", "service", "pricing", "inventory", "delivery", "other"] as const);
  const emotion = pick(["neutral", "annoyed", "frustrated", "angry"] as const);
  const severity = pick([2, 3, 4, 5] as const);

  const summary =
    input.complaint.length > 120
      ? input.complaint.slice(0, 120).trim() + "…"
      : input.complaint.trim();

  const evidence_quotes: string[] = [
    input.complaint.split(".")[0]?.slice(0, 90).trim() || input.complaint.slice(0, 90),
    pick([
      "“I tried multiple times and it didn’t work.”",
      "“It was confusing and took too long.”",
      "“I expected better for the price.”",
      "“Support didn’t resolve my issue.”",
    ] as const),
  ];

  const followup_needed = severity >= 4 || emotion === "angry" || issue === "bug";

  const surveyDraft: FollowupSurveyDraft = {
    title: "Quick follow-up (10 seconds)",
    questions: [
      {
        prompt:
          issue === "bug"
            ? "Did this issue block you from completing your task?"
            : "What was the main reason you felt dissatisfied?",
        type: "single_choice",
        choices:
          issue === "bug"
            ? ["Yes, totally blocked", "Partially blocked", "No, just annoying"]
            : ["Too slow", "Too expensive", "Confusing", "Out of stock", "Support issue", "Other"],
      },
      {
        prompt: "How would you rate your experience overall?",
        type: "scale_1_5",
      },
    ],
  };

  const owner: ActionPlan["owner"] =
    issue === "delivery"
      ? "Delivery"
      : issue === "service"
        ? "Store Ops"
        : issue === "bug" || issue === "ux"
          ? "Product"
          : "Support";

  const actionPlan: ActionPlan = {
    top_theme:
      issue === "ux"
        ? "UX friction"
        : issue === "bug"
          ? "Functional break"
          : issue === "delivery"
            ? "Delivery experience"
            : "Customer satisfaction",
    recommended_action:
      issue === "bug"
        ? "Create a priority bug ticket with repro context and customer impact."
        : issue === "ux"
          ? "Run a quick UX audit on this journey stage and reduce steps."
          : issue === "pricing"
            ? "Review price perception and consider clearer value messaging."
            : issue === "inventory"
              ? "Improve stock visibility and suggest in-stock alternatives."
              : "Route to the right owner and acknowledge the customer quickly.",
    owner,
    impact: severity >= 4 ? "high" : "medium",
    effort: issue === "bug" ? "medium" : "low",
    ticket_draft: {
      title: `[MirrorLoop] ${input.journeyStage} - ${issue.toUpperCase()} - Severity ${severity}`,
      body: [
        `Channel: ${input.channel}`,
        `Journey stage: ${input.journeyStage}`,
        ...(input.orderId ? [`Order ID: ${input.orderId}`] : []),
        "",
        "Customer summary:",
        summary,
        "",
        "Evidence quotes:",
        ...evidence_quotes.map((q) => `- ${q}`),
        "",
        "Suggested next step:",
        "Validate repro, confirm scope, and ship a fix or mitigation. Reply with an acknowledgement message.",
      ].join("\n"),
    },
  };

  const structured: StructuredFeedback = {
    journey_stage: input.journeyStage,
    issue_type: issue,
    emotion,
    severity,
    summary,
    evidence_quotes,
    followup_needed,
    followup_goal: followup_needed ? "Clarify impact and capture rating quickly" : undefined,
  };

  return {
    caseId: `CASE-${Math.floor(100000 + Math.random() * 900000)}`,
    structured,
    surveyDraft,
    actionPlan,
    createdAt: new Date().toISOString(),
  };
}
