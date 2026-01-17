import React, { useMemo, useState } from "react";
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

  const canSubmit = useMemo(() => input.complaint.trim().length >= 10, [input.complaint]);

  async function onSubmit() {
    if (!canSubmit) {
      setToast({ title: "Add a bit more detail", message: "Please type at least 10 characters so we can analyze the issue." });
      return;
    }
    setLoading(true);
    setToast(null);
    try {
      const r = await analyzeComplaint({
        ...input,
        orderId: input.orderId?.trim() || undefined,
        emailOrPhone: input.emailOrPhone?.trim() || undefined,
      });
      setResult(r);
      setToast({ title: "Captured", message: `Case ${r.caseId} created with a follow-up draft.` });
    } catch (e: any) {
      setToast({ title: "Something went wrong", message: e?.message ?? "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="bgGlow" aria-hidden="true" />
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

        <footer className="footer">
          <div className="footNote">
            Demo UI. Wire to your backend at <span className="mono">POST /api/feedback</span>.
          </div>
        </footer>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
