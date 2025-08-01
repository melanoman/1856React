import React from 'react';
import './util.css';

export const VERTICAL = 8675309; // gen-E

export function imageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="click-icon" />
  </button>);
}

function displayPill(pill, sel, setSel, getText, eq, ori) {
  if(ori === VERTICAL) {
    return (<div>
      {displayPillButton(pill, sel, setSel, getText, eq)}
    </div>);
  }
  return displayPillButton(pill, sel, setSel, getText, eq);
}

function displayPillButton(pill, sel, setSel, getText, eq) {
  if(eq(pill, sel)) {
    return <button class="thich" onClick={() => setSel(pill)}>{getText(pill)}</button>;
  } else {
    return <button class="which" onClick={() => setSel(pill)}>{getText(pill)}</button>;
  }
}

export function displayPills(pills, sel, setSel, getText, eq, ori) {
  return pills.map((pill) => displayPill(pill, sel, setSel, getText, eq, ori));
}