import React from "react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <div className="logoInner" />
        </div>
        <div className="brandTitle">MirrorLoop</div>
      </div>
    </header>
  );
}