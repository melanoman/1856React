import React, {useState} from 'react';
import '../util.css'
import "./op.css";
import { onEnter, imageButton, bigImageButton, isVoid } from '../util.js'
import { privCert, stockNameCert, countedStockCert } from './certs.js'
import { rectButton, hexButtonD, squareButton, squareButtonCert, squareButtonD, roundButton, roundButtonD } from './button.js'
import { StockTable } from './stock.js'
import { ForcedSaleBar } from './force.js';

import cancel from '../icon/cancel.svg';
import check from '../icon/check.svg';
import go from '../icon/playGreen.svg';

const OP_PRE = "opPre";
const OP_POST = "opPost";
const CALL_LOAN = "callLoan";
const ASK_TOKENS = "askCGRTokens";
const ASK_CGR_TRAIN_DROP = "askCGRTrainDrop";
const ASK_LIMIT_DROP = "trainDrop";
const FORCE_SALE = "forceSale";

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
  if (props.board.loansDone) return
  var color = corp.loanTaken ? 'lightgrey' : 'lightpink'
  var ht = props.net.ht(70);
  var amount = (props.board.activity === OP_PRE) ? '$100' : '$90'
  var f = () => { simpleCorpAction(props, corp.name, "takeLoan")}
  return squareButtonD(f, 'LOAN', amount, 'black', color, ht)
}

function privBuyLegal(props) {
  return props.board.trains.length < 14
}

function noPrivatePrivs(props) {
  var out = true;
  props.board.players.forEach(player=>{ if(player.privs.length > 0) out=false; })
  return out;
}

function showBuyPrivButton(props, corp) {
  if (props.board.trains.length < 5) return
  if (noPrivatePrivs(props)) return
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
  var f = () => {simpleCorpAction(props, corp.name, "placeWStoken")}
  return roundButtonD(f, "W&S", "TOKEN", 'black', 'lightblue', ht)
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

function privPublic(props, name) {
  return props.board.trains.length < 5 || privOwned(props, name)
}

function showBuyBridge(props, corp) {
  if (props.board.bridgeTokens < 1 || corp.bridgeRights || !privPublic(props, 'NIAG')) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "buyBridge")}
  return roundButtonD(f, "BRIDGE", "$50", 'black', 'lightgreen', ht)
}

