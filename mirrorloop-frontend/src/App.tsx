import React, { useState } from "react";
import "../styles/app.css";
import type { ApiResult, ComplaintInput } from "./types";
import { analyzeComplaint } from "./api";
import Header from "../components/Header";
import ComplaintForm from "../components/ComplaintForm";
import ResultsPanel from "../components/ResultsPanel";
import Toast from "../components/Toast";

const defaultInput: ComplaintInput = {
  complaint: "",
  channel: "web",
  journeyStage: "checkout",
  language: "English",
  orderId: "",
  emailOrPhone: "",
};

export default function App() {
  const [input, setInput] = useState<ComplaintInput>(defaultInput);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [toast, setToast] = useState<{ title: string; message?: string } | null>(null);

  
  const canSubmit = input.complaint.trim().length >= 10;

  async function onSubmit() {
    if (!canSubmit) {
      setToast({ title: "Error", message: "Please enter at least 10 characters." });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      // Call the API (or Mock)
      const r = await analyzeComplaint({
        ...input,
        orderId: input.orderId?.trim() || undefined,
      });
      setResult(r);
      setToast({ title: "Success", message: "Case created successfully." });
    } catch (e) {
      setToast({ title: "Error", message: "Failed to analyze complaint." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <Header />

      <main className="shell">
        <section className="grid">
          <div className="card cardLeft">
            <ComplaintForm
              value={input}
              onChange={setInput}
              onSubmit={onSubmit}
              loading={loading}
              canSubmit={canSubmit}
            />
          </div>

          <div className="card cardRight">
            <ResultsPanel result={result} loading={loading} />
          </div>
        </section>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}