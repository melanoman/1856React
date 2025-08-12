import React, {useState, useEffect} from 'react';
import {imageButton, bigImageButton, displayPills, settingsButton, onEnter, isVoid } from './util.js';
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

function showTimer(time) {
  if (time < 1) {
    return;
  }
  if (time > 3600) {
    return <span class="big-text">{Math.floor(time/3600)} hours</span>
  }
  if (time > 60 && time%60 < 10) {
    return <span class="big-text">{Math.floor(time/60)}:0{time%60}</span>
  }
  if (time > 60) {
    return <span class="big-text">{Math.floor(time/60)}:{time%60}</span>
  }
  if (time < 10) {
    return <span class="big-text">0:0{time}</span>
  }
  return <span class="big-text">0:{time}</span>
}

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

function playControl(props, playing, setPlaying, paused, setPaused, time) {
  return <div class="horiz">
    <span>
      <div>
        {imageButton(() => play(props, playing, setPlaying, JOIN), playing? playOn: playOff, "join")}
        {imageButton(() => play(props, playing, setPlaying, LEAVE), playing? glassOff: glassOn, "watch")}
      </div>
      <div>
        {imageButton(() => pause(props, paused, false, setPaused), paused? playPink: playGreen, "play")}
        {imageButton(() => pause(props, paused, true, setPaused), paused? pauseGreen: pausePink, "pause")}
      </div>
    </span>
    <span>
      {showTimer(time)}
    </span>
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

function loadBoard(props, setBoard) {
}

var ctime = 0;

function tick(setTime) {
  if(ctime>0) {
    ctime--;
    setTime(ctime);
  }
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(IDLE);
  const [paused, setPaused] = useState(true);
  const [selection, setSelection] = useState(0);
  const [time, setTime] = useState(0);
  const [board, setBoard] = useState(null);

  useEffect(() => {
    ctime = time;
    const handle = setInterval(() => tick(setTime), 1000);
    return () => clearInterval(handle);
  }, []);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, setPlaying, paused, setPaused, time)}
    {statusBar(playing, status)}
    <div>
      {selector(props, playing, selection, setSelection)}
    </div>
  </div>
}