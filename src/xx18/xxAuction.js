import React, {useState, useEffect} from 'react';
import '../util.css';
import { PRIVS, privCert } from './certs.js';

function auctionClick(name) {
  alert("TODO act on user input ")
}

function clickHeader(currentIndex, name) {
  var priv = PRIVS[name];
  if (priv.x >= currentIndex) return <th onClick={() => auctionClick(name)} >{privCert(name, 50)}</th>
  else return <th>{privCert('SOLD', 50)}</th>
}

function playerRow(player, player2bid, currentPlayer) {
  var clazz= (currentPlayer === player.name) ? "table-selection" : "";
  return <tr class={clazz}>
    <td>{player.name}</td>
    <td>{player2bid[player.name]['FLOS']}</td>
    <td>{player2bid[player.name]['WS']}</td>
    <td>{player2bid[player.name]['CAN']}</td>
    <td>{player2bid[player.name]['GLS']}</td>
    <td>{player2bid[player.name]['NIAG']}</td>
    <td>{player2bid[player.name]['STC']}</td>
  </tr>
}

function bidInputPanel() {}
function bidoffPanel() {}

export function Auction(props) {
  const [enterBid, setEnterBid] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);

  var currentIndex = PRIVS[props.board.currentCorp].x;
  var player2bid = {}
  var bidoff = false; // TODO extract from board activity
  props.board.players.map(player => player2bid[player.name] = {})
  props.board.bids.map(bid => player2bid[bid.player][bid.priv] = bid.amount);
  return <div>
    <table class='click-table'>
      <tr>
        <th />
        {clickHeader(currentIndex, 'FLOS')}
        {clickHeader(currentIndex, 'WS')}
        {clickHeader(currentIndex, 'CAN')}
        {clickHeader(currentIndex, 'GLS')}
        {clickHeader(currentIndex, 'NIAG')}
        {clickHeader(currentIndex, 'STC')}
      </tr>
      {props.board.players.map(player => playerRow(player, player2bid, props.board.currentPlayer))}
    </table>
    {bidInputPanel(props, enterBid, bidAmount)}
    {bidoffPanel(props, bidoff, bidAmount)}
  </div>
}