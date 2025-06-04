import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

export default function PassPanel(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span></div>
    <div><img src={addButton} /></div>
  </div>);
}