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
  return <table class='click-table'>
    {CorpHeaders()}
    {props.board.corps.map(x=>CorpRow(props, x))}
  </table>
}

function OpCommandBar(props) {
  return <div>TODO COMMAND BAR GOES HERE</div>
}

function CorpHeaders() {
  return <tr>
    <th/><th>PREZ</th><th>TOKEN</th><th>RUN</th><th>PRICE</th>
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
  if(train === 'D') return stockNameCert('TRAIN', 30)
  return countedStockCert('TRAIN', 30, train, 2, 'black')
}

function showCorpTrainsAndPrivs(corp) {
  return <td>
    {corp.trains.map(x=>showTrain(x, 30))}
    {corp.privs.map(x=>privCert(x, 30))}
  </td>
}

function CorpRow(props, corp) {
  if(corp.par < 65) return;
  var prezes = {}
  props.board.players.forEach(x=>x.shares.forEach(y=>{if(y.prez) prezes[y.corpName] = x.name}))
  return <tr class={corpClass(props, corp)}>
    <td>{stockNameCert(corp.name, 40)}</td>
    <td>{prezes[corp.name]}</td>
    <td>{corp.tokensMax - corp.tokensUsed} / {corp.tokensMax}</td>
    <td>{corp.run}</td>
    <td>{isVoid(corp.price)?"":corp.price.price}</td>
    <td>{corp.loans}</td>
    {showCorpTrainsAndPrivs(corp)}
    <td>RIGHTS</td>
    <td>{showFundType(corp)}</td>
  </tr>
}

function showFundType(corp) {
  if(!corp.incrementallyFunded) return "AT ONCE";
  if(corp.incrementallyFunded && !corp.destinationSatisfied) return "ESCROW";
  return "AS SOLD";
}