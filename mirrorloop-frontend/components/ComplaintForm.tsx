import React from "react";
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
  
  // Simple helper to update fields
  const update = (key: keyof ComplaintInput, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="formWrap">
      <div className="formHead">
        <div className="h2">New Complaint</div>
        <button className="btnPrimary" onClick={onSubmit} disabled={loading || !canSubmit}>
          {loading ? <LoadingDots /> : "Create case"}
        </button>
      </div>

      <div className="fieldGrid">
        <div className="field">
          <label>Channel</label>
          <select value={value.channel} onChange={(e) => update("channel", e.target.value as any)}>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="in_store">In-store</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        <div className="field">
          <label>Journey stage</label>
          <select value={value.journeyStage} onChange={(e) => update("journeyStage", e.target.value as any)}>
            <option value="checkout">Checkout</option>
            <option value="browse">Browse</option>
            <option value="product">Product</option>
            <option value="support">Support</option>
            <option value="returns">Returns</option>
          </select>
        </div>

        <div className="field">
            <label>Language</label>
            <select value={value.language} onChange={(e) => update("language", e.target.value as any)}>
                <option value="English">English</option>
                <option value="French">French</option>
            </select>
        </div>

        <div className="field">
           <label>Order ID</label>
           <input value={value.orderId || ""} onChange={(e) => update("orderId", e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Complaint Details</label>
        <textarea
          value={value.complaint}
          onChange={(e) => update("complaint", e.target.value)}
          placeholder="Describe the customer issue..."
          rows={6}
        />
      </div>
    </div>
  );
}