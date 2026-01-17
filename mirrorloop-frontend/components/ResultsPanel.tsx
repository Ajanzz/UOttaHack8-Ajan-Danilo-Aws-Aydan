import React, { useMemo, useState } from "react";
import type { ApiResult } from "../src/types";
import LoadingDots from "./LoadingDots";

type Props = {
  result: ApiResult | null;
  loading: boolean;
};

type Tab = "Structured" | "Survey Draft" | "Action Plan" | "Raw JSON";

export default function ResultsPanel({ result, loading }: Props) {
  const [tab, setTab] = useState<Tab>("Structured");

  const json = useMemo(() => (result ? JSON.stringify(result, null, 2) : ""), [result]);

  if (!result && !loading) {
    return (
      <div className="resultsEmpty">
        <div className="h2">Results</div>
        <div className="muted">Create a case to see structured insight, a follow-up survey draft, and an action plan.</div>

        <div className="emptyCard">
          <div className="emptyTitle">Designed for a wow demo</div>
          <div className="emptySub">
            The right panel updates instantly after submission and shows outputs that sponsors care about: clarity, follow-up quality, and actionability.
          </div>

          <div className="emptyGrid">
            <div className="kpi">
              <div className="kpiNum">1–2</div>
              <div className="kpiLabel">Follow-up questions</div>
            </div>
            <div className="kpi">
              <div className="kpiNum">≤10s</div>
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
          {(["Structured", "Survey Draft", "Action Plan", "Raw JSON"] as Tab[]).map((t) => (
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

          {tab === "Survey Draft" && (
            <div className="panel">
              <div className="panelTitle">Optional Follow-up Survey</div>
{/* --- FIXED: MATCHING COLOR SCHEME --- */}
    {result.surveymonkey?.weblink_url && (
      <div className="surveyQ" style={{ marginBottom: "20px" }}>
        <div className="surveyPrompt" style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Link Icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>Live Survey Link</span>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <input 
            readOnly 
            value={result.surveymonkey.weblink_url} 
            style={{ 
              flex: 1, 
              padding: "8px 12px", 
              borderRadius: "6px", 
              border: "1px solid #334155", 
              background: "#333541", /* Keeping input dark for contrast */
              color: "#e2e8f0",
              fontFamily: "monospace",
              fontSize: "0.85rem"
            }} 
          />
          <a 
            href={result.surveymonkey.weblink_url} 
            target="_blank" 
            rel="noreferrer"
            className="btnPrimary"
            style={{ 
              textDecoration: "none", 
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center"
            }}
          >
            Open Survey ↗
          </a>
        </div>
      </div>
    )}
    {/* --- END FIX --- */}
              <div className="muted">Drafted as a micro-survey so the customer can answer quickly.</div>

              <div className="surveyTitle">{result.surveyDraft.title}</div>

              <div className="surveyQWrap">
                {result.surveyDraft.questions.map((q, idx) => (
                  <div key={idx} className="surveyQ">
                    <div className="surveyPrompt">
                      <span className="surveyNum">{idx + 1}</span>
                      {q.prompt}
                    </div>

                    {q.type === "single_choice" && q.choices ? (
                      <div className="choiceRow">
                        {q.choices.map((c) => (
                          <div key={c} className="choicePill">
                            {c}
                          </div>
                        ))}
                      </div>
                    ) : q.type === "scale_1_5" ? (
                      <div className="scaleRow">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="scalePill">
                            {n}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="choiceRow">
                        <div className="choicePill">Short text response</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
