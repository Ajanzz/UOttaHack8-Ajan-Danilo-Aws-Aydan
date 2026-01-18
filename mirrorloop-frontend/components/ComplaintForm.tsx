import React, { useMemo, useRef } from "react";
import type { ComplaintInput } from "../src/types";
import LoadingDots from "./LoadingDots";

type Props = {
  value: ComplaintInput;
  onChange: (v: ComplaintInput) => void;
  onSubmit: () => void;
  loading: boolean;
  canSubmit: boolean;
};

// --- STYLES ---
const ACCENT_COLOR = "#6366f1"; 
const DARK_BG = "#2A2E35";

const INPUT_STYLE = {
  backgroundColor: DARK_BG,
  color: "white",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "10px",
  borderRadius: "6px",
  width: "100%",
  outline: "none",
  height: "42px",
  fontSize: "14px",
  fontFamily: "inherit"
};

const CustomDropdown = ({ 
  value, 
  options, 
  onChange 
}: { 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...INPUT_STYLE,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: isOpen ? `1px solid ${ACCENT_COLOR}` : INPUT_STYLE.border,
          boxShadow: isOpen ? `0 0 0 1px ${ACCENT_COLOR}` : "none"
        }}
      >
        <span>{value}</span>
        <span style={{ fontSize: "12px", opacity: 0.7 }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "4px",
          backgroundColor: DARK_BG,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          zIndex: 100,
          maxHeight: "200px",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="custom-option" 
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: opt === value ? ACCENT_COLOR : "transparent",
                color: "white",
                transition: "background 0.1s"
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      <style>{`
        .custom-option:hover {
          background-color: ${ACCENT_COLOR} !important;
        }
      `}</style>
    </div>
  );
};

export default function ComplaintForm({ value, onChange, onSubmit, loading, canSubmit }: Props) {
  const count = useMemo(() => value.complaint.trim().length, [value.complaint]);
  
  // Track start time of typing
  const startTime = useRef<number | null>(null);

  function set<K extends keyof ComplaintInput>(key: K, val: ComplaintInput[K]) {
    onChange({ ...value, [key]: val });
  }

  // --- WPM CALCULATION ---
  const handleComplaintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    
    // Set start time on first character
    if (!startTime.current && text.length > 0) {
      startTime.current = Date.now();
    }

    // Reset start time if text is cleared
    if (text.length === 0) {
      startTime.current = null;
      onChange({ ...value, complaint: text, wpm: 0 }); // Assuming types are updated
      return;
    }

    // Calculate WPM live
    let wpm = 0;
    if (startTime.current) {
      const minutes = (Date.now() - startTime.current) / 60000;
      const wordCount = text.trim().split(/\s+/).length;
      if (minutes > 0.001) { // Avoid division by zero
        wpm = Math.round(wordCount / minutes);
      }
    }

    // Update state with text AND wpm
    // @ts-ignore: Ignore missing wpm if types.ts isn't updated yet
    onChange({ ...value, complaint: text, wpm: wpm });
  };

  return (
    <div className="formWrap">
      <style>{`
        input:focus, textarea:focus {
          border-color: ${ACCENT_COLOR} !important;
          box-shadow: 0 0 0 1px ${ACCENT_COLOR};
        }
      `}</style>

      <div className="formHead">
        <div>
          <div className="h2">Customer complaint</div>
          <div className="muted">Please type in however you are feeling with no filter. Keep it natural.</div>
        </div>

        <button className="btnPrimary" onClick={onSubmit} disabled={loading || !canSubmit}>
          {loading ? (
            <span className="btnInline">
              Analyzing <LoadingDots />
            </span>
          ) : (
            "Create case"
          )}
        </button>
      </div>

      <div className="fieldGrid">
        <div className="field">
          <label>Channel</label>
          <CustomDropdown 
            value={value.channel}
            options={["web", "mobile", "in_store", "delivery"]}
            onChange={(val) => set("channel", val as any)}
          />
        </div>

        <div className="field">
          <label>Journey stage</label>
          <CustomDropdown 
            value={value.journeyStage}
            options={["browse", "product", "checkout", "support", "returns", "other"]}
            onChange={(val) => set("journeyStage", val as any)}
          />
        </div>

        <div className="field">
          <label>Language</label>
          <CustomDropdown 
            value={value.language}
            options={["English", "French", "Arabic", "Other"]}
            onChange={(val) => set("language", val as any)}
          />
        </div>

        <div className="field">
          <label>Order ID (optional)</label>
          <input
            value={value.orderId ?? ""}
            onChange={(e) => set("orderId", e.target.value)}
            placeholder="e.g., 104-55891"
            style={INPUT_STYLE} 
          />
        </div>
      </div>

      <div className="field">
        <label>Complaint</label>
        <textarea
          value={value.complaint}
          onChange={handleComplaintChange} // <--- UPDATED HANDLER
          placeholder="Example: I tried to check out and the payment failed three times..."
          style={{ ...INPUT_STYLE, minHeight: "100px", resize: "vertical", height: "auto" }}
        />
        <div className="helperRow">
          <div className={`counter ${count < 10 ? "counterWarn" : ""}`}>{count}/10 min</div>
          <div className="helper muted">
             {/* Show WPM for debugging (take out before demo) */}
             {/* @ts-ignore */}
             {value.wpm ? `Speed: ${value.wpm} WPM • ` : ""} 
             Tip: include what happened, where it happened, and why it was frustrating.
          </div>
        </div>
      </div>

      <div className="field">
        <label>Contact (optional)</label>
        <input
          value={value.emailOrPhone ?? ""}
          onChange={(e) => set("emailOrPhone", e.target.value)}
          placeholder="Email or phone for follow-up (demo only)"
          style={INPUT_STYLE}
        />
      </div>

      <div className="divider" />

      <div className="microcopy">
        <div className="microTitle">What happens next?</div>
        <ul>
          <li>We structure the complaint into a clean, consistent schema.</li>
          <li>We generate 3 pulse checks for you.</li>
          <li>We produce an action plan and a ticket draft for a team to execute.</li>
        </ul>
      </div>
    </div>
  );
}