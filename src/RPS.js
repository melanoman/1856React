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
import up from './icon/up.svg'
import down from './icon/down.svg'
import eq from './icon/eq.svg'
import gt from './icon/gt.svg'
import lt from './icon/lt.svg'

const JOIN = true;
const LEAVE = false;

const VIRGIN = -1;
const PAUSED = 0;
const MOVING = 1;
const ANNOUNCING = 2;
const STOPPED = 3;

const ROCK = "rock";
const PAPER = "paper";
const SCISSORS = "scissors";
const URLH = 'http://10.0.0.143:32109/';

var ctime = 0;
var cpause = true;
var cset = {};
var rtime = 0;
var loadingBoard = false;
var sendingPause = false;
var reseating = false;
var makingMove = false;

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
function sendPause(props, op) {
  if(sendingPause) { return; }
  sendingPause = true;
  props.axios.put(URLH+"rps/"+op+"/_rps").then((resp) => receiveBoard(props, resp.data)).catch(
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
  sendPause(props, setTo ? "pause" : "resume");
}

function statusBar(playing, phase) {
  if(playing) {
    if (phase == MOVING || phase == PAUSED) return <div class="subtitle">Player (make your choice) </div>
    if (phase == VIRGIN) return <div class="subtitle">Player (game has not started)</div>
    return <div class="subtitle">Player (announcing results)</div>
  }
  if (phase == MOVING || phase == PAUSED) return <div class="subtitle">Observer (players are selecting)</div>
  if (phase == VIRGIN) return <div class="subtitle">Observer (game has not started)</div>
  return <div class="subtitle">Observer (announcing results)</div>
}

function receiveSeat(seat) {
  reseating = false;
  cset.setPlaying(seat === "player");
}

function sendReseating(props, join) {
  if(reseating) { return; }
  var cmd = join ? (URLH+"table/resit/_rps/player/"+props.user) :
                   (URLH+"table/resit/_rps/observer/"+props.user);
  reseating = true;
  props.axios.put(cmd).then((resp) => receiveSeat(resp.data)).catch(
    (error) => {
      reseating = false;
      if(error.response) {
        props.setters.setBanner("Error in getSeat");
      } else {
        props.setters.setBanner("no getSeat response!");
      }
    }
  );
}

function receiveSelection(sel) {
  makingMove = false;
  cset.setSelection(sel);
}

function sendMove(props, move) {
  if(makingMove) { return; }
  var cmd = URLH+"rps/move/_rps/" + props.user + "/" + move;
  makingMove = true;
  props.axios.put(cmd).then((resp) => receiveSelection(resp.data)).catch(
    (error) => {
      makingMove = false;
      if(error.response) {
        props.setters.setBanner("Error in makeMove");
      } else {
        props.setters.setBanner("no makeMove response!");
      }
    }
  );
}

function play(props, playing, join) {
  if(playing === join) {
    return; // ignore: user clicked join when already playing or leave when not playing
  }
  sendReseating(props, join);
}

function playControl(props, playing, paused, time) {
  return <div class="horiz">
    <span>
      <div>
        {imageButton(() => play(props, playing, JOIN), playing? playOn: playOff, true)}
        {imageButton(() => play(props, playing, LEAVE), playing? glassOff: glassOn, false)}
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

function select(props, selection, newSel) {
  if(selection === newSel) { return; }
  sendMove(props, newSel);
}

function selector(props, playing, selection, setSelection) {
  if(playing) {
    return <div>
      {bigImageButton(() => select(props, selection, ROCK),
                selection === ROCK ? rockGreen: rockPink, ROCK)}
      {bigImageButton(() => select(props, selection, PAPER),
                selection === PAPER ? paperGreen: paperPink, PAPER)}
      {bigImageButton(() => select(props, selection, SCISSORS),
                selection === SCISSORS ? sciGreen: sciPink, SCISSORS)}
    </div>;
  }
}

function isPaused(state) {
  return state === -1 || state === 0 || state === 3;
}

function remainingTime(init, start, pausedAt) {
  var delta = Math.floor((Date.now() - start) / 1000);
  return init - delta;
}

function receiveBoard(props, board) {
  loadingBoard = false;
  sendingPause = false;
  rtime = 1; //TODO figure out better refresh rate later
  cset.setBoard(board);
  cpause = isPaused(board.state); //TODO check status
  ctime = cpause ? board.time : remainingTime(board.time, board.timeStart);
  cset.setTime(ctime);
  cset.setPaused(cpause);
  cset.setStatus(board.state);
  cset.setLadder(board.results);
  if(board.state == 2) {
    cset.setSelection("");
  }
}

//TODO unhardcode the rps table name to allow multiple ladders
function loadBoard(props) {
  if(loadingBoard) { return; }
  loadingBoard = true;
  props.axios.get(URLH+"rps/status/_rps").then((resp) => receiveBoard(props, resp.data)).catch(
    (error) => {
      loadingBoard = false;
      if(error.response) {
        props.setters.setBanner("Error in loadBoard");
      } else {
        props.setters.setBanner("no loadBoard response!");
      }
    }
  );
}

function tick(props) {
  loadBoard(props);
}

function rungClass(par) {
  return par ? "rung-even" : "rung-odd";
}

function upDown(delta) {
  switch (delta) { //TODO return images
    case 1: return <img src={up} class="rung-icon" />
    case 0: return;
    case -1: return <img src={down} class="rung-icon" />
  }
  return delta;
}

function choiceImageW(choice) {
  switch(choice) {
    case 'rock': return <img class="rung-choice" src={rockGreen} />
    case 'paper': return <img class="rung-choice" src={paperGreen} />
    case 'scissors': return <img class="rung-choice" src={sciGreen} />
  }
  return '['+choice+']'; //TODO replace with image
}

function choiceImageL(choice) {
  switch(choice) {
    case 'rock': return <img class="rung-choice" src={rockPink} />
    case 'paper': return <img class="rung-choice" src={paperPink} />
    case 'scissors': return <img class="rung-choice" src={sciPink} />
  }
  return '['+choice+']'; //TODO replace with image
}

function eqIcon() {
  return <img src={eq} class="rung-choice" />
}

function gtIcon() {
  return <img src={gt} class="rung-choice" />
}

function ltIcon() {
  return <img src={lt} class="rung-choice" />
}

function lastResult(rung) {
  switch(rung.type) { //TODO return images
    case "Bye": return <span>bye</span>
    case "New": return <span>joined</span>
    case "forfeiter": return <span>{rung.player} forfeited to {rung.opponent}</span>
    case "forfeitee": return <span>{rung.player} won by forfeit over {rung.opponent}</span>
    case "2xforfeit": return <span>{rung.player} and {rung.opponent} did not enter choices</span>

    case "draw": return <span>
      {rung.player} {choiceImageW(rung.choice)} {eqIcon()} {choiceImageW(rung.ochoice)} {rung.opponent}
    </span>
    case "win": return <span>
      {rung.player} {choiceImageW(rung.choice)} {gtIcon()} {choiceImageW(rung.ochoice)} {rung.opponent}
    </span>
    case "lose": case "win": return <span>
      {rung.player} {choiceImageL(rung.choice)} {ltIcon()}  {choiceImageL(rung.ochoice)} {rung.opponent}
    </span>
    default: return <span>unknown result type</span>;
  }
}

function showResult(rung) {
  return <td>{upDown(rung.delta)} {lastResult(rung)}</td>
}

function showRung(rung) {
  return <tr>
    <td class={rungClass(rung.parity)}>{rung.player}</td>
    <td />
    <td>{showResult(rung)}</td>
  </tr>
}

function showLadder(ladder, board) {
  return <div>
    <table class="stable">
      <tr><th>Player</th><th /><th>Previous Result</th></tr>
      {ladder.map((rung => showRung(rung)))}
    </table>
  </div>
}

export function RPSPanel(props) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState(VIRGIN);
  const [paused, setPaused] = useState(true);
  const [selection, setSelection] = useState(0);
  const [time, setTime] = useState(0);
  const [board, setBoard] = useState(null);
  const [ladder, setLadder] = useState([]);

  cset.setPlaying = setPlaying;
  cset.setStatus = setStatus;
  cset.setPaused = setPaused;
  cset.setSelection = setSelection;
  cset.setTime = setTime;
  cset.setBoard = setBoard;
  cset.setLadder = setLadder;

  useEffect(() => {
    ctime = time;
    const handle = setInterval(() => tick(props, setTime), 1000);
    return () => clearInterval(handle);
  }, []);

  return <div>
    <div class="title">Roshambo (Rock Paper Scissors)</div>
    {playControl(props, playing, paused, time, ladder)}
    {statusBar(playing, status)}
    <div>
      {selector(props, playing, selection, setSelection)}
      {showLadder(ladder, board)}
    </div>
  </div>
}