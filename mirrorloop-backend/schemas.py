from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class ComplaintInput(BaseModel):
    complaint: str = Field(min_length=1, max_length=4000)
    channel: Literal["web", "mobile", "in_store", "delivery"]
    journeyStage: Literal["browse", "product", "checkout", "support", "returns", "other"]
    language: Literal["English", "French", "Arabic", "Other"]
    orderId: Optional[str] = None
    emailOrPhone: Optional[str] = None

class StructuredFeedback(BaseModel):
    journey_stage: str
    issue_type: Literal["ux", "bug", "service", "pricing", "inventory", "delivery", "other"]
    emotion: Literal["neutral", "annoyed", "frustrated", "angry"]
    severity: Literal[1, 2, 3, 4, 5]
    summary: str
    evidence_quotes: List[str]
    followup_needed: bool
    followup_goal: Optional[str] = None

class SurveyQuestion(BaseModel):
    prompt: str
    type: Literal["single_choice", "scale_1_5", "short_text"]
    choices: Optional[List[str]] = None

class FollowupSurveyDraft(BaseModel):
    title: str
    questions: List[SurveyQuestion]

class JiraTicket(BaseModel):
    ticket_id: str = Field(description="e.g. TKT-001")
    role: Literal["Product Manager", "Software Engineer", "Field Operations"]
    summary: str = Field(description="Concise title")
    description: str = Field(description="1 sentence context")
    acceptance_criteria: List[str] = Field(description="Definition of done")
    priority: Literal["P0", "P1", "P2", "P3"]

class ActionPlan(BaseModel):
    top_theme: str
    recommended_action: str
    owner: Literal["Store Ops", "Product", "Support", "Delivery", "Unknown"]
    impact: Literal["low", "medium", "high"]
    effort: Literal["low", "medium", "high"]
    tickets: List[JiraTicket]

class SurveyMonkeyInfo(BaseModel):
    survey_id: Optional[str] = None
    collector_id: Optional[str] = None
    weblink_url: Optional[str] = None

class ApiResult(BaseModel):
    caseId: str
    structured: StructuredFeedback
    surveyDraft: FollowupSurveyDraft
    actionPlan: ActionPlan
    createdAt: str
    surveymonkey: Optional[SurveyMonkeyInfo] = None

class VoteInput(BaseModel):
    survey_id: str
    collector_id: str
    score: int 
    question_index: int = 0