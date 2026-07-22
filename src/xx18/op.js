import React, {useState, useEffect} from 'react';
import '../util.css'
import "./op.css";
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'
import { rectButton, hexButtonD, squareButton, squareButtonCert, squareButtonD, roundButton, roundButtonD } from './button.js'
import { StockTable } from './stock.js'

import cancel from '../icon/cancel.svg';
import check from '../icon/check.svg';
import go from '../icon/playGreen.svg';

const OP_PRE = "opPre";
const OP_POST = "opPost";

var setters = {}

export function OperationPanel(props) {
  const[revAmount, setRevAmount] = useState(false);
  const[buyingCorpTrain, setBuyingCorpTrain] = useState(false);
  const[otherCorp, setOtherCorp] = useState(null);
  const[trainSize, setTrainSize] = useState(null);
  const[trainPrice, setTrainPrice] = useState(0);
  setters.setRevAmount = setRevAmount;
  setters.setBuyingCorpTrain = setBuyingCorpTrain;
  setters.setOtherCorp = setOtherCorp;
  setters.setTrainSize = setTrainSize;
  setters.setTrainPrice = setTrainPrice;

  return <div>
    <div>{CorpTable(props)}</div>
    <div>{OpCommandBar(props, revAmount, buyingCorpTrain, otherCorp, trainSize, trainPrice)}</div>
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
  var amount = (props.board.activity === OP_PRE) ? '$100' : '$90'
  var f = ()=> { sendTakeLoan(props, corp.name) }
  return squareButtonD(f, 'LOAN', amount, 'black', color, ht)
}

