import React, {useState, useEffect} from 'react';
import '../util.css'
import './stock.css'
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { svgCert, privCert, stockNameCert, countedStockCert } from './certs.js'

import cancel from '../icon/cancel.svg';
import check from '../icon/check.svg';
import ff from '../icon/ff.svg';
import go from '../icon/playGreen.svg';
import switcher from '../icon/swap.svg';

const setters = {};

export function StockPanel(props) {
  const[settingPar, setSettingPar] = useState(false);
  const[parAmount, setParAmount] = useState(0);
  const[buyType, setBuyType] = useState(null);
  const[buyCorp, setBuyCorp] = useState(null);
  const[buyFirst, setBuyFirst] = useState(false);
  const[salesList, setSalesList] = useState([]);

  setters.setSettingPar = setSettingPar;
  setters.setParAmount = setParAmount;
  setters.setBuyType = setBuyType;
  setters.setBuyCorp = setBuyCorp;
  setters.setBuyFirst = setBuyFirst;
  setters.setSalesList = setSalesList;

  if(settingPar) return <div>
    <div>{StockTable(props, salesList)}</div>
    <div>{ParSetter(props, buyCorp, parAmount)}</div>
  </div>

  if(isVoid(buyType) && salesList.length === 0) return <div>
    <div>{StockTable(props, salesList)}</div>
    <div class="asker-title">PASS{imageButton(()=>sendPass(props), go, "pass")}</div>
  </div>

  var both = !isVoid(buyType) && salesList.length > 0

  return <div>
    <div>{StockTable(props, salesList)}</div>
    <div class="asker-title">
      {showBuyAction(props, buyFirst, buyType, buyCorp, parAmount)}
      {showSwapper(buyFirst && both, buyFirst)}
      {showSalesList(props, salesList)}
      {showSwapper(!buyFirst && both, buyFirst)}
      {showBuyAction(props, !buyFirst, buyType, buyCorp, parAmount)}
      {imageButton(()=>sendTurn(props, buyFirst, buyType, buyCorp, parAmount, salesList), go, "stockTurn")}
      {imageButton(()=>clearAction(), cancel, "cancel")}
    </div>
  </div>
}

function showSwapper(armed, buyFirst) {
  if(!armed) return
  return imageButton(()=>setters.setBuyFirst(!buyFirst), switcher, "swap")
}

function showBuyAction(props, armed, buyType, buyCorp, parAmount) {
  if (!armed || isVoid(buyType)) return
  return <span class="asker-title">
    Buy {stockNameCert(buyCorp.name, props.net.ht(50))} {showBuyText(buyType, buyCorp, parAmount)}
  </span>
}

function showBuyText(buyType, buyCorp, parAmount) {
  if(isVoid(buyType)) return
  if(buyType === 'par') return " at par "+parAmount
  return " from "+buyType
}

function showSalesList(props, sales) {
  if(!props.net.admin || sales.length === 0) return
  return <span class="asker-title">
    Sell {sales.map(sale=>countedStockCert(sale.corpName, props.net.ht(50), sale.amount, 2, 'black'))}
  </span>
}

function clearAction() {
  setters.setSalesList([]);
  setters.setBuyType(null);
}

export function StockTable(props, salesList) {
  var fsh = props.net.pt(22)
  var fs = props.net.pt(20)
  var fst = props.net.pt(15)
  return <div>
    <table class="xx18-table">
      {StockHeaders(props, fsh)}
      {CashRow(props, fs)}
      {PrivRow(props, fst)}
      {BlankRow(props)}
      {props.board.corps.map(x => CorpRow(props, x, salesList, fs))}
      {BlankRow(props)}
      {SizeRow(props, fs)}
      {WealthRow(props, fs)}
    </table>
  </div>
}

function ParSetter(props, parCorp, parAmount) {
  return <div class="command-panel">
    <div class="asker-title">
      Set Par for {stockNameCert(parCorp.name, props.net.ht(50))}
      <input type="number" size="5" class="ask-box" onChange={(e) => setters.setParAmount(e.target.value)}
              onKeyDown={(e) => onEnter(e.key, () => prepPar())} />
      {imageButton(() => prepPar(), check, "par")}
      {imageButton(() => setters.setSettingPar(false), cancel, "cancel")}
    </div>
  </div>
}

function sendTurn(props, buyFirst, buyType, buyCorp, buyPar, salesList) {
  if(!props.net.admin) return;
  var st = { }
  st.buyFirst = buyFirst;
  st.buyType = buyType;
  st.buyCorp = buyCorp.name;
  st.buyPar = buyPar; //TODO this should probably be parAmount, but has to match server
  st.salesList = salesList;
  props.net.put(props.net, "stockTurn/"+props.board.name+"/"+props.board.currentPlayer, st)
  setters.setBuyType(null);
  setters.setSalesList([]);
}

function sendPass(props) {
  if(!props.net.admin) return
  props.net.put(props.net, "stockPass/"+props.board.name+'/'+props.board.currentPlayer)
}

