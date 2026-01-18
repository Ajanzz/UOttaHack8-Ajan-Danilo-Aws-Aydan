export type ComplaintInput = {
  complaint: string;
  channel: "web" | "mobile" | "in_store" | "delivery";
  journeyStage: "browse" | "product" | "checkout" | "support" | "returns" | "other";
  language: "English" | "French" | "Arabic" | "Other";
  orderId?: string;
  emailOrPhone?: string;
  wpm?: number;
};

export type StructuredFeedback = {
  journey_stage: string;
  issue_type: "ux" | "bug" | "service" | "pricing" | "inventory" | "delivery" | "other";
  emotion: "neutral" | "annoyed" | "frustrated" | "angry";
  severity: 1 | 2 | 3 | 4 | 5;
  summary: string;
  evidence_quotes: string[];
  followup_needed: boolean;
  followup_goal?: string;
};

export type FollowupSurveyDraft = {
  title: string;
  questions: Array<{
    prompt: string;
    type: "single_choice" | "scale_1_5" | "short_text";
    choices?: string[];
  }>;
};

export type JiraTicket = {
  ticket_id: string;
  role: "Product Manager" | "Software Engineer" | "Field Operations";
  summary: string;
  description: string;
  acceptance_criteria: string[];
  priority: "P0" | "P1" | "P2" | "P3";
};
export type ActionPlan = {
  top_theme: string;
  recommended_action: string;
  owner: "Store Ops" | "Product" | "Support" | "Delivery" | "Unknown";
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  tickets: JiraTicket[];
};

export type ApiResult = {
  caseId: string;
  structured: StructuredFeedback;
  surveyDraft: FollowupSurveyDraft;
  actionPlan: ActionPlan;
  createdAt: string; // ISO
  surveymonkey?: SurveyMonkeyInfo;
};

export type SurveyMonkeyInfo = {
  survey_id: string | null;
  collector_id: string | null;
  weblink_url: string | null;
};