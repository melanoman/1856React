import React from 'react';
import './util.css';

import gear from './icon/settings.svg';
import gear_admin from './icon/settings_admin.svg';

export const HORIZONTAL = 219384;
export const VERTICAL = 8675309; // gen-E

export function isVoid(nut) {
  return nut === undefined || nut === null;
}

export function imageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="click-icon" />
  </button>);
}

export function bigImageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="big-click-icon" />
  </button>);
}

export function smallImageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="small-click-icon" />
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

function tryAdmin(props) {
  if (props.admin) {
    props.setters.setAdmin(false);
  } else if (window.prompt("Admin password:") === "hardcode") { //TODO defer to server
    props.setters.setAdmin(true);
  }
}

export function onEnter(key, f) {
  if(key === 'Enter') {
    f();
  }
}

export function settingsButton(props) {
  return (imageButton(() => tryAdmin(props), props.admin ? gear_admin : gear, 'admin'));
}