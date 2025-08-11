import React, {useState} from 'react';
import {imageButton, bigImageButton, displayPills, settingsButton, onEnter } from "./util.js";
import './rps.css';
import playOn from './icon/rps_playOn.svg';
import playOff from './icon/rps_playOff.svg';
import glassOn from './icon/rps_glassOn.svg';
import glassOff from './icon/rps_glassOff.svg';
import pausePink from './icon/pausePink.svg';
import pauseGreen from './icon/pauseGreen.svg';
import playPink from './icon/playPink.svg';
import playGreen from './icon/playGreen.svg';
import rockPink from './icon/rockPink.svg';
import rockGreen from './icon/rockGreen.svg';
import sciPink from './icon/scissorPink.svg';
import sciGreen from './icon/scissorGreen.svg'
import paperGreen from './icon/paperGreen.svg';
import paperPink from './icon/paperPink.svg'
const JOIN = true;
const LEAVE = false;
const IDLE = 0;
const SELECTING = 1;
const ROCK = 5;
const SCISSORS = 6;
const PAPER = 7;

function timer() {} // TODO display timer

function pause(props, paused, setTo, setPaused) {
  setPaused(setTo); //TODO request server pause or unpause and only set flag on server response
}

function statusBar(playing, phase) {
  if(playing) {
    if (phase == IDLE) return <div class="subtitle">Player (paused)</div>
    return <div class="subtitle">Player (make your choice) </div>
  }
  if (phase == IDLE) return <div class="subtitle">Observer (paused)</div>
  return <div class="subtitle">Observer (players are selecting)</div>
}

function play(props, playing, setPlaying, join) {
  if(playing === join) {
    return; // ignore: user clicked join when already playing or leave when not playing
  }
  //TODO notify server
  setPlaying(join);
}

function playControl(props, playing, setPlaying, paused, setPaused) {
  return <div>
    <div>
      {imageButton(() => play(props, playing, setPlaying, JOIN), playing? playOn: playOff, "join")}
      {imageButton(() => play(props, playing, setPlaying, LEAVE), playing? glassOff: glassOn, "watch")}
    </div>
    <div>
      {imageButton(() => pause(props, paused, false, setPaused), paused? playPink: playGreen, "play")}
      {imageButton(() => pause(props, paused, true, setPaused), paused? pauseGreen: pausePink, "pause")}
    </div>
    <div>
      {timer()}
    </div>
  </div>;
}

function select(props, selection, newSel, setSelection) {
  if(selection === newSel) { return; }
  //TODO send selection to server
  setSelection(newSel);
}

function selector(props, playing, selection, setSelection) {
  if(playing) {
    return <div>
      {bigImageButton(() => select(props, selection, ROCK, setSelection),
                selection === ROCK ? rockGreen: rockPink, "rock")}
      {bigImageButton(() => select(props, selection, SCISSORS, setSelection),
                selection === SCISSORS ? sciGreen: sciPink, "scissors")}
      {bigImageButton(() => select(props, selection, PAPER, setSelection),
                selection === PAPER ? paperGreen: paperPink, "paper")}
    </div>;
  }
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(IDLE);
  const [paused, setPaused] = useState(true);
  const [selection, setSelection] = useState(0);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, setPlaying, paused, setPaused)}
    {statusBar(playing, status)}
    <div>
      {selector(props, playing, selection, setSelection)}
    </div>
  </div>
}