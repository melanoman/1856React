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
const CALL_LOAN = "callLoan";
const ASK_TOKENS = "askCGRTokens";

var setters = {}

export function OperationPanel(props) {
  const[revAmount, setRevAmount] = useState(0);
  const[buyingCorpTrain, setBuyingCorpTrain] = useState(false);
  const[otherCorp, setOtherCorp] = useState(null);
  const[trainSize, setTrainSize] = useState(null);
  const[trainPrice, setTrainPrice] = useState(0);
  const[buyingPriv, setBuyingPriv] = useState(false);
  const[privToBuy, setPrivToBuy] = useState(null);
  const[privPrice, setPrivPrice] = useState(0);
  const[tokenCount, setTokenCount] = useState(0);
  setters.setRevAmount = setRevAmount;
  setters.setBuyingCorpTrain = setBuyingCorpTrain;
  setters.setOtherCorp = setOtherCorp;
  setters.setTrainSize = setTrainSize;
  setters.setTrainPrice = setTrainPrice;
  setters.setBuyingPriv = setBuyingPriv;
  setters.setPrivToBuy = setPrivToBuy;
  setters.setPrivPrice = setPrivPrice;
  setters.setTokenCount = setTokenCount;

  return <div>
    <div>{CorpTable(props)}</div>
    <div>{OpCommandBar(props, revAmount,
                       buyingCorpTrain, otherCorp, trainSize, trainPrice,
                       buyingPriv, privToBuy, privPrice,
                       tokenCount)}
    </div>
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

function simpleCorpAction(props, corpName, action) {
  props.net.put(props.net, action+'/'+props.board.name+'/'+corpName)
}

function showTakeLoanButton(props, corp) {
  var color = corp.loanTaken ? 'lightgrey' : 'lightpink'
  var ht = props.net.ht(70);
  var amount = (props.board.activity === OP_PRE) ? '$100' : '$90'
  var f = () => { simpleCorpAction(props, corp.name, "takeLoan")}
  return squareButtonD(f, 'LOAN', amount, 'black', color, ht)
}

function privBuyLegal(props) {
  return props.board.trains.length < 14
}

function showBuyPrivButton(props, corp) {
  if (props.board.trains.length < 5) return
  var color = privBuyLegal(props) ? 'lightgreen' : 'lightgrey'
  var ht = props.net.ht(70);
  var f = () => { if (props.net.admin) setters.setBuyingPriv(true); }
  return squareButtonD(f, 'BUY', "PRIV", 'black', color, ht)
}

function findCurrentCorp(props) {
  return props.board.corps.find(x=>x.name === props.board.currentCorp)
}

function findCurrentPlayer(props) {
  return props.board.players.find(x=>x.name === props.board.currentPlayer)
}

function findCorp(props, name) {
  return props.board.corps.find(x=>x.name === name)
}

function showWSToken(props, corp) {
  if (!corp.privs.includes("WS")) return
  var ht = props.net.ht(70);
  var f = () => {} //TODO place WS token
  return roundButtonD(f, "WS", "TOKEN", 'black', 'lightblue', ht)
}

function showPlacePort(props, corp) {
  if (!corp.privs.includes("GLS")) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "placePort")}
  return squareButtonD(f, "PLACE", "PORT", 'black', 'lightblue', ht)
}

function privOwned(props, name) {
  var out = false;
  props.board.corps.forEach(x=>{if (x.privs.includes(name)) { out = true; }})
  return out;
}

function showBuyBridge(props, corp) {
  if (props.board.bridgeTokens < 1 || corp.bridgeRights || !privOwned(props, 'NIAG')) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "buyBridge")}
  return roundButtonD(f, "BRIDGE", "$50", 'black', 'lightgreen', ht)
}

function showBuyTunnel(props, corp) {
  if (props.board.tunnelTokens < 1 ||corp.tunnelRights || !privOwned(props, 'STC')) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "buyTunnel")}
  return roundButtonD(f, "TUNNEL", "$50", 'black', 'lightgreen', ht)
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
  var f = () => { simpleCorpAction(props, corp.name, "drillTile") }
  return hexButtonD(f, "DRILL", "$40", 'black', color, ht)
}

