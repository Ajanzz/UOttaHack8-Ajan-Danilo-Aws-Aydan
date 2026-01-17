import httpx
from typing import Optional, Tuple, List
from app.config import settings
from app.schemas import FollowupSurveyDraft

class SurveyMonkeyClient:
    def __init__(self):
        self.base = settings.SURVEYMONKEY_BASE_URL.rstrip("/")
        self.token = settings.SURVEYMONKEY_ACCESS_TOKEN.strip()

    def enabled(self) -> bool:
        return bool(self.token) and len(self.token) > 10

    def _headers(self) -> dict:
        return {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _format_questions_payload(self, draft: FollowupSurveyDraft) -> List[dict]:
        sm_questions = []
        for q in draft.questions:
            if q.type == "scale_1_5":
                sm_questions.append({
                    "headings": [{"heading": q.prompt}],
                    "family": "single_choice",
                    "subtype": "vertical",
                    "answers": {"choices": [{"text": str(i)} for i in range(1, 6)]}
                })
            elif q.type == "single_choice" and q.choices:
                sm_questions.append({
                    "headings": [{"heading": q.prompt}],
                    "family": "single_choice",
                    "subtype": "vertical",
                    "answers": {"choices": [{"text": c} for c in q.choices]}
                })
            else:
                sm_questions.append({
                    "headings": [{"heading": q.prompt}],
                    "family": "open_ended", 
                    "subtype": "single"
                })
        return sm_questions

    async def create_survey_from_draft(self, draft: FollowupSurveyDraft, case_id: str) -> Optional[str]:
        if not self.enabled(): return None
        payload = {
            "title": f"{draft.title} (Case {case_id})",
            "pages": [{"title": "Feedback", "questions": self._format_questions_payload(draft)}]
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(f"{self.base}/surveys", headers=self._headers(), json=payload)
            return resp.json().get("id") if resp.status_code in (200, 201) else None

    async def create_weblink_collector(self, survey_id: str) -> Tuple[Optional[str], Optional[str]]:
        if not self.enabled(): return (None, None)
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{self.base}/surveys/{survey_id}/collectors",
                headers=self._headers(),
                json={"type": "weblink", "name": "Web Link 1"},
            )
            if resp.status_code not in (200, 201): return (None, None)
            data = resp.json()
            return (data.get("id"), data.get("url"))

    async def submit_rating_vote(self, survey_id: str, collector_id: str, score: int, question_index: int = 0) -> bool:
        if not self.enabled(): return False
        async with httpx.AsyncClient(timeout=15) as client:
            details = (await client.get(f"{self.base}/surveys/{survey_id}/details", headers=self._headers())).json()
            
            target_question = None
            match_count = 0
            for page in details.get("pages", []):
                for q in page.get("questions", []):
                    if q.get("family") in ["single_choice", "matrix"]:
                        if match_count == question_index:
                            target_question = q
                            break
                        match_count += 1
                if target_question: break
            
            if not target_question: return False

            target_choice_id = None
            if "answers" in target_question:
                choices = target_question["answers"].get("choices", [])
                for c in choices:
                    if str(c.get("text")) == str(score):
                        target_choice_id = c.get("id")
                        break
                if not target_choice_id and 0 <= score - 1 < len(choices):
                    target_choice_id = choices[score-1].get("id")

            if not target_choice_id: return False

            payload = {
                "pages": [{
                    "id": page.get("id"),
                    "questions": [{
                        "id": target_question.get("id"),
                        "answers": [{"choice_id": target_choice_id}]
                    }]
                }]
            }
            resp = await client.post(f"{self.base}/collectors/{collector_id}/responses", headers=self._headers(), json=payload)
            return resp.status_code in (200, 201)

    async def get_survey_answers(self, survey_id: str) -> List[dict]:
        if not self.enabled(): return []
        async with httpx.AsyncClient(timeout=15) as client:
            details = (await client.get(f"{self.base}/surveys/{survey_id}/details", headers=self._headers())).json()
            question_map = {}
            choice_map = {}
            for page in details.get("pages", []):
                for q in page.get("questions", []):
                    question_map[q["id"]] = q["headings"][0]["heading"]
                    if "answers" in q:
                        for c in q["answers"].get("choices", []):
                            choice_map[c["id"]] = c["text"]

            bulk = (await client.get(f"{self.base}/surveys/{survey_id}/responses/bulk", headers=self._headers())).json()
            results = []
            for r in bulk.get("data", []):
                for page in r.get("pages", []):
                    for q in page.get("questions", []):
                        answer_val = "-"
                        if q.get("answers"):
                            ans = q["answers"][0]
                            if "choice_id" in ans:
                                answer_val = choice_map.get(ans["choice_id"], "Unknown")
                            elif "text" in ans:
                                answer_val = ans["text"]
                        results.append({
                            "question": question_map.get(q["id"], "Unknown"),
                            "answer": answer_val,
                            "timestamp": r.get("date_modified")
                        })
            return sorted(results, key=lambda x: x["timestamp"], reverse=True)