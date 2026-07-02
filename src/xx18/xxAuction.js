import React, {useState, useEffect} from 'react';
import '../util.css';
import { PRIVS, privCert, stockNameCert } from './certs.js';

const setters = {}

function startBid(props, name) {
    setters.setEnterBid(true);
    setters.setBidPriv(name);
}

function buyPriv(props, name) {
  setters.setEnterBid(false);
  alert("Buy "+name)
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

function playerRow(player, player2bid, currentPlayer) {
  var clazz= (currentPlayer === player.name) ? "table-selection" : "";
  return <tr class={clazz}>
    <td>{player.name}</td>
    <td>{player.cash}</td>
    <td>{player2bid[player.name]['FLOS']}</td>
    <td>{player2bid[player.name]['WS']}</td>
    <td>{player2bid[player.name]['CAN']}</td>
    <td>{player2bid[player.name]['GLS']}</td>
    <td>{player2bid[player.name]['NIAG']}</td>
    <td>{player2bid[player.name]['STC']}</td>
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
        <th />
        <th>{ stockNameCert("CASH", 50) }</th>
        {clickHeader(props, currentIndex, 'FLOS')}
        {clickHeader(props, currentIndex, 'WS')}
        {clickHeader(props, currentIndex, 'CAN')}
        {clickHeader(props, currentIndex, 'GLS')}
        {clickHeader(props, currentIndex, 'NIAG')}
        {clickHeader(props, currentIndex, 'STC')}
      </tr>
      {props.board.players.map(player => playerRow(player, player2bid, props.board.currentPlayer))}
    </table>
    {bidInputPanel(props, enterBid, bidPriv, bidAmount)}
    {bidoffPanel(props, bidoff, bidAmount)}
  </div>
}