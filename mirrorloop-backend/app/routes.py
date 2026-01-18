from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.schemas import ComplaintInput, ApiResult, SurveyMonkeyInfo, VoteInput
from app.llm import generate_structured_feedback, generate_followup_survey, generate_action_plan
from app.surveymonkey import SurveyMonkeyClient
from app.store import store

router = APIRouter()

@router.post("/api/feedback", response_model=ApiResult)
async def create_feedback(inp: ComplaintInput) -> ApiResult:
    if not inp.complaint.strip():
        raise HTTPException(status_code=400, detail="Complaint is required")

    case_id = store.new_case_id()
    structured = await generate_structured_feedback(inp)
    survey_draft = await generate_followup_survey(structured)
    action_plan = await generate_action_plan(structured, survey_draft)
    
    sm = SurveyMonkeyClient()
    sm_info = None

    if sm.enabled():
        survey_id = await sm.create_survey_from_draft(survey_draft, case_id)
        if survey_id:
            collector_id, weblink_url = await sm.create_weblink_collector(survey_id)
            sm_info = SurveyMonkeyInfo(survey_id=survey_id, collector_id=collector_id, weblink_url=weblink_url)
    else:
        sm_info = SurveyMonkeyInfo(weblink_url="https://www.surveymonkey.com/ (demo)")

    result = ApiResult(
        caseId=case_id,
        structured=structured,
        surveyDraft=survey_draft,
        actionPlan=action_plan,
        createdAt=datetime.now(timezone.utc).isoformat(),
        surveymonkey=sm_info,
    )
    store.put(case_id, result.model_dump())
    return result

@router.post("/api/vote")
async def submit_vote(vote: VoteInput):
    sm = SurveyMonkeyClient()
    if sm.enabled():
        success = await sm.submit_rating_vote(vote.survey_id, vote.collector_id, vote.score, vote.question_index)
        return {"status": "success" if success else "error"}
    return {"status": "success", "msg": "Mock vote recorded"}

@router.get("/api/answers/{survey_id}")
async def get_survey_answers(survey_id: str):
    sm = SurveyMonkeyClient()
    return await sm.get_survey_answers(survey_id) if sm.enabled() else []