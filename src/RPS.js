import React, {useState} from 'react';
import {imageButton, displayPills, settingsButton, onEnter } from "./util.js";
import './rps.css';
import playOn from './icon/rps_playOn.svg';
import playOff from './icon/rps_playOff.svg';
import glassOn from './icon/rps_glassOn.svg';
import glassOff from './icon/rps_glassOff.svg';
import pausePink from './icon/pausePink.svg';
import pauseGreen from './icon/pauseGreen.svg';
import playPink from './icon/playPink.svg';
import playGreen from './icon/playGreen.svg';
const JOIN = true;
const LEAVE = false;
const IDLE = 0;
const SELECTING = 1;

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
    {imageButton(() => play(props, playing, setPlaying, JOIN), playing? playOn: playOff, "join")}
    {imageButton(() => play(props, playing, setPlaying, LEAVE), playing? glassOff: glassOn, "watch")}
    {imageButton(() => pause(props, paused, false, setPaused), paused? playPink: playGreen, "pause")}
    {imageButton(() => pause(props, paused, true, setPaused), paused? pauseGreen: pausePink, "pause")}
    {timer()}
  </div>;
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(IDLE);
  const [paused, setPaused] = useState(true);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, setPlaying, paused, setPaused)}
    {statusBar(playing, status)}
  </div>
}