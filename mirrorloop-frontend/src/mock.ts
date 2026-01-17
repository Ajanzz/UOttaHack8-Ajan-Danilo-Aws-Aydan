import type { ApiResult, ComplaintInput } from "./types";

export function mockAnalyzeComplaint(input: ComplaintInput): ApiResult {
  return {
    caseId: "CASE-123456",
    createdAt: new Date().toISOString(),
    
    structured: {
      journey_stage: input.journeyStage,
      issue_type: "bug",
      emotion: "frustrated",
      severity: 3,
      summary: "Customer reported a checkout freeze issue.",
      evidence_quotes: [
        `"${input.complaint.slice(0, 50)}..."`,
        "“The button just kept spinning.”"
      ],
      followup_needed: true,
    },

    surveyDraft: {
      title: "Checkout Issues Follow-up",
      questions: [
        {
          prompt: "Did this prevent you from completing your purchase?",
          type: "single_choice",
          choices: ["Yes", "No, I tried again", "No, I gave up"]
        },
        {
          prompt: "How satisfied are you with the resolution?",
          type: "scale_1_5"
        }
      ]
    },

    actionPlan: {
      top_theme: "Functional Bug",
      recommended_action: "Investigate payment gateway timeouts.",
      owner: "Product",
      tickets: [
        {
          ticket_id: "TKT-101",
          role: "Product Manager",
          priority: "P1",
          summary: "Define failure states for Checkout",
          description: "Users are seeing infinite spinners.",
          acceptance_criteria: ["Error message specs defined", "Timeout threshold set"]
        },
        {
          ticket_id: "TKT-102",
          role: "Software Engineer",
          priority: "P0",
          summary: "Fix infinite loading state",
          description: "Investigate frontend promise handling.",
          acceptance_criteria: ["Spinner stops after 5s", "Retry button appears"]
        }
      ]
    },

    surveymonkey: {
      survey_id: "mock-id",
      collector_id: "mock-collector",
      weblink_url: "https://www.surveymonkey.com/r/example-link"
    }
  };
}