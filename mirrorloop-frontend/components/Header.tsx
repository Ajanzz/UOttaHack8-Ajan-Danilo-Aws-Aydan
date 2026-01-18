import React from "react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <div className="logoInner" />
        </div>
        <div>
          <div className="brandTitle">MirrorLoop</div>
          <div className="brandSub">Modern Feedback Intake → Structured Insight → Action draft</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="pill">
          <span className="dot" />
          Live Demo
        </div>
      </div>
    </header>
  );
}