function showBuyTunnel(props, corp) {
  if (props.board.tunnelTokens < 1 ||corp.tunnelRights || !privPublic(props, 'STC')) return
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
  var color = corp.tileDrilled ? 'lightgray' : tileColor(props.board.trains.length)
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

function uniq(value, index, array) {
  return array.indexOf(value) === index;
}

function tradeInButton(props, size) {
  if(size === 0) return
  var cert = showTrain(size, props.net.ht(30))
  var f = x=>props.net.put(props.net, "tradeIn/"+props.board.name+'/'+props.board.currentCorp+'/'+size);
  return squareButtonCert(f, "TRADE", cert, 2, 'lightgreen', props.net.ht(70))
}

function poolTrainButton(props, size, color) {
  var b = props.board;
  var cert = showTrain(size, props.net.ht(30))
  var f = x=>props.net.put(props.net, "buyPoolTrain/"+b.name+'/'+b.currentCorp+'/'+size)
  return squareButtonCert(f, "POOL", cert, 2, color, props.net.ht(70))
}

function trainLimit(props, corp) {
  if(corp.name === 'CGR') return 3
  if(props.board.trains.length < 5) return 2
  if(props.board.trains.length < 9) return 3
  return 4
}

function showBuyTrainButtons(props, corp) {
  var color = corp.trains.length >= trainLimit(props, corp) ? 'lightgrey' : 'lightgreen'
  var out = []
  var ht = props.net.ht(70);
  if(props.board.trains.length > 0) {
    var f = () => sendBuyBankTrain(props, corp.name, props.board.trains[0])
    var train = showTrain(props.board.trains[0], props.net.ht(30))
    out.push(squareButtonCert(f, "BANK", train, 'black', color, ht))
  }
  if(props.board.trains.length < 2) {
    var f = () => simpleCorpAction(props, corp.name, "buyBankDiesel")
    var train = showTrain('D', props.net.ht(30))
    out.push(squareButtonCert(f, "BANK", train, 'black', color, ht))
    corp.trains.filter(uniq).map(x=>tradeInButton(props, x)).forEach(y=>{if(!isVoid(y)) {out.push(y)}})
  }
  props.board.pool.filter(uniq).map(x=>poolTrainButton(props, x, color)).forEach(y=>{if(!isVoid(y)) {out.push(y)}})
  var f = () => { if(props.net.admin) { setters.setBuyingCorpTrain(true); }}
  out.push(squareButtonD(f, "CORP", "TRAIN", 'black', color, ht))
  return out
}

function showDestButton(props, corp) {
  if (corp.destinationSatisfied) return
  var ht = props.net.ht(70);
  var f = () => { simpleCorpAction(props, corp.name, "destReached") }
  return roundButtonD(f, "REACH", "DEST", 'black', 'lightyellow', ht)
}

function showRedeemButton(props, corp) {
  if (props.board.loansDone) return
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
  var cert = showTrain(train, props.net.ht(30))
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
  if(props.board.activity === ASK_CGR_TRAIN_DROP) return AskCGRTrainDrop(props);
  if(props.board.activity === ASK_LIMIT_DROP) return LimitDropBar(props);
  if(props.board.activity === FORCE_SALE) return <ForcedSaleBar board={props.board} net={props.net} />
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
  var cert = showTrain(train, props.net.ht(30))
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
  var trainCert = showTrain(size, props.net.ht(50))
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

function lateDestinationButton(props, share, ht, htt) {
  var f = ()=>props.net.put(props.net, "lateDestination/"+props.board.name+'/'+share.corpName)
  var cert = stockNameCert(share.corpName, htt)
  return squareButtonCert(f, 'DEST', cert, 'black', 'lightyellow', ht)
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

function dropTrain(props, corpName, x) {
  props.net.put(props.net, "dropTrain/"+props.board.name+'/'+corpName+'/'+x)
}

function AskCGRTrainDrop(props, count) {
  var f = (x) => (() => {if (x===4) {dropTrain(props, "CGR", x);}})
  var tc = (x) => showTrain(x, props.net.ht(30), x)
  var ht = props.net.ht(70)
  return <div class="asker-title">
    {findCorp(props, "CGR").trains.map(size=>squareButtonCert(f(size), size===4 ? "DROP":"HOLD", tc(size), 'black', (size===4)?'lightpink':'lightgrey', ht))}
    {imageButton(() => { simpleCorpAction(props, "CGR", "doneDrop")}, check, "done")}
  </div>
}

function needsDestination(props, share) {
  var c = findCorp(props, share.corpName)
  if(c.destinationSatisfied || !c.incrementallyFunded) return false
  return true
}

function CallLoanBar(props) {
  var buttons = []
  var player = findCurrentPlayer(props)
  var ht = props.net.ht(70);
  var htt = props.net.ht(30);
  player.shares.forEach(x=>{
    if (needsSaving(props, x)) {
      buttons.push(saveCorpButton(props, x, ht, htt));
      buttons.push(abandonCorpButton(props, x, ht, htt));
      if (needsDestination(props, x)) {
        buttons.push(lateDestinationButton(props, x, ht, htt));
      }
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
  if(props.board.currentCorp === corp.name && props.live) return "sel-corp";
  if(corp.hasOperated) return "faded";
  return "waiting";
}

function showTrain(train, ht) {
  if(train === 0) return stockNameCert('TRAIN', ht)
  return countedStockCert('TRAIN', ht, train, 2, 'black')
}

function showCorpTrainsAndPrivs(props, corp, fs) {
  if (corp.name == "CGR" && props.board.loanerDiesel && corp.trains.length === 0) {
    return <td style={fs}>
      {countedStockCert('TRAIN', props.net.ht(30), "D", 8, 'magenta')}
    </td>
  }
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
  return trains.filter(x=>x === sz).map(x=>showTrain(sz, ht))
}

function showPoolTrains(trains, ht) {
  return trains.map(x=>countedStockCert('TRAIN', ht, "P"+x, 2, 'black'))
}

function DropButton(props, corpName, x) {
  var f = () => {
    props.net.put(props.net, "limitDrop/"+props.board.name+'/'+corpName+'/'+x)
  }
  return squareButtonCert(f, "DROP", showTrain(x, 30), 'black', 'lightpink', props.net.ht(70))
}

function DropLine(props, corp) {
  return <div class="asker-title">
    {stockNameCert(corp.name, props.net.ht(50))}
    {corp.trains.filter(uniq).map(x=>DropButton(props, corp.name, x))}
  </div>
}

function LimitDropBar(props) {
  return <div>
    <div class='asker-title'>DROP TRAINS</div>
    {props.board.corps.filter(x=>x.trains.length > trainLimit(props, x)).map(y=>DropLine(props, y))}
  </div>
}

export function showTrainMarket(board, ht) {
  var trains = board.trains;
  return <div>
    <div>{showTrainBucket(trains, 2, ht)}</div>
    <div>{showTrainBucket(trains, 3, ht)}</div>
    <div>{showTrainBucket(trains, 4, ht)}</div>
    <div>{showTrainBucket(trains, 5, ht)}</div>
    <div>{showTrainBucket(trains, 6, ht)}</div>
    <div>{showPoolTrains(board.pool, ht)}</div>
  </div>
}