import React, { useState } from "react";
import type { ApiResult } from "../src/types";
import LoadingDots from "./LoadingDots";

type Tab = "Structured" | "Survey Draft" | "Action Plan" | "Raw JSON";

export default function ResultsPanel({ result, loading }: { result: ApiResult | null; loading: boolean }) {
  const [tab, setTab] = useState<Tab>("Structured");

  // 1. Loading State
  if (loading) {
    return (
      <div className="resultsLoading">
        <div className="spinner" />
        <div className="muted">Analyzing complaint...</div>
      </div>
    );
  }

  
  if (!result) {
    return (
      <div className="resultsEmpty">
        <div className="h2">Waiting for input</div>
        <div className="muted">Submit a complaint to generate an action plan.</div>
      </div>
    );
  }

  // Results State
  return (
    <div className="resultsWrap">
      <div className="resultsHead">
        <div>
          <div className="h2">Case {result.caseId}</div>
          <div className="muted">{new Date(result.createdAt).toLocaleString()}</div>
        </div>
        <div className="tabs">
          {["Structured", "Survey Draft", "Action Plan", "Raw JSON"].map((t) => (
            <button key={t} className={`tab ${tab === t ? "tabActive" : ""}`} onClick={() => setTab(t as Tab)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="resultsBody">
        {tab === "Structured" && (
          <div className="panel">
            <div className="panelTitle">Structured Feedback</div>
            <div className="chipRow">
              <span className="chip">{result.structured.issue_type}</span>
              <span className="chip">Severity: {result.structured.severity}/5</span>
            </div>
            <div className="panelBlock">
              <div className="labelSm">Summary</div>
              <div className="panelText">{result.structured.summary}</div>
            </div>
            <div className="panelBlock">
               <div className="labelSm">Evidence</div>
               <ul>{result.structured.evidence_quotes.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          </div>
        )}

        {tab === "Survey Draft" && (
          <div className="panel">
            <div className="panelTitle">Follow-up Survey</div>
            
            {/* SurveyMonkey Link Integration (Using the .surveyQ class) */}
            {result.surveymonkey?.weblink_url && (
                <div className="surveyQ" style={{ marginBottom: "20px" }}>
                    <div className="surveyPrompt" style={{ display: "flex", gap: "8px" }}>
                        <span>🔗 Live Survey Link</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <input readOnly value={result.surveymonkey.weblink_url} style={{ flex: 1, padding: "8px", background: "#333541", border: "1px solid #474b59", color: "#fff", borderRadius: "4px" }} />
                        <a href={result.surveymonkey.weblink_url} target="_blank" className="btnPrimary" style={{textDecoration: 'none'}}>Open ↗</a>
                    </div>
                </div>
            )}

            {result.surveyDraft.questions.map((q, i) => (
              <div key={i} className="surveyQ">
                <div className="surveyPrompt"><span className="surveyNum">{i + 1}</span> {q.prompt}</div>
                {q.choices && <div className="choiceRow">{q.choices.map(c => <span key={c} className="choicePill">{c}</span>)}</div>}
              </div>
            ))}
          </div>
        )}

        {tab === "Action Plan" && (
          <div className="panel">
            <div className="panelTitle">Action Plan</div>
            <div className="panelBlock">
                <div className="labelSm">Recommended Action</div>
                <div className="panelText">{result.actionPlan.recommended_action}</div>
            </div>
            
            <div className="panelBlock">
                <div className="labelSm">JIRA Tickets</div>
                <div className="ticketStack">
                    {result.actionPlan.tickets.map((t) => (
                        <div key={t.ticket_id} className="ticket">
                            <div className="ticketHeader">
                                <span className="ticketId">{t.ticket_id}</span>
                                <span className="ticketPriority">{t.priority}</span>
                            </div>
                            <div className="ticketTitle">{t.summary}</div>
                            <div className="ticketDesc">{t.description}</div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {tab === "Raw JSON" && <pre className="json">{JSON.stringify(result, null, 2)}</pre>}
      </div>
    </div>
  );
}