import React, { useMemo, useState, useEffect } from "react";
import type { ApiResult } from "../src/types";
import LoadingDots from "./LoadingDots";
import { submitVote, fetchSurveyAnswers, type SurveyAnswer } from "../src/api"; 

type Props = {
  result: ApiResult | null;
  loading: boolean;
};

// FIX 1: Update the Type Definition to match your new tab name
type Tab = "Structured" | "Pulse Checks" | "Survey Answers" | "Action Plan" | "Raw JSON";

export default function ResultsPanel({ result, loading }: Props) {
  const [tab, setTab] = useState<Tab>("Structured");
  
  // Track voted state for EACH question index independently
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});

  // New State for Answers
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const json = useMemo(() => (result ? JSON.stringify(result, null, 2) : ""), [result]);

  const handleVote = (idx: number, score: number) => {
    if (!result?.surveymonkey) return;
    
    // Optimistically update UI
    setVotedMap((prev) => ({ ...prev, [idx]: true }));
    
    // Send vote with specific question index
    submitVote(
       result.surveymonkey.survey_id!, 
       result.surveymonkey.collector_id!, 
       score,
       idx
    );
  };

  // Fetch answers when user clicks the "Survey Answers" tab
  useEffect(() => {
    if (tab === "Survey Answers" && result?.surveymonkey?.survey_id) {
        setLoadingAnswers(true);
        fetchSurveyAnswers(result.surveymonkey.survey_id).then(data => {
            setAnswers(data);
            setLoadingAnswers(false);
        });
    }
  }, [tab, result]);

  if (!result && !loading) {
    return (
      <div className="resultsEmpty">
        <div className="h2">Results</div>
        <div className="muted">Create a case to see structured insight, a follow-up survey draft, and an action plan.</div>

        <div className="emptyCard">
          <div className="emptyTitle">Turn feedback into actionable items.</div>
          <div className="emptySub">
            The right panel updates instantly after submission and shows structured feedback, 3 tailored pulse checks, an action plan with actual JIRA tickets and more.
          </div>

          <div className="emptyGrid">
            <div className="kpi">
              <div className="kpiNum">3</div>
              <div className="kpiLabel">Pulse Checks</div>
            </div>
            <div className="kpi">
              <div className="kpiNum">≤5s</div>
              <div className="kpiLabel">Customer effort</div>
            </div>
            <div className="kpi">
              <div className="kpiNum">1</div>
              <div className="kpiLabel">Ticket draft generated</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resultsWrap">
      <div className="resultsHead">
        <div>
          <div className="h2">Results</div>
          <div className="muted">
            {loading ? (
              <span className="inline">
                Processing <LoadingDots />
              </span>
            ) : (
              <>
                Case <span className="mono">{result?.caseId}</span> • {new Date(result?.createdAt ?? Date.now()).toLocaleString()}
              </>
            )}
          </div>
        </div>

        <div className="tabs">
          {/* FIX 2: Ensure the string here matches the Tab type exactly */}
          {(["Structured", "Pulse Checks", "Survey Answers", "Action Plan", "Raw JSON"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? "tabActive" : ""}`}
              onClick={() => setTab(t)}
              disabled={loading}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {result && !loading ? (
        <div className="resultsBody">
          {tab === "Structured" && (
            <div className="panel">
              <div className="panelTitle">Structured feedback</div>

              <div className="chipRow">
                <span className="chip">{result.structured.issue_type.toUpperCase()}</span>
                <span className="chip">{result.structured.journey_stage}</span>
                <span className="chip">emotion: {result.structured.emotion}</span>
                <span className="chip">severity: {result.structured.severity}/5</span>
                <span className={`chip ${result.structured.followup_needed ? "chipWarn" : "chipOk"}`}>
                  follow-up: {result.structured.followup_needed ? "needed" : "not needed"}
                </span>
              </div>

              <div className="panelBlock">
                <div className="labelSm">Summary</div>
                <div className="panelText">{result.structured.summary}</div>
              </div>

              <div className="panelBlock">
                <div className="labelSm">Evidence</div>
                <ul className="quoteList">
                  {result.structured.evidence_quotes.map((q, idx) => (
                    <li key={idx} className="quote">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>

              {result.structured.followup_goal ? (
                <div className="panelBlock">
                  <div className="labelSm">Follow-up goal</div>
                  <div className="panelText">{result.structured.followup_goal}</div>
                </div>
              ) : null}
            </div>
          )}

          {/* FIX 3: Change this condition from "Survey Draft" to "Pulse Checks" */}
          {tab === "Pulse Checks" && (
            <div className="panel">
              <div className="panelTitle">Interactive Pulse Checks</div>
              <div className="muted" style={{ marginBottom: "15px" }}>
                 AI-generated micro-surveys specific to this case. Clicking an option submits real data.
              </div>

              {/* --- LOOP: Render a Pulse Check for EVERY question --- */}
              {result.surveymonkey?.weblink_url && result.surveyDraft.questions.map((q, idx) => (
                <div key={idx} className="surveyQ" style={{ marginBottom: "20px" }}>
                  <div className="surveyPrompt" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="surveyNum">{idx + 1}</span>
                    <span>{q.prompt}</span>
                  </div>
                  
                  {!votedMap[idx] ? (
                    <div style={{ display: "flex", gap: "12px", marginTop: "5px" }}>
                      {[
                        { score: 1, label: "😡 Critical", color: "#ef4444" },
                        { score: 3, label: "😐 Neutral",  color: "#eab308" },
                        { score: 5, label: "😃 Good", color: "#22c55e" }
                      ].map((btn) => (
                        <button
                          key={btn.score}
                          onClick={() => handleVote(idx, btn.score)}
                          className="btnPrimary"
                          style={{
                            flex: 1,
                            background: "rgba(255,255,255,0.05)",
                            border: `1px solid ${btn.color}`,
                            color: btn.color,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            padding: "12px",
                            fontSize: "14px"
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{btn.label.split(" ")[0]}</span>
                          {btn.label.split(" ")[1]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: "15px", 
                      background: "rgba(37, 104, 156, 0.1)", 
                      border: "1px solid rgba(34, 143, 197, 0.3)", 
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#feffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}>
                      <span style={{fontSize: "1.2em"}}>✨</span> 
                      <strong>Feedback Captured</strong>
                    </div>
                  )}
                </div>
              ))}
              
              {!result.surveymonkey?.weblink_url && (
                  <div className="muted">Generating survey link...</div>
              )}
            </div>
          )}

          {tab === "Survey Answers" && (
            <div className="panel">
                <div className="panelTitle" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>Live Responses from SurveyMonkey</span>
                    <button 
                        onClick={() => {
                            if (result.surveymonkey?.survey_id) {
                                setLoadingAnswers(true); 
                                fetchSurveyAnswers(result.surveymonkey.survey_id).then(d => { setAnswers(d); setLoadingAnswers(false); });
                            }
                        }}
                        style={{background:'transparent', border:'1px solid #555', borderRadius:'4px', color:'#ccc', fontSize:'11px', cursor:'pointer', padding: '6px 12px'}}
                    >
                        Refresh ↻
                    </button>
                </div>
                
                {loadingAnswers ? (
                    <div className="resultsLoading"><LoadingDots /></div>
                ) : answers.length === 0 ? (
                    <div className="muted">No responses found yet. Try submitting a Pulse Check!</div>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        {answers.map((ans, i) => (
                            <div key={i} className="surveyQ" style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                <div className="labelSm">{new Date(ans.timestamp).toLocaleString()}</div>
                                <div style={{fontWeight: 600, color: '#fff'}}>{ans.question}</div>
                                <div style={{
                                    marginTop:'6px', 
                                    padding:'8px', 
                                    background: 'rgba(124, 92, 255, 0.1)', 
                                    border: '1px solid rgba(124, 92, 255, 0.3)', 
                                    borderRadius:'6px', 
                                    color: '#A78BFA'
                                }}>
                                    Answer: <strong>{ans.answer}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

          {tab === "Action Plan" && (
            <div className="panel">
              <div className="panelTitle">Action plan</div>
              <div className="actionGrid">
                <div className="actionCard">
                  <div className="labelSm">Top theme</div>
                  <div className="big">{result.actionPlan.top_theme}</div>
                </div>
                <div className="actionCard">
                  <div className="labelSm">Owner</div>
                  <div className="big">{result.actionPlan.owner}</div>
                </div>
                <div className="actionCard">
                  <div className="labelSm">Impact</div>
                  <div className={`big pillBig pillImpact`}>{result.actionPlan.impact}</div>
                </div>
                <div className="actionCard">
                  <div className="labelSm">Effort</div>
                  <div className={`big pillBig pillEffort`}>{result.actionPlan.effort}</div>
                </div>
              </div>

              <div className="panelBlock">
                <div className="labelSm">Recommended action</div>
                <div className="panelText">{result.actionPlan.recommended_action}</div>
              </div>

              <div className="panelBlock">
                <div className="labelSm">Generated JIRA Tickets</div>
                <div className="ticketStack">
                  {result.actionPlan.tickets.map((ticket, i) => (
                    <div key={ticket.ticket_id || i} className="ticket">
                      <div className="ticketHeader">
                        <span className="ticketId">{ticket.ticket_id}</span>
                        <span className={`chipRole ${ticket.role.replace(" ", "")}`}>
                          {ticket.role}
                        </span>
                        <span className="ticketPriority">{ticket.priority}</span>
                      </div>

                      <div className="ticketTitle">{ticket.summary}</div>
                      <div className="ticketDesc">{ticket.description}</div>

                      {ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0 && (
                        <div className="ticketAC">
                          <div className="labelXs">Acceptance Criteria:</div>
                          <ul>
                            {ticket.acceptance_criteria.map((ac, idx) => (
                              <li key={idx}>{ac}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Raw JSON" && (
            <div className="panel">
              <div className="panelTitle">Raw payload</div>
              <pre className="json">{json}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="resultsLoading">
          <div className="spinner" />
          <div className="muted">Creating case…</div>
        </div>
      )}
    </div>
  );
}