import React, {useState} from 'react';
import { countedStockCert } from './certs.js'
import { squareButtonCert } from './button.js'
import { imageButton, isVoid } from '../util.js'
import "../train.css"

import reset from '../icon/back.svg';
import go from '../icon/playGreen.svg';

const setters = {}

function findPrice(props, share) {
  return props.board.corps.filter(x=>x.name === share.corpName)[0].price.price
}

function makeSalesObject(props, share, prices) {
  var out = {}
  out['corpName'] = share.corpName;
  out['amount'] = 0;
  prices[share.corpName] = findPrice(props, share)
  return out;
}

function makeSalesButton(props, sale, debt, prices, ht, htt) {
  var cert = countedStockCert(sale.corpName, htt, sale.amount, 2, 'black')
  var f = () => { sale.amount = sale.amount + 1; setters.setDebt(debt - prices[sale.corpName]) }
  return squareButtonCert(f, sale.corpName, cert, 'black', 'lightpink', ht)
}

function resetSales(props, prices) {
  var debtors = props.board.players.filter(x=>x.cash<0)
  if(debtors.length == 0) return <div>ERROR:Forced Sale with no debt found</div>
  setters.setPrez(debtors[0])
  setters.setDebt(-debtors[0].cash)
  setters.setSalesList(debtors[0].shares.map(x=>makeSalesObject(props, x, prices)))
}

function sendAll(props, prez, salesList) {
  var turn = { }
  turn['salesList'] = salesList;
  props.net.put(props.net, "doForcedSale/"+props.board.name+"/"+prez.name, turn)
  setters.setSalesList(null)
}

export function ForcedSaleBar(props) {
  const[salesList, setSalesList] = useState(null);
  const[prez, setPrez] = useState({name:'PREZ NOT FOUND'})
  const[debt, setDebt] = useState(0)
  const[prices, setPrices] = useState({})

  setters.setSalesList = setSalesList
  setters.setPrez = setPrez
  setters.setDebt = setDebt

  if(isVoid(salesList)) {
    resetSales(props, prices)
    return
  }
  var ht = props.net.ht(70)
  var htt = props.net.ht(30)

  return <div>
    <div class="asker-title">{prez.name} {debt > 0 ? "owes" : "has"} {debt > 0 ? debt : -debt }</div>
    <div class="asker-title">
      <div>{salesList.map(x=>makeSalesButton(props, x, debt, prices, ht, htt))}</div>
      <div>{imageButton(()=>resetSales(props, prices), reset, "reset")}</div>
      <div>{imageButton(()=>sendAll(props, prez, salesList), go, "send")}</div>
    </div>
  </div>
}