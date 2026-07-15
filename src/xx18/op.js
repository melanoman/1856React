import React, {useState, useEffect} from 'react';
import '../util.css'
import "./op.css";
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'
import { hexButtonD, squareButton, squareButtonD, roundButton, roundButtonD } from './button.js'

export function OperationPanel(props) {
  return <div>
    <div>{CorpTable(props)}</div>
    <div>{OpCommandBar(props)}</div>
  </div>
}

export function CorpTable(props) {
  var fsh = props.net.pt(22)
  var fs = props.net.pt(20)
  var fss = props.net.pt(15)
  return <table class='util-table'>
    {CorpHeaders(fsh)}
    {props.board.corps.map(x=>CorpRow(props, x, fs, fss))}
  </table>
}

function showTakeLoanButton(props, corp) {
  var color = corp.loanTaken ? 'lightgrey' : 'lightpink'
  var ht = props.net.ht(70);
  var f = ()=> { sendTakeLoan(props, corp.name) }
  return squareButtonD(f, 'LOAN', "$100", 'black', color, ht)
}

function privBuyLegal(props) {
  return true; // TODO check train length
}

function showBuyPrivButton(props, corp) {
  var color = privBuyLegal(props) ? 'lightgreen' : 'lightgrey'
  var ht = props.net.ht(70);
  var f = () => {} // TODO wire the button
  return squareButtonD(f, 'BUY', "PRIV", 'black', color, ht)
}

function findCurrentCorp(props) {
  return props.board.corps.find(x=>x.name === props.board.currentCorp)
}

function showWSToken(props, corp) {
  var color = corp.privs.includes("WS") ? 'lightblue' : 'lightgrey'
  var ht = props.net.ht(70);
  var f = () => {}
  return roundButtonD(f, "WS", "TOKEN", 'black', color, ht)
}

function privOwned(props, name) {
  var out = false;
  props.board.corps.forEach(x=>{if (x.privs.includes(name)) { out = true; }})
  return out;
}

function showBuyBridge(props, corp) {
  if (!privOwned(props, 'NIAG')) return
  var ht = props.net.ht(70);
  var f = () => {}
  return roundButtonD(f, "BRIDGE", "$50", 'black', 'lightgreen', ht)
}

function showBuyTunnel(props, corp) {
  if (!privOwned(props, 'STC')) return
  var ht = props.net.ht(70);
  var f = () => {}
  return roundButtonD(f, "TUNNEL", "$40", 'black', 'lightgreen', ht)
}

function showLayTile(props, corp) {
  var color = 'YELLOW'; //TODO change with train sales
  var ht = props.net.ht(70);
  var f = () => {}
  return hexButtonD(f, "DRILL", "$40", 'black', color, ht)
}

function sendTakeLoan(props, corpName) {
alert("name:"+props.board.name+" corp:"+corpName)
  props.net.put(props.net, "takeLoan/"+props.board.name+'/'+corpName)
}

function OpCommandBar(props) { //TODO switch on activity
  var corp = findCurrentCorp(props)
  return <div class='asker-title' >
    {showTakeLoanButton(props, corp)}
    {showBuyPrivButton(props, corp)}
    {showWSToken(props, corp)}
    {showBuyBridge(props, corp)}
    {showBuyTunnel(props, corp)}
    {showLayTile(props, corp)}
  </div>
}

function CorpHeaders(fs) {
  return <tr>
    <th/><th style={fs}>PREZ</th><th style={fs}>CASH</th>
    <th style={fs}>TOKEN</th><th style={fs}>RUN</th><th style={fs}>PRICE</th>
    <th style={fs}>LOANS</th><th style={fs}>TRAINS</th>
    <th style={fs}>RIGHTS</th><th style={fs}>IPO</th>
  </tr>
}

function corpClass(props, corp) {
  if(corp.par < 65) return "";
  if(props.board.currentCorp === corp.name) return "sel-corp";
  if(corp.hasMoved) return "faded";
  return "waiting";
}

function showTrain(train, ht) {
  if(train === 'D') return stockNameCert('TRAIN', ht)
  return countedStockCert('TRAIN', ht, train, 2, 'black')
}

function showCorpTrainsAndPrivs(props, corp, fs) {
  return <td style={fs}>
    {corp.trains.map(x=>showTrain(x, props.net.ht(30)))}
    {corp.privs.map(x=>privCert(x, props.net.ht(30)))}
  </td>
}

function showRights(corp, fs) {
  return <td style={fs}>
    {corp.bridgeRights?'b':'-'}{corp.portTunnel?'p':'-'}{corp.tunnelRights?'t':'-'}
  </td>
}

function showCorpCash(corp, fs, fss) {
  if(corp.escrow > 0) return <td style={fss}>{corp.cash}+{corp.escrow}</td>
  return <td style={fs}>{corp.cash}</td>
}

function CorpRow(props, corp, fs, fss) {
  if(corp.par < 65) return;
  var prezes = {}
  props.board.players.forEach(x=>x.shares.forEach(y=>{if(y.prez) prezes[y.corpName] = x.name}))
  return <tr class={corpClass(props, corp)}>
    <td style={fs}>{stockNameCert(corp.name, props.net.ht(40))}</td>
    <td style={fs}>{prezes[corp.name]}</td>
    {showCorpCash(corp, fs, fss)}
    <td style={fs}>{corp.tokensMax - corp.tokensUsed} / {corp.tokensMax}</td>
    <td style={fs}>{corp.run}</td>
    <td style={fs}>{isVoid(corp.price)?"":corp.price.price}</td>
    <td style={fs}>{corp.loans}</td>
    {showCorpTrainsAndPrivs(props, corp, fs)}
    {showRights(corp, fs)}
    <td style={fss}>{showFundType(corp)}</td>
  </tr>
}

function showFundType(corp) {
  if(!corp.incrementallyFunded) return "AT ONCE";
  if(corp.incrementallyFunded && !corp.destinationSatisfied) return "ESCROW";
  return "AS SOLD";
}