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
         "Complaint: {complaint}\n"
         "Typing Speed: {wpm} WPM (Note: High WPM may indicate anger/urgency; low may indicate hesitation/sadness. Use as secondary signal to text.)\n" # <--- UPDATED
         "Channel: {channel}\n"
         "Journey stage: {journeyStage}\n"
         "Language: {language}\n"
         "Order ID: {orderId}\n"
         "Contact: {emailOrPhone}\n\n"
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
         "5. Be CONTEXT-SPECIFIC. (e.g., Question 1: 'Rate the driver', Question 2: 'Rate the food temp', Question 3: 'Rate the app speed')."),
        ("user",
         "Structured feedback:\n{structured}\n\n"
         "Create the Pulse Checks."),
    ])
    chain = prompt | _llm().with_structured_output(FollowupSurveyDraft)
    return await chain.ainvoke({"structured": structured.model_dump()})

async def generate_action_plan(structured: StructuredFeedback, survey: FollowupSurveyDraft) -> ActionPlan:
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a high-efficiency Technical Program Manager. "
         "Triage the user feedback into a Sprint Backlog. \n"
         "\n"
         "### SPEED CONSTRAINTS (CRITICAL)\n"
         "1. **Limit**: Generate a MAXIMUM of 3 tickets total.(Make sure for something web related there is a ticket for SWE and PM but something related to an in person accident has to have a ticket for field logistics and maybe PM or SWE depending on the situation. \n"
         "2. **Brevity**: Descriptions must be 1 sentence max. Acceptance criteria must be 2 bullet points max.\n"
         "\n"
         "### ROLE GUIDELINES\n"
         "- **PM**: Requirements, impact analysis, or user comms.(OMIT if purely in store problem like returns or customer service issue)\n"
         "- **SWE**: Code changes, debugging, or unit tests (OMIT if purely in store problem like returns or customer service issue).\n"
         "- **Labor**: Physical hardware/logistics only (OMIT if purely software).\n"
         "\n"
         "### TICKET FORMAT\n"
         "Return the tickets in this format:\n"
         "- **ID**: [TKT-00X]\n"
         "- **Role**: [PM/SWE/Labor]\n"
         "- **Summary**: [Actionable Title]\n"
         "- **Description**: [Max 1 sentence context]\n"
         "- **AC**: [Max 2 bullet points for 'Definition of Done']\n"
         "- **Priority**: [P0-P3]\n"
         ),
        ("user",
         "Structured feedback:\n{structured}\n\n"
         "Follow-up survey draft:\n{survey}\n\n"
         "Generate the backlog now."),
    ])
    
    chain = prompt | _llm().with_structured_output(ActionPlan)
    return await chain.ainvoke({
        "structured": structured.model_dump(),
        "survey": survey.model_dump(),
    })