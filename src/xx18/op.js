import React, {useState, useEffect} from 'react';
import '../util.css'
import "./op.css";
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'

export function OperationPanel(props) {
  return <div>
    <div>{CorpTable(props)}</div>
    <div>{OpCommandBar(props)}</div>
  </div>
}

export function CorpTable(props) {
  return <table class='util-table'>
    {CorpHeaders()}
    {props.board.corps.map(x=>CorpRow(props, x))}
  </table>
}

function OpCommandBar(props) {
  return <div>TODO COMMAND BAR GOES HERE</div>
}

function CorpHeaders() {
  return <tr>
    <th/><th>PREZ</th><th>CASH</th><th>TOKEN</th><th>RUN</th><th>PRICE</th>
    <th>LOANS</th><th>TRAINS</th><th>RIGHTS</th><th>IPO</th>
  </tr>
}

function corpClass(props, corp) {
  if(corp.par < 65) return "";
  if(props.currentCorp === corp.name) return "selection";
  if(corp.hasMoved) return "faded";
  return "waiting";
}

function showTrain(train, ht) {
  if(train === 'D') return stockNameCert('TRAIN', ht)
  return countedStockCert('TRAIN', ht, train, 2, 'black')
}

function showCorpTrainsAndPrivs(props, corp) {
  return <td>
    {corp.trains.map(x=>showTrain(x, props.net.ht(30)))}
    {corp.privs.map(x=>privCert(x, props.net.ht(30)))}
  </td>
}

function showRights(corp) {
  return <td>
    {corp.bridgeRights?'b':'-'}{corp.portTunnel?'p':'-'}{corp.tunnelRights?'t':'-'}
  </td>
}

function showCorpCash(corp) {
  if(corp.escrow > 0) return <td>{corp.cash}+{corp.escrow}</td>
  return <td>{corp.cash}</td>
}

function CorpRow(props, corp) {
  if(corp.par < 65) return;
  var prezes = {}
  props.board.players.forEach(x=>x.shares.forEach(y=>{if(y.prez) prezes[y.corpName] = x.name}))
  return <tr class={corpClass(props, corp)}>
    <td>{stockNameCert(corp.name, props.net.ht(40))}</td>
    <td>{prezes[corp.name]}</td>
    {showCorpCash(corp)}
    <td>{corp.tokensMax - corp.tokensUsed} / {corp.tokensMax}</td>
    <td>{corp.run}</td>
    <td>{isVoid(corp.price)?"":corp.price.price}</td>
    <td>{corp.loans}</td>
    {showCorpTrainsAndPrivs(props, corp)}
    {showRights(corp)}
    <td>{showFundType(corp)}</td>
  </tr>
}

function showFundType(corp) {
  if(!corp.incrementallyFunded) return "AT ONCE";
  if(corp.incrementallyFunded && !corp.destinationSatisfied) return "ESCROW";
  return "AS SOLD";
}