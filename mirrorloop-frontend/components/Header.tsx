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
          <div className="brandSub">Modern feedback intake → structured insight → action draft</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="pill">
          <span className="dot" />
          Live demo
        </div>
      </div>
    </header>
  );
}
