import React from 'react';
import './util.css';

export function imageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="click-icon" />
  </button>);
}