function privBuyLegal(props) {
  return props.board.trains.length < 14
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
  if (!corp.privs.includes("WS")) return
  var ht = props.net.ht(70);
  var f = () => {}
  return roundButtonD(f, "WS", "TOKEN", 'black', 'lightgreen', ht)
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

function tileColor(sz) {
  if (sz > 13) return 'YELLOW'
  if (sz > 4) return 'GREEN'
  if (sz > 1) return "BROWN"
  return "GRAY"
}

function showLayTile(props, corp) {
  var color = tileColor(props.board.trains.length)
  var ht = props.net.ht(70);
  var f = () => { sendDrill(props, corp.name) }
  return hexButtonD(f, "DRILL", "$40", 'black', color, ht)
}

function showLayToken(props, corp) {
  if (!corp.tokenLaid && corp.tokensUsed >= corp.tokensMax) return
  var color = corp.tokenLaid ? 'lightgrey' : 'lightblue'
  var ht = props.net.ht(70);
  var price = (corp.tokensUsed < 2) ? 40 : 100;
  var f = () => { sendLayToken(props, corp.name) }
  return roundButtonD(f, "TOKEN", '$'+price, 'black', color, ht)
}

function showBuyTrainButtons(props, corp) {
  // TODO abort if max trains
  var out = []
  var ht = props.net.ht(70);
  if(props.board.trains.length > 0) {
    var f = () => sendBuyBankTrain(props, corp.name, props.board.trains[0])
    var train = showTrain(props.board.trains[0], props.net.ht(30))
    // TODO grey out if too little money
    out.push(squareButtonCert(f, "BANK", train, 'black', 'lightgreen', ht))
  }
  if(props.board.trains.length < 2) {
    var f = () => sendBuyBankDiesel(props, corp.name)
    var train = showTrain('D', props.net.ht(30))
    // TODO grey out if too little money
    out.push(squareButtonCert(f, "BANK", train, 'black', 'lightgreen', ht))
    // TODO add D trade-ins
  }
  var f = () => { if(props.net.admin) { setters.setBuyingCorpTrain(true); }}
  var train = showTrain('#?', props.net.ht(30))
  var color = corp.cash < 1 ? 'lightgrey' : 'lightgreen'
  out.push(squareButtonCert(f, "CORP", train, 'black', color, ht))
  // TODO add POOL train buttons
  return out
}

function showDestButton(props, corp) {
  if (corp.destinationSatisfied) return
  var ht = props.net.ht(70);
  var f = () => { sendDest(props, corp.name) }
  return roundButtonD(f, "REACH", "DEST", 'black', 'lightyellow', ht)
}

function showRedeemButton(props, corp) {
  var color = corp.loans < 1 || corp.cash < 100 ? 'lightgrey' : 'lightpink'
  var ht = props.net.ht(70);
  var f = ()=> { sendRedeemLoan(props, corp.name) }
  return squareButtonD(f, 'REPAY', "$100", 'black', color, ht)
}

function sendBuyCorpTrain(props, corp, seller, size, price) {
  alert("TODO CORP TO CORP TRAIN SALE")
}

function sendRedeemLoan(props, corpName) {
  props.net.put(props.net, "redeem/"+props.board.name+"/"+corpName)
}

function sendTakeLoan(props, corpName) {
  props.net.put(props.net, "takeLoan/"+props.board.name+'/'+corpName)
}

function sendLayToken(props, corpName) {
  props.net.put(props.net, "layToken/"+props.board.name+'/'+corpName)
}

function sendDest(props, corpName) {
  props.net.put(props.net, "destReached/"+props.board.name+'/'+corpName)
}

function sendDrill(props, corpName) {
  props.net.put(props.net, "drillTile/"+props.board.name+'/'+corpName)
}

function sendPayout(props, corpName, amount) {
  props.net.put(props.net, "paydiv/"+props.board.name+'/'+corpName+'/'+amount)
  setters.setRevAmount(0)
}

function sendWithhold(props, corpName, amount) {
  props.net.put(props.net, "withhold/"+props.board.name+'/'+corpName+'/'+amount)
}

function sendBuyBankTrain(props, corpName, size) {
  props.net.put(props.net, "buyBankTrain/"+props.board.name+'/'+corpName+'/'+size);
}

function sendBuyBankDiesel(props, corpName) {
  props.net.put(props.net, "buyBankD/"+props.board.name+'/'+corpName);
}

function revenueInputControl(props, corp, revAmount, ht) {
  return <div class="asker-title">
    Revenue
    <input type="number" size="5" class="ask-box" value={ revAmount } onChange={(e) => setters.setRevAmount(e.target.value)} />
    {rectButton(() => sendWithhold(props, corp.name, revAmount), "WITHHOLD", 'black', 'lightyellow', props.net.ht(40))}
    {rectButton(() => sendPayout(props, corp.name, revAmount), "PAY OUT", 'black', 'lightyellow', props.net.ht(40))}
  </div>
}

function sendNoRoute() {}
function sendForcedTrainBuy() {}
function sendNextTurn(props, corpName) {
  props.net.put(props.net, "endOpTurn/"+props.board.name+'/'+corpName)
}

function endOpTurnControl(props, corp) {
  if(corp.trains.length > 0) return imageButton(() => sendNextTurn(props, corp.name), go, "nextTurn")
  var train = props.board.trains.length > 0 ? props.board.trains[0] : 0;
  var cert = countedStockCert('TRAIN', props.net.ht(30), train, 2, 'black')
  var ht = props.net.ht(70)
  return [
      squareButtonD(() => sendNoRoute(props, corp.name), 'END NO', 'ROUTE', 'white', 'darkgrey', ht),
      squareButtonCert(() => sendForcedTrainBuy(props, corp.name), 'FORCED', cert, 'white', 'darkgrey', ht)
  ]
}

function OpCommandBar(props, revAmount, selling, seller, size, price) {
  if(props.board.activity === OP_PRE) return OpPreCommandBar(props, revAmount)
  if(props.board.activity === OP_POST) return OpPostCommandBar(props, selling, seller, size, price)
  return <div>UNKNOWN ACTIVITY {props.board.activity}</div>
}

function OpPreCommandBar(props, revAmount) { //TODO switch on activity
  var corp = findCurrentCorp(props)

  return <div>
    <div class='asker-title' >
      {showTakeLoanButton(props, corp)}
      {showBuyPrivButton(props, corp)}
      {showWSToken(props, corp)}
      {showBuyBridge(props, corp)}
      {showBuyTunnel(props, corp)}
      {showLayTile(props, corp)}
      {showLayToken(props, corp)}
    </div>
    {revenueInputControl(props, corp, revAmount)}
  </div>
}

function chooseSellerButton(props, buyer, seller) {
  if(seller.name === buyer.name) return
  if(seller.trains.length < 1) return
  var f = () => { setters.setOtherCorp(seller) }
  var ht = props.net.ht(70)
  var cert = stockNameCert(seller.name, props.net.ht(30))
  return squareButtonCert(f, 'FROM', cert, 'black', 'lightgreen', ht)
}

function pickTrainButton(props, seller, train) {
  var f = () => {setters.setTrainSize(train)}
  var ht = props.net.ht(70)
  var cert = countedStockCert('TRAIN', props.net.ht(30), train, 2, 'black')
  return squareButtonCert(f, seller.name, cert, 'black', 'lightgreen', ht)
}

function cancelCorpTrainSale() {
  setters.setBuyingCorpTrain(false)
  setters.setOtherCorp(null)
  setters.setTrainSize(null)
  setters.setTrainPrice(null)
}

function CorpTrainSaleBar(props, corp, seller, size, price) {
  if (isVoid(seller)) {
    return <div class='asker-title'>
      {props.board.corps.map(x => chooseSellerButton(props, corp, x))}
      {imageButton(cancelCorpTrainSale, cancel, "cancel")}
    </div>
  }
  if (isVoid(size) || size < 2) {
    return <div class='asker-title'>
      {seller.trains.map(x => pickTrainButton(props, seller, x))}
      {imageButton(cancelCorpTrainSale, cancel, "cancel")}
    </div>
  }
  var trainCert = countedStockCert('TRAIN', props.net.ht(50), size, 2, 'black')
  var sellerCert = stockNameCert(seller.name, props.net.ht(50))
  return <div class='asker-title'>
    BUY {trainCert} FROM { sellerCert } FOR $
    <input type="number" size="5" class="ask-box" onChange={(e) => setters.setTrainPrice(e.target.value)} />
    {imageButton(() => { sendBuyCorpTrain(props, corp, seller, size, price)}, check, "cancel")}
    {imageButton(cancelCorpTrainSale, cancel, "cancel")}
  </div>
}

function OpPostCommandBar(props, selling, seller, size, price) {
  var corp = findCurrentCorp(props)
  if(selling) return CorpTrainSaleBar(props, corp, seller, size, price)

  return <div>
    <div class='asker-title' >
      {showTakeLoanButton(props, corp)}
      {showBuyPrivButton(props, corp)}
      {showBuyBridge(props, corp)}
      {showBuyTunnel(props, corp)}
      {showBuyTrainButtons(props, corp)}
      {showDestButton(props, corp)}
      {showRedeemButton(props, corp)}
      {endOpTurnControl(props, corp)}
    </div>
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
  if(corp.hasOperated) return "faded";
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
  var sz = (corp.tokensUsed > 0) ? props.net.ht(40) : props.net.ht(25)
  var prezes = {}
  props.board.players.forEach(x=>x.shares.forEach(y=>{if(y.prez) prezes[y.corpName] = x.name}))
  return <tr class={corpClass(props, corp)}>
    <td style={fs}>{stockNameCert(corp.name, sz)}</td>
    <td style={fs}>{prezes[corp.name]}</td>
    {showCorpCash(corp, fs, fss)}
    <td style={fs}>{corp.tokensMax - corp.tokensUsed} / {corp.tokensMax}</td>
    <td style={fs}>{corp.lastRun}</td>
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

function showTrainBucket(trains, sz, ht) {
  return trains.filter(x=>x === sz).map(x=>countedStockCert('TRAIN', ht, sz, 2, 'black'))
}

function showPoolTrains() {} //TODO display pool trains

export function showTrainMarket(board, ht) {
  var trains = board.trains;
  return <div>
    <div>BANK</div>
    <div>{showTrainBucket(trains, 2, ht)}</div>
    <div>{showTrainBucket(trains, 3, ht)}</div>
    <div>{showTrainBucket(trains, 4, ht)}</div>
    <div>{showTrainBucket(trains, 5, ht)}</div>
    <div>{showTrainBucket(trains, 6, ht)}</div>
    <div>{showPoolTrains(board.poolTrains, ht)}</div>
  </div>
}