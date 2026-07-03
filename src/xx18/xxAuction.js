import React, {useState, useEffect} from 'react';
import { imageButton, onEnter } from "../util.js";
import '../util.css';
import { PRIVS, privCert, stockNameCert, svgCert } from './certs.js';

import cancel from '../icon/cancel.svg';
import check from '../icon/check.svg';
import ff from '../icon/ff.svg';

const setters = {}

function startBid(props, name) {
    setters.setEnterBid(true);
    setters.setBidPriv(name);
}

function buyPriv(props, name) {
  setters.setEnterBid(false);
  props.net.put(props.net, "buyPriv/"+props.board.name+"/"+name)
}

function clickHeader(props, currentIndex, name) {
  var priv = PRIVS[name];
  if (priv.x > currentIndex) {
    return <th onClick={() => startBid(props, name)} >{privCert(name, 50)}</th>
  } else if(priv.x == currentIndex) {
    return <th onClick={() => buyPriv(props, name)} >{privCert(name, 50)}</th>
  } else {
    return <th>{privCert('SOLD', 50)}</th>
  }
}

function doPass(props) {
  alert("TODO pass")
}

function passButton(props) {
  return <th onClick={() => doPass(props)}>{svgCert(50, 'PASS', 'black', 2, 'black', 'white')}</th>
}

function playerCell(player, player2bid, privName) {
  if (player.privs.includes(privName)) return <td>{privCert(privName, 50)}</td>
  else return <td>{player2bid[player.name][privName]}</td>
}

function priorityArrow(player, board) {
  if (board.currentPlayer === player.name) {
    return <td><img src={ff} class="priority-arrow" alt="priority-marker"/></td>
  }
  return <td />
}

function playerRow(player, player2bid, board) {
  var clazz= (board.currentPlayer === player.name) ? "table-selection" : "";
  return <tr class={clazz}>
    {priorityArrow(player, board)}
    <td>{player.name}</td>
    <td>{player.cash}</td>
    {playerCell(player, player2bid, 'FLOS')}
    {playerCell(player, player2bid, 'WS')}
    {playerCell(player, player2bid, 'CAN')}
    {playerCell(player, player2bid, 'GLS')}
    {playerCell(player, player2bid, 'NIAG')}
    {playerCell(player, player2bid, 'STC')}
    <td />
  </tr>
}

function sendBid(props, bidPriv, bidAmount) {
  props.net.put(props.net, "bid/"+props.board.name+"/"+bidPriv+'/'+bidAmount)
  setters.setEnterBid(false);
  setters.setBidAmount(0);
}

function bidInputPanel(props, enterBid, bidPriv, bidAmount) {
  if(enterBid) return <div>
    <div>
      <div class="asker-title">Bid on {privCert(bidPriv, 50)}</div>
      <div class="asker">
        Amount
        <input type="number" size="5" class="ask-box" onChange={(e) => setters.setBidAmount(e.target.value)}
               onKeyDown={(e) => onEnter(e.key, () => sendBid(props, bidPriv, bidAmount))} />
      </div>
    </div>
    <div>
      {imageButton(() => sendBid(props, bidPriv, bidAmount), check, "bid")}
      {imageButton(() => setters.setEnterBid(false), cancel, "cancel")}
    </div>
  </div>
}

function bidoffPanel(props, bidoff, bidAmount) {
  if(bidoff) return <div>
    <div>Activate Bidoff Panel</div>
  </div>
  return <div>No Bidoff</div>
}

export function Auction(props) {
  const [enterBid, setEnterBid] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidPriv, setBidPriv] = useState(null);

  setters.setEnterBid = setEnterBid;
  setters.setBidAmount = setBidAmount;
  setters.setBidPriv = setBidPriv;

  var currentIndex = PRIVS[props.board.currentCorp].x;
  var player2bid = {}
  var bidoff = props.board.activity === "bidoff";
  props.board.players.map(player => player2bid[player.name] = {})
  props.board.bids.map(bid => player2bid[bid.player][bid.priv] = bid.amount);
  return <div>
    <table class='click-table'>
      <tr>
        <th /><th />
        <th>{ stockNameCert("CASH", 50) }</th>
        {clickHeader(props, currentIndex, 'FLOS')}
        {clickHeader(props, currentIndex, 'WS')}
        {clickHeader(props, currentIndex, 'CAN')}
        {clickHeader(props, currentIndex, 'GLS')}
        {clickHeader(props, currentIndex, 'NIAG')}
        {clickHeader(props, currentIndex, 'STC')}
        {passButton(props)}
      </tr>
      {props.board.players.map(player => playerRow(player, player2bid, props.board))}
    </table>
    {bidInputPanel(props, enterBid, bidPriv, bidAmount)}
    {bidoffPanel(props, bidoff, bidAmount)}
  </div>
}