import React, { useMemo } from "react";
import type { ComplaintInput } from "../src/types";
import LoadingDots from "./LoadingDots";

type Props = {
  value: ComplaintInput;
  onChange: (v: ComplaintInput) => void;
  onSubmit: () => void;
  loading: boolean;
  canSubmit: boolean;
};

export default function ComplaintForm({ value, onChange, onSubmit, loading, canSubmit }: Props) {
  const count = useMemo(() => value.complaint.trim().length, [value.complaint]);

  function set<K extends keyof ComplaintInput>(key: K, val: ComplaintInput[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="formWrap">
      <div className="formHead">
        <div>
          <div className="h2">Customer complaint</div>
          <div className="muted">Type the complaint as the customer would. Keep it natural.</div>
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
          <select value={value.channel} onChange={(e) => set("channel", e.target.value as any)}>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="in_store">In-store</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        <div className="field">
          <label>Journey stage</label>
          <select value={value.journeyStage} onChange={(e) => set("journeyStage", e.target.value as any)}>
            <option value="browse">Browse</option>
            <option value="product">Product</option>
            <option value="checkout">Checkout</option>
            <option value="support">Support</option>
            <option value="returns">Returns</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="field">
          <label>Language</label>
          <select value={value.language} onChange={(e) => set("language", e.target.value as any)}>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="field">
          <label>Order ID (optional)</label>
          <input
            value={value.orderId ?? ""}
            onChange={(e) => set("orderId", e.target.value)}
            placeholder="e.g., 104-55891"
          />
        </div>
      </div>

      <div className="field">
        <label>Complaint</label>
        <textarea
          value={value.complaint}
          onChange={(e) => set("complaint", e.target.value)}
          placeholder="Example: I tried to check out and the payment failed three times. The button kept spinning and I got charged but no confirmation..."
        />
        <div className="helperRow">
          <div className={`counter ${count < 10 ? "counterWarn" : ""}`}>{count}/10 min</div>
          <div className="helper muted">Tip: include what happened, where it happened, and why it was frustrating.</div>
        </div>
      </div>

      <div className="field">
        <label>Contact (optional)</label>
        <input
          value={value.emailOrPhone ?? ""}
          onChange={(e) => set("emailOrPhone", e.target.value)}
          placeholder="Email or phone for follow-up (demo only)"
        />
      </div>

      <div className="divider" />

      <div className="microcopy">
        <div className="microTitle">What happens next?</div>
        <ul>
          <li>We structure the complaint into a clean, consistent schema.</li>
          <li>We generate a 1–2 question follow-up survey draft.</li>
          <li>We produce an action plan and a ticket draft for a team to execute.</li>
        </ul>
      </div>
    </div>
  );
}