function prepPar() {
  setters.setBuyType('par')
  setters.setSettingPar(false)
}

function priorityArrow(props, name) {
  if (props.board.priorityPlayer === name) {
    return <img src={ff} class="priority-arrow" alt="priority-marker"/>
  }
}

function playerHeader(props, p, fs) {
  if (props.board.currentPlayer === p.name) {
    return <th class="selection pad5" style={fs}>{priorityArrow(props, p.name)}{p.name}</th>
  }
  return <th class="pad5" style={fs}>{priorityArrow(props, p.name)}{p.name}</th>
}

function StockHeaders(props, fs) {
  return <tr>
    <th /><th class="nopad"/>
    <th class = "pad5" colspan="4" style={fs}>BANK</th>
    <th />
    {props.board.players.map(p => playerHeader(props, p, fs))}
  </tr>
}

function CashRow(props, fs) {
  return <tr>
    <td style={fs}>{stockNameCert("CASH", props.net.ht(30))}</td>
    <td class="breaker"/>
    <td colspan='4' style={fs}>{props.board.bank}</td>
    <td class="breaker"/>
    {props.board.players.map(p=><td class={playerClass(props, p)} style={fs}>{p.cash}</td>)}
  </tr>
}

function PrivRow(props, fs) {
  return <tr>
    <td />
    <td class="breaker" />
    <td colspan='2'><span class="smaller" style={fs}>IPO</span></td>
    <td colspan='2'><span class="smaller" style={fs}>POOL</span></td>
    <td class="breaker" />
    {props.board.players.map(player=>playerPrivCell(props, player))}
  </tr>
}

function BlankRow(props) {
  return <tr>
    <td class="breaker" colspan='7' />
    {props.board.players.map(p=><td class='breaker' />)}
  </tr>
}

function playerPrivCell(props, player) {
  return <td class={playerClass(props, player)}>
    {player.privs.map((priv)=><span>{privCert(priv, props.net.ht(30))}</span>)}
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
  setters.setBuyCorp(corp);
  setters.setParAmount(0);
  setters.setBuyType(null);
}

function SETPAR_BUTTON(net) {
  var ht = net.ht(30);
  return <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70"><g>
    <path d="M 10 10 l 220 0 0 50 -220 0 0 -50" fill="lightyellow" stroke-width="2" stroke="black" />
    <text font-size="28px" x="65" y="45" fill="black">SET PAR</text>
  </g></svg>
}

function BLANK(ht) {
  return <svg height={ht} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill='white'/>
  </g></svg>
}

function shareCounter(props, name, shares, bWidth, bColor) {
  if(shares > 0) return countedStockCert(name, props.net.ht(30), shares, bWidth, bColor)
  return countedStockCert("NONE", props.net.ht(30), 0, 2, 'black')
}

function queueSale(corpName, salesList) {
  var key = salesList.filter(x=>x.corpName === corpName);
  if(key.length > 0) {
    key[0].amount = key[0].amount + 1;
  } else {
    salesList.push({'corpName': corpName, 'amount': 1})
  }
  setters.setSalesList(salesList.slice());
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
    {countedStockCert(corp.name, props.net.ht(30), amount, thick, color)}
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

function CorpRow(props, corp, salesList, fs) {
  if(corp.par < 65) return <tr>
    <td class="rb2">{stockNameCert(corp.name, props.net.ht(30))}</td>
    <td class="breaker" />
    <td colspan='4' onClick={()=>startSetingPar(props, corp)}>{SETPAR_BUTTON(props.net)}</td>
    <td class="breaker" />
    {props.board.players.map(p=>emptyPlayerCell(props, p))}
  </tr>
  return <tr>
    <td>{stockNameCert(corp.name, props.net.ht(30))}</td>
    <td class="breaker" />
    <td style={fs}>{corp.par}</td>
    <td onClick={()=>prepBankBuy(props, corp)} >{shareCounter(props, corp.name, corp.bankShares, 2, 'black')}</td>
    <td style={fs}>{corp.price.price}</td>
    <td onClick={()=>prepPoolBuy(props, corp)}>{shareCounter(props, corp.name, corp.poolShares, 2, 'black')}</td>
    <td class="breaker" />
    {props.board.players.map(p=>playerStockCell(props, p, corp, salesList))}
  </tr>
}

function WealthRow(props, fs) {
   return <tr>
    <td>{svgCert(props.net.ht(30), "$$$", 'black', 2, 'black', 'gray')}</td>
    <td class="breaker" />
    <td colspan='4' />
    <td class="breaker" />
    {props.board.players.map(x=><td>{x.wealth}</td>)}
  </tr>
}

function SizeRow(props, fs) {
  return <tr>
    <td>{svgCert(props.net.ht(30), "#", 'black', 2, 'black', 'gray')}</td>
    <td class="breaker" />
    <td colspan='4' />
    <td class="breaker" />
    {props.board.players.map(x=><td>{x.port}</td>)}
  </tr>
}