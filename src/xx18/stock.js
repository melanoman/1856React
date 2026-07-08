import React, {useState, useEffect} from 'react';
import '../util.css'
import './stock.css'
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'

import cancel from '../icon/cancel.svg';
import check from '../icon/check.svg';
import ff from '../icon/ff.svg';
import go from '../icon/playGreen.svg';
import switcher from '../icon/swap.svg';

const setters = {};

export function StockPanel(props) {
  const[settingPar, setSettingPar] = useState(false);
  const[parCorp, setParCorp] = useState(false);
  const[parAmount, setParAmount] = useState(0);
  const[buyType, setBuyType] = useState(null);
  const[buyCorp, setBuyCorp] = useState(null);
  const[buyFirst, setBuyFirst] = useState(false);
  const[salesList, setSalesList] = useState([]);

  setters.setSettingPar = setSettingPar;
  setters.setParCorp = setParCorp;
  setters.setParAmount = setParAmount;
  setters.setBuyType = setBuyType;
  setters.setBuyCorp = setBuyCorp;
  setters.setBuyFirst = setBuyFirst;
  setters.setSalesList = setSalesList;

  if(settingPar) return <div>
    <div>{StockTable(props, salesList)}</div>
    <div>{ParSetter(props, parCorp, parAmount)}</div>
  </div>

  if(salesList.length > 0) {
    if(isVoid(buyType)) return <div>
      <div>{StockTable(props, salesList)}</div>
      <div class="asker-title">
        SALES ONLY
        {imageButton(()=>alert("TODO SELL"), go, "sell")}
        {imageButton(()=>clearAction(), cancel, "cancel")}
      </div>
    </div>

    if(buyFirst) return <div>
      <div>{StockTable(props, salesList)}</div>
      <div class="asker-title">
        Buy {stockNameCert(buyCorp.name, 50)} from { buyType }
        {imageButton(()=>setters.setBuyFirst(!buyFirst), switcher, "swap")}
        {showSalesList(salesList)}
        {imageButton(()=>alert("TODO buySell"), go, "buySell")}
        {imageButton(()=>clearAction(), cancel, "cancel")}
      </div>
    </div>

    return <div>
      <div>{StockTable(props, salesList)}</div>
      <div class="asker-title">
        SALES
        {imageButton(()=>setters.setBuyFirst(!buyFirst), switcher, "swap")}
        Buy {stockNameCert(buyCorp.name, 50)} from { buyType }
        {imageButton(()=>alert("TODO sellBuy"), go, "buySell")}
        {imageButton(()=>clearAction(), cancel, "cancel")}
      </div>
    </div>
  }

  if(isVoid(buyType)) return <div>
    <div>{StockTable(props, salesList)}</div>
    <div class="asker-title">PASS{imageButton(()=>sendPass(props), go, "pass")}</div>
  </div>

  return <div>
    <div>{StockTable(props, salesList)}</div>
    <div class="asker-title">
      Buy {stockNameCert(buyCorp.name, 50)} from { buyType }
      {imageButton(()=>sendBuy(props, buyType, buyCorp), go, "buy")}
      {imageButton(()=>setters.setBuyType(null), cancel, "cancel")}
    </div>
  </div>
}

function showSalesList(sales) {
  return sales.map(sale=>countedStockCert(sale.corpName, 50, sale.amount, 2, 'black'))
}

function clearAction() {
  setters.setSalesList([]);
  setters.setBuyType(null);
}

function StockTable(props, salesList) {
  return <div>
    <table class="click-table">
      {StockHeaders(props)}
      {CashRow(props)}
      {PrivRow(props)}
      {BlankRow(props)}
      {props.board.corps.map(x => CorpRow(props, x, salesList))}
      {BlankRow(props)}
      {WealthRow(props)}
      {SizeRow(props)}
    </table>
  </div>
}

function ParSetter(props, parCorp, parAmount) {
  return <div class="command-panel">
    <div class="asker-title">
      Set Par for {stockNameCert(parCorp.name, 50)}
      <input type="number" size="5" class="ask-box" onChange={(e) => setters.setParAmount(e.target.value)}
               onKeyDown={(e) => onEnter(e.key, () => sendPar(props, parCorp, parAmount))} />
      {imageButton(() => sendPar(props, parCorp, parAmount), check, "bid")}
      {imageButton(() => setters.setSettingPar(false), cancel, "cancel")}
    </div>
  </div>
}

function sendBuy(props) {
  alert("TODO sendBuy")
}

function sendPass(props) {
  props.net.put(props.net, "stockPass/"+props.board.name+'/'+props.board.currentPlayer)
}

function sendPar(props, corp, amount) {
  if (!props.net.admin) return;
  props.net.put(props.net, "setPar/"+props.board.name+"/"+corp.name+"/"+props.board.currentPlayer+"/"+amount)
  setters.setSettingPar(false);
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
    <th colspan="4">BANK</th>
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

function PrivRow(props) {
  return <tr>
    <td />
    <td class="breaker" />
    <td colspan='2'><span class="smaller">IPO</span></td>
    <td colspan='2'><span class="smaller">POOL</span></td>
    <td class="breaker" />
    {props.board.players.map(player=>playerPrivCell(props, player))}
  </tr>
}

function BlankRow(props) {
  return <tr>
    <td class="breaker" />
    <td class="breaker" />
    <td class="breaker" colspan='4' />
    <td class="breaker" />
    {props.board.players.map(p=><td class='breaker' />)}
  </tr>
}

function playerPrivCell(props, player) {
  return <td class={playerClass(props, player)}>
    {player.privs.map((priv)=><span>{privCert(priv, 30)}</span>)}
  </td>
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
  if(!props.net.admin) return;
  setters.setSettingPar(true);
  setters.setParCorp(corp);
  setters.setParAmount(0);
  setters.setBuyType(null);
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

function queueSale(corpName, salesList) {
  setters.setSalesList([{'corpName': corpName, 'amount': 1}]);  //TODO actually add to sales list
}

function saleClick(props, player, corp, salesList) {
  if(!props.net.admin) return
  if(player.name !== props.board.currentPlayer) { props.net.setBanner("Wrong player: "+player.name); return; }
  queueSale(corp.name, salesList)
}

function playerStockCell(props, p, corp, salesList) {
  var clazz = playerClass(props, p)
  var corps = p.shares.filter(x => x.corpName === corp.name)
  if (corps.length === 0) return <td class={clazz} />
  var thick = corps[0].prez ? 8 : 2;
  var color = p.blocks.includes(corp.name) ? 'orange' : 'black';
  var amount = corps[0].amount;

  return <td class={clazz} onClick={()=>saleClick(props, p, corp, salesList)}>
    {countedStockCert(corp.name, 30, amount, thick, color)}
  </td>
}

function prepBankBuy(props, corp) {
  if(!props.net.admin) return;
  setters.setBuyType('bank')
  setters.setBuyCorp(corp)
}

function prepPoolBuy(props, corp) {
  if(!props.net.admin) return;
  setters.setBuyType('pool')
  setters.setBuyCorp(corp)
}

function CorpRow(props, corp, salesList) {
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
    <td onClick={()=>prepBankBuy(props, corp)} >{shareCounter(corp.name, corp.bankShares, 2, 'black')}</td>
    <td>{corp.price.price}</td>
    <td onClick={()=>prepPoolBuy(props, corp)}>{shareCounter(corp.name, corp.poolShares, 2, 'black')}</td>
    <td class="breaker" />
    {props.board.players.map(p=>playerStockCell(props, p, corp, salesList))}
  </tr>
}

function WealthRow(props) {
}

function SizeRow(props) {
}