import React, {useState} from 'react';
import {imageButton, displayPills, settingsButton, onEnter } from "./util.js";
import './rps.css';
import playOn from './icon/rps_playOn.svg';
import playOff from './icon/rps_playOff.svg';
import glassOn from './icon/rps_glassOn.svg';
import glassOff from './icon/rps_glassOff.svg';
const JOIN = true;
const LEAVE = false;

function play(props, playing, setPlaying, join) {
  if(playing === join) {
    return; // ignore: user clicked join when already playing or leave when not playing
  }
  //TODO notify server
  setPlaying(join);
}

function playControl(props, playing, setPlaying) {
  return <div>
    {imageButton(() => play(props, playing, setPlaying, JOIN), playing? playOn: playOff, "join")}
    {imageButton(() => play(props, playing, setPlaying, LEAVE), playing? glassOff: glassOn, "watch")}
  </div>;
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, setPlaying)}
  </div>
}