function showLayToken(props, corp) {
  if (!corp.tokenLaid && corp.tokensUsed >= corp.tokensMax) return
  var color = corp.tokenLaid ? 'lightgrey' : 'lightblue'
  var ht = props.net.ht(70);
  var price = (corp.tokensUsed < 2) ? 40 : 100;
  var f = () => { simpleCorpAction(props, corp.name, "layToken") }
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
    var f = () => simpleCorpAction(props, corp.name, "buyBankD")
    var train = showTrain('D', props.net.ht(30))
    // TODO grey out if too little money
    out.push(squareButtonCert(f, "BANK", train, 'black', 'lightgreen', ht))
    // TODO add D trade-ins
  }
  var f = () => { if(props.net.admin) { setters.setBuyingCorpTrain(true); }}
  var color = corp.cash < 1 ? 'lightgrey' : 'lightgreen'
  out.push(squareButtonD(f, "CORP", "TRAIN", 'black', color, ht))
  // TODO add POOL train buttons
  return out
}

function showDestButton(props, corp) {
  if (corp.destinationSatisfied) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "destReached") }
  return roundButtonD(f, "REACH", "DEST", 'black', 'lightyellow', ht)
}

function showRedeemButton(props, corp) {
  var color = corp.loans < 1 || corp.cash < 100 ? 'lightgrey' : 'lightpink'
  var ht = props.net.ht(70);
  var f = ()=> { simpleCorpAction(props, corp.name, "repayLoan") }
  return squareButtonD(f, 'REPAY', "$100", 'black', color, ht)
}

