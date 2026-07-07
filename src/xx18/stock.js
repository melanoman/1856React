import React, {useState, useEffect} from 'react';
import '../util.css'
import './stock.css'
import { stockNameCert, countedStockCert } from './certs.js'

import ff from '../icon/ff.svg';

const setters = {};

export function StockPanel(props) {
  const[settingPar, setSettingPar] = useState(false);
  const[parCorp, setParCorp] = useState(false);

  setters.setSettingPar = setSettingPar;
  setters.setParCorp = setParCorp;

  if(settingPar) return <div>
    <div>{StockTable(props)}</div>
    <div class="command-panel">
      TODO set Par for {parCorp.name}
    </div>
  </div>

  return <div>
    <div>{StockTable(props)}</div>
    <div>TODO This is the command bar (admin only)</div>
    <div>TODO This is the extra info section</div>
  </div>
}

function StockTable(props) {
  return <div>
    <table class="click-table">
      {StockHeaders(props)}
      {CashRow(props)}
      {BlankRow(props)}
      {props.board.corps.map(x => CorpRow(props, x))}
      {BlankRow(props)}
      {WealthRow(props)}
      {SizeRow(props)}
    </table>
  </div>
}

function priorityArrow(props, name) {
  if (props.board.priorityPlayer === name) {
    return <img src={ff} class="priority-arrow" alt="priority-marker"/>
  }
}

function playerHeader(props, p) {
  if (props.board.currentPlayer === p.name) {
    return <th class="selection wide5">{priorityArrow(props, p.name)}{p.name}</th>
  }
  return <th class="wide5">{priorityArrow(props, p.name)}{p.name}</th>
}

function StockHeaders(props) {
  return <tr>
    <th /><th />
    <th colspan="2">Bank</th><th colspan="2">Pool</th>
    <th />
    {props.board.players.map(p => playerHeader(props, p))}
  </tr>
}

function CashRow(props) {
  return <tr>
    <td>{stockNameCert("CASH", 30)}</td>
    <td class="breaker" />
    <td colspan='4'>{props.board.bank}</td>
    <td class="breaker" />
    {props.board.players.map(p=><td class={playerClass(props, p)}>{p.cash}</td>)}
  </tr>
}

function BlankRow(props) { //TODO min height
  return <tr>
    <td class="breaker" />
    <td class="breaker" />
    <td class="breaker" colspan='4' />
    <td class="breaker" />
    {props.board.players.map(p=>emptyPlayerCell(props, p, 'breaker'))}
  </tr>
}

function playerClass(props, player) {
  if (props.board.currentPlayer === player.name) return "selection"
  return ""
}

function emptyPlayerCell(props, player, clazz) {
  if (props.board.currentPlayer === player.name) return <td class="selection" />
  return <td class={clazz} />
}

function startSetingPar(props, corp) {
  setters.setSettingPar(true);
  setters.setParCorp(corp);
}

const SETPAR_BUTTON = <svg height='30px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70"><g>
  <path d="M 10 10 l 220 0 0 50 -220 0 0 -50" fill="lightyellow" stroke-width="2" stroke="black" />
  <text font-size="28px" x="65" y="45" fill="black">SET PAR</text>
</g></svg>

function BLANK(ht) {
 return <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill='white'/>
  </g></svg>
}

function shareCounter(name, shares, bWidth, bColor) {
  if(shares > 0) return countedStockCert(name, 30, shares, bWidth, bColor)
  return countedStockCert("NONE", 30, 0, 2, 'black')
}

function playerStockCell(props, p, corpName) {
  var clazz= playerClass(props, p)
  return <td class={clazz}>{countedStockCert(corpName, 30, 3, 6, 'orange')}</td>
}

function CorpRow(props, corp) {
  if(corp.par < 65) return <tr>
    <td class="rb2">{stockNameCert(corp.name, 30)}</td>
    <td class="breaker" />
    <td colspan='4' onClick={()=>startSetingPar(props, corp)}>{SETPAR_BUTTON}</td>
    <td class="breaker" />
    {props.board.players.map(p=>emptyPlayerCell(props, p))}
  </tr>
  return <tr>
    <td>{stockNameCert(corp.name, 30)}</td>
    <td class="breaker" />
    <td>{corp.par}</td>
    <td>{shareCounter(corp.name, corp.bankShares, 2, 'black')}</td>
    <td>{corp.price.price}</td>
    <td>{shareCounter(corp.name, corp.poolShares, 2, 'black')}</td>
    <td class="breaker" />
    {props.board.players.map(p=>playerStockCell(props, p, corp.name))}
  </tr>
}

function WealthRow(props) {
}

function SizeRow(props) {
}