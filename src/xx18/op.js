import React, {useState, useEffect} from 'react';
import '../util.css'
import "./op.css";
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'
import { squareButton, squareButtonD, roundButton, roundButtonD } from './button.js'

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

function OpCommandBar(props) {
  return <div class='asker-title' >
    TODO COMMAND BAR GOES HERE
    {squareButton(()=>alert("Click"), 'TODO', 'black', 'lightpink', '50pt')}
    {squareButtonD(()=>alert("Blam"), 'LOAN', "$100", 'black', 'lightpink', '50pt')}
    {squareButtonD(()=>alert("Blam"), 'BUY', "PRIV", 'black', 'lightgreen', '50pt')}
    {roundButton(()=>alert("BAM!"), '$40', 'black', 'lightblue', '50pt')}
    {roundButtonD(()=>alert("BAM!"), 'TOKEN', '$40', 'black', 'lightblue', '50pt')}
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