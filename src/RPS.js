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
const URLH = 'http://10.0.0.143:32109/';

var ctime = 0;
var cpause = true;
var cset = {};
var rtime = 0;
var loadingBoard = false;
var sendingPause = false;

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

//TODO unhardcode the rps table name to allow multiple ladders
function sendPause(props) {
  if(sendingPause) { return; }
  sendingPause = true;
  props.axios.put(URLH+"rps/pause/_rps").then((resp) => receiveBoard(props, resp.data)).catch(
    (error) => {
      sendingPause = false;
      if(error.response) {
        props.setters.setBanner("Error in sendPause");
      } else {
        props.setters.setBanner("no sendPause response!");
      }
    }
  );
}

function pause(props, paused, setTo) {
  cpause = setTo;
  if(setTo) {
    sendPause(props);
  }
}

function statusBar(playing, phase) {
  if(playing) {
    if (phase == IDLE) return <div class="subtitle">Player (paused)</div>
    return <div class="subtitle">Player (make your choice) </div>
  }
  if (phase == IDLE) return <div class="subtitle">Observer (paused)</div>
  return <div class="subtitle">Observer (players are selecting)</div>
}

function play(props, playing, join) {
  if(playing === join) {
    return; // ignore: user clicked join when already playing or leave when not playing
  }
  //TODO notify server
  cset.setPlaying(join);
}

function playControl(props, playing, paused, time) {
  return <div class="horiz">
    <span>
      <div>
        {imageButton(() => play(props, playing, JOIN), playing? playOn: playOff, "join")}
        {imageButton(() => play(props, playing, LEAVE), playing? glassOff: glassOn, "watch")}
      </div>
      <div>
        {imageButton(() => pause(props, paused, false), paused? playPink: playGreen, "play")}
        {imageButton(() => pause(props, paused, true), paused? pauseGreen: pausePink, "pause")}
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

function isPaused(state) {
  return state === 0 || state === 3;
}

function remainingTime(init, start, pausedAt) {
  var delta = Math.floor((Date.now() - start) / 1000);
  return init - delta;
}

function receiveBoard(props, board) {
  loadingBoard = false;
  sendingPause = false;
  rtime = 5; //TODO figure out better refresh rate later
  cset.setBoard(board);
  cpause = isPaused(board.state); //TODO check status
  ctime = cpause ? board.time : remainingTime(board.time, board.timeStart);
  cset.setTime(ctime);
  cset.setPaused(cpause);
}

//TODO unhardcode the rps table name to allow multiple ladders
function loadBoard(props) {
  if(loadingBoard) { return; }
  loadingBoard = true;
  props.axios.get(URLH+"rps/status/_rps").then((resp) => receiveBoard(props, resp.data)).catch(
    (error) => {
      loadingBoard = false;
      if(error.response) {
        props.setters.setBanner("Error in getStatus");
      } else {
        props.setters.setBanner("no getStatus response!");
      }
    }
  );
}

function refreshBoard(props) {
  if(rtime > 0) return;
  loadBoard(props);
}

function tick(props) {
  if(ctime>0 && !cpause) {
    ctime--;
    cset.setTime(ctime);
  }

  if(rtime>0){
    rtime--;
  }

  refreshBoard(props);
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(IDLE);
  const [paused, setPaused] = useState(true);
  const [selection, setSelection] = useState(0);
  const [time, setTime] = useState(1000);
  const [board, setBoard] = useState(null);

  cset.setPlaying = setPlaying;
  cset.setStatus = setStatus;
  cset.setPaused = setPaused;
  cset.setSelection = setSelection;
  cset.setTime = setTime;
  cset.setBoard = setBoard;

  useEffect(() => {
    ctime = time;
    const handle = setInterval(() => tick(props, setTime), 1000);
    return () => clearInterval(handle);
  }, []);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, paused, time)}
    {statusBar(playing, status)}
    <div>
      {selector(props, playing, selection, setSelection)}
    </div>
  </div>
}