from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from app.config import settings
from app.schemas import ComplaintInput, StructuredFeedback, FollowupSurveyDraft, ActionPlan

def _llm():
    return ChatOpenAI(
        model=settings.OPENAI_MODEL,
        api_key=settings.OPENAI_API_KEY,
        temperature=0.6,
    )

async def generate_structured_feedback(inp: ComplaintInput) -> StructuredFeedback:
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a product analytics assistant. Convert a customer complaint into a structured support/VoC record. "
         "Be conservative, avoid guessing unknown facts. Use the provided enums."),
        ("user",
         "Complaint: {complaint}\nChannel: {channel}\nJourney stage: {journeyStage}\n"
         "Language: {language}\nOrder ID: {orderId}\nContact: {emailOrPhone}\n\n"
         "Return a structured object."),
    ])
    chain = prompt | _llm().with_structured_output(StructuredFeedback)
    return await chain.ainvoke(inp.model_dump())

async def generate_followup_survey(structured: StructuredFeedback) -> FollowupSurveyDraft:
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You design gamified 'Pulse Check' micro-surveys.\n"
         "RULES:\n"
         "1. Generate exactly 3 questions.\n"
         "2. ALL questions must be type 'scale_1_5'.\n"
         "3. DO NOT use text or single_choice questions.\n"
         "4. DO NOT mention numbers (e.g. 'Scale of 1-5') in the prompt. The UI uses emojis.\n"
         "5. Be CONTEXT-SPECIFIC."),
        ("user",
         "Structured feedback:\n{structured}\n\nCreate the Pulse Checks."),
    ])
    chain = prompt | _llm().with_structured_output(FollowupSurveyDraft)
    return await chain.ainvoke({"structured": structured.model_dump()})

async def generate_action_plan(structured: StructuredFeedback, survey: FollowupSurveyDraft) -> ActionPlan:
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a high-efficiency Technical Program Manager. Triage the feedback into a Sprint Backlog.\n"
         "### RULES\n"
         "1. Limit: MAX 3 tickets total. Mix roles (PM, SWE, Labor) based on context.\n"
         "2. Brevity: 1 sentence descriptions. Max 2 bullet points AC.\n"),
        ("user",
         "Structured feedback:\n{structured}\n\nFollow-up survey draft:\n{survey}\n\n"
         "Generate the backlog now."),
    ])
    chain = prompt | _llm().with_structured_output(ActionPlan)
    return await chain.ainvoke({
        "structured": structured.model_dump(),
        "survey": survey.model_dump(),
    })