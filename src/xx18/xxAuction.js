import React, {useState, useEffect} from 'react';
import '../util.css';
import { PRIVS, privCert, stockNameCert, svgCert } from './certs.js';

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
  if (player.privs.includes(privName)) return <td>{privCert(privName, 45)}</td>
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
    <td>{playerCell(player, player2bid, 'FLOS')}</td>
    <td>{playerCell(player, player2bid, 'WS')}</td>
    <td>{playerCell(player, player2bid, 'CAN')}</td>
    <td>{playerCell(player, player2bid, 'GLS')}</td>
    <td>{playerCell(player, player2bid, 'NIAG')}</td>
    <td>{playerCell(player, player2bid, 'STC')}</td>
    <td />
  </tr>
}

function bidInputPanel(props, enterBid, bidPriv, bidAmount) {
  if(enterBid) return <div>
    TODO Enter Bid for {bidPriv} Here
  </div>
}

function bidoffPanel() {}

export function Auction(props) {
  const [enterBid, setEnterBid] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidPriv, setBidPriv] = useState(null);

  setters.setEnterBid = setEnterBid;
  setters.setBidAmount = setBidAmount;
  setters.setBidPriv = setBidPriv;

  var currentIndex = PRIVS[props.board.currentCorp].x;
  var player2bid = {}
  var bidoff = false; // TODO extract from board activity
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