import React, {useState, useEffect} from 'react';
import '../util.css'
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
  return <tr><th/><th>PREZ</th><th>TOKEN</th><th>RUN</th><th>PRICE</th><th>LOANS</th><th>TRAINS</th><th>RIGHTS</th></tr>
}

function CorpRow(props, corp) {
  var prezes = {}
  props.board.players.forEach(x=>x.shares.forEach(y=>{if(y.prez) prezes[y.corpName] = x.name}))
  return <tr>
    <td>{stockNameCert(corp.name, 30)}</td>
    <td>{prezes[corp.name]}</td>
    <td>{corp.tokensMax - corp.tokensUsed} / {corp.tokensMax}</td>
    <td>{corp.run}</td>
    <td>{isVoid(corp.price)?"":corp.price.price}</td>
    <td>{corp.loans}</td>
    <td>TRAINS</td>
    <td>RIGHTS</td>
  </tr>
}