function sendBuyCorpTrain(props, corp, seller, size, price) {
  props.net.put(props.net, "buyCorpTrain/"+props.board.name+'/'+corp.name+'/'+size+'/'+seller.name+'/'+price)
  cancelCorpTrainSale()
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

function revenueInputControl(props, corp, revAmount, ht) {
  return <div class="asker-title">
    Revenue
    <input type="number" size="5" class="ask-box" value={ revAmount } onChange={(e) => setters.setRevAmount(e.target.value)} />
    {rectButton(() => sendWithhold(props, corp.name, revAmount), "WITHHOLD", 'black', 'lightyellow', props.net.ht(40))}
    {rectButton(() => sendPayout(props, corp.name, revAmount), "PAY OUT", 'black', 'lightyellow', props.net.ht(40))}
  </div>
}

function sendForcedTrainBuy(props, corpName, train, source) {
  //TODO handle POOL option when same price or less
  props.net.put(props.net, "forcedTrain/"+props.board.name+'/'+corpName+'/'+train+'/'+source)
}

function endOpTurnControl(props, corp) {
  if(corp.trains.length > 0) return imageButton(() => simpleCorpAction(props, corp.name, "endOpTurn"), go, "nextTurn")
  var train = props.board.trains.length > 0 ? props.board.trains[0] : 0; //TODO check is pool train is cheaper
  var cert = countedStockCert('TRAIN', props.net.ht(30), train, 2, 'black')
  var ht = props.net.ht(70)
  return [
      squareButtonD(() => simpleCorpAction(props, corp.name, "noRoute"), 'END NO', 'ROUTE', 'white', 'darkgrey', ht),
      squareButtonCert(() => sendForcedTrainBuy(props, corp.name, train, "BANK"), 'FORCED', cert, 'white', 'darkgrey', ht)
  ]
}

const PRIV_LIST = ['FLOS', 'WS', 'CAN', 'GLS', 'NIAG', 'STC'];

function cancelPrivSale() {
  setters.setPrivToBuy(null)
  setters.setBuyingPriv(false)
  setters.setPrivPrice(0)
}

function inPlayerHands(props, priv) {
  var out = false;
  props.board.players.forEach(p=> {if(p.privs.includes(priv)) out = true})
  return out;
}

function findPrivPlayerOwner(props, priv) {
  var out = null;
  props.board.players.forEach(p=> {if(p.privs.includes(priv)) out = p})
  return out;
}

function sendBuyPriv(props, priv, price) {
  var player = findPrivPlayerOwner(props, priv)
  props.net.put(props.net, "buyPriv/"+props.board.name+'/'+props.board.currentCorp+'/'+priv+'/'+player.name+'/'+price)
  cancelPrivSale()
}

function selectPrivToBuyButton(props, priv) {
  var cert = privCert(priv, props.net.ht(30))
  var ht = props.net.ht(70);
  return squareButtonCert(() => setters.setPrivToBuy(priv), 'BUY', cert, 'black', 'lightgreen', ht)
}

function showPrivsToBuy(props) {
  return PRIV_LIST.filter(x=>inPlayerHands(props, x)).map(y=>selectPrivToBuyButton(props, y))
}

function PrivPurchaseControl(props, priv, price) {
  if (isVoid(priv)) return <div class='asker-title'>
    { showPrivsToBuy(props) }
    {imageButton(cancelPrivSale, cancel, "cancel")}
  </div>
  //TODO activate return key
  return <div class="asker-title">
    Buying {privCert(priv, props.net.ht(50))} for $
    <input type="number" size="5" class="ask-box" onChange={(e) => setters.setPrivPrice(e.target.value)}
           onKeyDown={(e) => onEnter(e.key, () => sendBuyPriv(props, priv, price))} />
        {imageButton(() => { sendBuyPriv(props, priv, price)}, check, "buy")}
        {imageButton(cancelPrivSale, cancel, "cancel")}
  </div>
}

function OpCommandBar(props, revAmount,
                      selling, seller, size, price,
                      buyingPriv, privToBuy, privPrice,
                      tokenCount) {
  if(buyingPriv) return PrivPurchaseControl(props, privToBuy, privPrice)
  if(props.board.activity === OP_PRE) return OpPreCommandBar(props, revAmount)
  if(props.board.activity === OP_POST) return OpPostCommandBar(props, selling, seller, size, price)
  if(props.board.activity === CALL_LOAN) return CallLoanBar(props);
  if(props.board.activity === ASK_TOKENS) return AskTokenBar(props, tokenCount);
  return <div>UNKNOWN ACTIVITY {props.board.activity}</div>
}

function OpPreCommandBar(props, revAmount) { //TODO switch on activity
  var corp = findCurrentCorp(props)

  return <div>
    <div class='asker-title' >
      {showTakeLoanButton(props, corp)}
      {showBuyBridge(props, corp)}
      {showBuyTunnel(props, corp)}
      {showLayTile(props, corp)}
      {showLayToken(props, corp)}
      {showWSToken(props, corp)}
      {showPlacePort(props, corp)}
      {showBuyPrivButton(props, corp)}
      {showDestButton(props, corp)}
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
      {showWSToken(props, corp)}
      {showPlacePort(props, corp)}
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

function needsSaving(props, share) {
  if(!share.prez) return false;
  var c = findCorp(props, share.corpName)
  if(c.loans === 0) return false;
  if(c.abandoned) return false;
  return true;
}

function saveCorpButton(props, share, ht, htt) {
  var f = x=>props.net.put(props.net, "saveCorp/"+props.board.name+'/'+props.board.currentPlayer+'/'+share.corpName)
  var cert = stockNameCert(share.corpName, htt)
  return squareButtonCert(f, 'SAVE', cert, 'black', 'lightgreen', ht)
}

function abandonCorpButton(props, share, ht, htt) {
  var f = x=>props.net.put(props.net, "abandonCorp/"+props.board.name+'/'+props.board.currentPlayer+'/'+share.corpName)
  var cert = stockNameCert(share.corpName, htt)
  return squareButtonCert(f, 'FOLD', cert, 'black', 'lightpink', ht)
}

function sendTokenCount(props, tokenCount) {
  props.net.put(props.net, "answerTokens/"+props.board.name+'/'+tokenCount);
}

function AskTokenBar(props, count) {
  return <div class="asker-title">
    Number of CGR tokens used
    <input type="number" size="5" class="ask-box" onChange={(e) => setters.setTokenCount(e.target.value)}
           onKeyDown={(e) => onEnter(e.key, () => sendTokenCount(props, count))} />
        {imageButton(() => { sendTokenCount(props, count)}, check, "enter")}
  </div>
}

function CallLoanBar(props) {
  var buttons = []
  var player = findCurrentPlayer(props)
  var ht = props.net.ht(70);
  var htt = props.net.ht(30);
  player.shares.forEach(x=>{
    if (needsSaving(props, x)) {
      buttons.push(saveCorpButton(props, x, ht, htt)); buttons.push(abandonCorpButton(props, x, ht, htt));
    }
  })
  return <div class="asker-title">
    {buttons}
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
  if(props.board.activity === CALL_LOAN) {
    if(corp.abandoned) return "doomed-corp";
    if(corp.loans === 0) return "saved-corp";
    return "deciding-corp";
  }
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
    {corp.bridgeRights?'b':'-'}{corp.portRights?'p':'-'}{corp.tunnelRights?'t':'-'}
  </td>
}

function showCorpCash(corp, fs, fss) {
  if(corp.escrow > 0) return <td style={fss}>{corp.cash}+{corp.escrow}</td>
  return <td style={fs}>{corp.cash}</td>
}

function CorpRow(props, corp, fs, fss) {
  if(corp.closed || corp.par < 65) return;
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
    <div>{showTrainBucket(trains, 2, ht)}</div>
    <div>{showTrainBucket(trains, 3, ht)}</div>
    <div>{showTrainBucket(trains, 4, ht)}</div>
    <div>{showTrainBucket(trains, 5, ht)}</div>
    <div>{showTrainBucket(trains, 6, ht)}</div>
    <div>{showPoolTrains(board.poolTrains, ht)}</div>
  </div>
}