import React, { useEffect } from "react";

type ToastState = { title: string; message?: string } | null;

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => onClose(), 3200);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <div className="toastTitle">{toast.title}</div>
      {toast.message ? <div className="toastMsg">{toast.message}</div> : null}
      <button className="toastClose" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}
