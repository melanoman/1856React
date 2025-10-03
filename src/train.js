import React, {useState} from 'react';
import { displayPills, HORIZONTAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from './util.js';
import './train.css'

import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import play from './icon/playGreen.svg';
import swap from './icon/swap.svg';
import pencil from './icon/pencil.svg';
import left from './icon/left.svg';
import right from './icon/right.svg';
import ff from './icon/ff.svg';

const setters = {}
const URLH = 'http://10.0.0.143:32109/1856/';

const GATHER = "GATHER";
const AUCTION = "AUCTION";
const INITIAL = "INITIAL";
const STOCK = "STOCK";
const OP = "OP";
const PRE_REV = "before revenue";
const POST_REV = "done with revenue";
const BIDOFF = "resolving conflicting bids";
const TRAIN_DROP = "TrainDrop";
const FORCED_SALE = "forcedSaleEvent";
const CGRFORM= "CGRFORM";
const DONE = "DONE";

const PAR_TYPE = "par";
const BANK_TYPE = "bank";
const POOL_TYPE = "pool";

const TRAIN = "TRAIN";

var loadingList = false;
var loadingBoard = false;

function put(props, cmd, pkg, f, ff) {
  var t = (resp) => receiveBoard(resp.data);
  if(!isVoid(f)) t = f
  props.axios.put(URLH+cmd, pkg).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff()
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.data);
      } else {
        props.setters.setBanner("no server put response!");
      }
    }
  );
}

function get(props, cmd, f, ff) {
  var t = (resp) => receiveBoard(resp.data);
  if(!isVoid(f)) t = f
  props.axios.get(URLH+cmd).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff();
      if(error.response) {
        props.setters.setBanner("error: "+error.response.data);
      } else {
        props.setters.setBanner("no server get response!");
      }
    }
  );
}

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function clearAsks() {
  setters.setBidCorp(null);
  setters.setBuyCorp(null);
  setters.setSellList([]);
  setters.setWithholdOption(null);
  setters.setBuyingPriv(false);
  setters.setPrivChoice(null);
  setters.setUsingPriv(false);
  setters.setBidAmount(0);
}

function undo(props, name) {
  clearAsks();
  put(props, "undo/"+name, "");
}

function redo(props, name) {
  clearAsks();
  put(props, "redo/"+name, "");
}

function redoAll(props, name) {
  clearAsks();
  put(props, "redoAll/"+name, "");
}

function loadGameList(props) {
  loadingList = true;
  get(props, "list", (resp) => receiveList(resp.data), () => {loadingList = false})
}

function selectGame(name) {
  setters.setGameName(name);
  setters.setBoard(null);
}

function startAddingGame() {
  setters.setAddingGame(true);
}

function GameChooser(props, gameList) {
  if (isVoid(gameList)) {
    if (loadingList) {
      return "Loading in progress";
    } else {
      loadGameList(props);
      return;
    }
  }
  return <div>
    <div class='title'>1856 Accountant { settingsButton(props) }</div>
    <div class="chooser">
      {displayPills(gameList, "", (x) => selectGame(x.name), (x)=>x.name, () => false, HORIZONTAL)}
      {props.admin ? imageButton(startAddingGame, add, "add") : <span/> }
    </div>
  </div>
}

function cancelAddGame() {
  setters.setAddingGame(false);
}

function gameCreated(name) {
  setters.setAddingGame(false);
  setters.setGameList(null);
  setters.setGameName(name);
}

function createGame(props, newGameName) {
  put(props, "create/"+newGameName, "", (resp) => gameCreated(resp.data))
}

function AddGamePanel(props, newGameName) {
  return <div>
    <div class='title'>1856 Accountant { settingsButton(props) }</div>
    <div>
      Game Name:
      <input type="text" value={newGameName}
             onChange={(e)=>setters.setNewGameName(e.target.value)} />
    </div>
    <div>
      {imageButton(() => createGame(props, newGameName), check, "ok")}
      {imageButton(cancelAddGame, cancel, "cancel")}
    </div>
  </div>;
}

function receiveBoard(board, stockMove=0) {
  loadingBoard = false;
  setters.setBoard(board);
  if (stockMove > 0 && board.moveNumber !== stockMove) {
    clearStockMove();
  }
}

function loadBoard(props, gameName) {
  if (loadingBoard) return;
  loadingBoard = true;
  get(props, "status/"+gameName, (resp) => receiveBoard(resp.data), () => {loadingBoard = false;})
}

function playerEditButton(player) {
  return smallImageButton(() =>playerNameEdit(player), pencil, "edit");
}

function playerNameEdit(player) {
  setters.setEditingPlayerName(true);
  setters.setOldPlayerName(player);
  setters.setNewPlayerName(player);
}

function listPlayersForGather(board) {
  return board.players.map((player) => <div class="new-player">Player {player}{playerEditButton(player)}</div>);
}

function addPlayer(props, gameName, player) {
  if(isBlank(player)) return;
  put(props, "player/new/"+gameName+'/'+player, "", () => loadBoard(props, gameName))
  setters.setNewPlayerName("");
}

function changePlayerName(props, gameName, oldName, newName) {
  setters.setEditingPlayerName(false);
  if(isBlank(newName) || oldName === newName) {
    return;
  }
  put(props, "player/rename/"+gameName+"/"+oldName+"/"+newName, "")
  setters.setNewPlayerName("");
}

function abortPlayerNameChange() {
  setters.setEditingPlayerName(false);
  setters.setNewPlayerName("");
}

function showRound(board) {
  if(board.phase === AUCTION) return <span>Initial Auction</span>
  if(board.phase === STOCK) return <span class="left">Stock Round</span>
  if(board.phase === INITIAL) return <span class="left">1st Stock Round</span>
  if(board.phase === OP) return <span class="left">
    Operating Round({board.currentOpRound}/{board.maxOpRounds})
  </span>
  if(board.phase == CGRFORM) return <span class="left">CGR Formation</span>
}

function showUndoBar(props, board, gameName) {
  if(board.undoCount > 0) {
    return <div class="undo-bar">
      <span>
        {smallImageButton(() => undo(props, board.name), left, "undo")}
        Move {board.moveNumber - board.undoCount} of {board.moveNumber}
        {smallImageButton(() => redo(props, board.name), right, "redo")}
        {smallImageButton(() => redoAll(props, board.name), ff, "redoAll")}
      </span>
      <span>
        {gameName}{smallImageButton(() => setters.setGameName(null), cancel, "cancel")}
      </span>
      {showRound(board)}
    </div>
  }
  return <div class="undo-bar">
    <span>
      {smallImageButton(() => undo(props, board.name), left, "undo")}
      Move {board.moveNumber}
    </span>
    <span>
      {gameName}{smallImageButton(() => setters.setGameName(null), cancel, "cancel")}
    </span>
    {showRound(board)}
  </div>
}

function showTitle(props, gameName) {
  return <div class="title centered">
    1856 Accountant {settingsButton(props)}
  </div>
}

function EditPlayerNamePanel(props, gameName, oldPlayerName, newPlayerName) {
  return <div>
    <div class="subtitle">Changing name of {oldPlayerName}</div>
    <input type="text" value={newPlayerName} class="med-text"
                   onChange={(e) => setters.setNewPlayerName(e.target.value)}
                   onKeyDown={(e) => onEnter(e.key,
                              () => changePlayerName(props, gameName, oldPlayerName, newPlayerName))}/>
    <div>
      {imageButton(() => changePlayerName(props, gameName, oldPlayerName, newPlayerName), check, "ok")}
      {imageButton(() => abortPlayerNameChange(), cancel, "cancel")}
    </div>
  </div>
}

function startGame(props, gameName, shuffle) {
  put(props, "start/"+gameName+"?shuffle="+shuffle, "")
}

function medCert(text, x, border, bg, textColor) {
  return <svg class="med-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
   <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={bg} stroke-width={border} stroke="black" />
   <text class="med-cert-text" x={x} y="45" fill={textColor}>{text}</text>
  </g></svg>
}

function tinyCert(name, x, fillColor, textColor) {
  return <svg class="tiny-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={fillColor} stroke-width="2" stroke="black" />
    <text class="tiny-cert-text" x={x} y="45" fill={textColor}>{name}</text>
  </g></svg>
}

const PRIV = {
  flos: {med: medCert("FLOS", 15, 3, 'tan', 'black'), tiny:tinyCert("FLOS",15, 'tan', 'black'),
         price: 20, num:1, name:"Flos Tramway", key:"flos"},
  ws:   {med: medCert("W&S",  16, 3, 'purple', 'white'), tiny:tinyCert("W&S",16, 'purple', 'white'),
         price: 40, num:2, name:"Waterloo & Sawgreen Railway Co.", key:"ws"},
  can:  {med: medCert("CAN",  18, 3, 'red', 'white'), tiny:tinyCert("CAN",18, 'red', 'white'),
         price: 50, num:3, name:"The Canada Company", key:"can"},
  gls:  {med: medCert("GLS",  22, 3, 'blue', 'white'), tiny:tinyCert("GLS",20, 'blue', 'white'),
         price: 70, num:4, name:"Great Lakes Shipping Company", key:"gls"},
  niag: {med: medCert("NIAG", 16, 3, 'aqua', 'black'), tiny:tinyCert("NIAG",15, 'aqua', 'black'),
         price: 100,num:5, name:"Niagara Falls Suspension Bridge Company", key:"niag"},
  stc:  {med: medCert("ST.C", 20, 3, 'gray', 'yellow'), tiny:tinyCert("ST.C",19, 'gray', 'yellow'),
         price: 100,num:6, name:"St. Clair Frontier Tunnel Company", key:"stc"},
  SOLD: {med: medCert("SOLD", 14, 4, 'gray', 'white'),
         price:-1, num:-1},
}

const CORP = {
  BBG: { tiny: tinyCert("BBG", 22, 'pink', 'black'),    med: medCert("BBG", 23, 3, 'pink', 'black'),
     bg: 'pink',   color: 'black'},
  CA: {  tiny: tinyCert("CA", 28, 'red', 'white'),      med: medCert("CA", 29, 3, 'red', 'white'),
     bg: 'red',    color: 'white'},
  CPR: { tiny: tinyCert("CPR", 22, 'violet', 'black'),  med: medCert("CPR", 23, 3, 'violet', 'black'),
     bg: 'violet', color: 'black'},
  CV: {  tiny: tinyCert("CV", 28, 'purple', 'white'),   med: medCert("CV", 30, 3, 'purple', 'white'),
     bg: 'purple', color: 'white'},
  GT: {  tiny: tinyCert("GT", 28, '#7BE1BF', 'black'),  med: medCert("GT", 31, 3, '#7BE1BF', 'black'),
     bg: '#7BE1BF', color: 'black'},
  GW: {  tiny: tinyCert("GW", 23, '#906E3E', 'white'),  med: medCert("GW", 27, 3, '#906E3E', 'white'),
     bg: '#906E3E', color: 'white'},
  LPS: { tiny: tinyCert("LPS", 24, '#479BF9', 'black'), med: medCert("LPS", 26, 3, '#479BF9', 'black'),
     bg: '#479BF9', color: 'black'},
  TGB: { tiny: tinyCert("TGB", 22, '#FF4500', 'black'), med: medCert("TGB", 23, 3, '#FF4500', 'black'),
     bg: '#FF4500', color: 'black'},
  THB: { tiny: tinyCert("THB", 22, '#FFEF00', 'black'), med: medCert("THB", 23, 3, '#FFEF00', 'black'),
     bg: '#FFEF00', color: 'black'},
  WGB: { tiny: tinyCert("WGB", 18, '#342D7E', 'white'), med: medCert("WGB", 18, 3, '#342D7E', 'white'),
     bg: '#342D7E', color: 'white'},
  WR: {  tiny: tinyCert("WR", 25, '#8F6839', 'white'),  med: medCert("WR", 26, 3, '#8F6839', 'white'),
     bg: '#8F6839', color: 'white'},
  TRAIN: { tiny: tinyCert("D", 37, 'gray', 'black'),
     bg: 'gray', color: 'black'},
}

const CASH_TINY = tinyCert('$$$', 25, 'lightgreen', 'green');
const ESCROW_TINY = tinyCert('$$$', 25, 'grey', 'black');

function sendAuctionBuy(props, board) {
  put(props, "auction/buy/"+board.name, "")
}

function clickAuctionHeader(props, corpName, block, board) {
  var corpNum = PRIV[corpName].num;
  if (corpNum === block) sendAuctionBuy(props, board);
  if (corpNum > block) setters.setBidCorp(corpName);
}

function AuctionCell(wallet, privName) {
  var out = <td/>;
  wallet.privates.forEach((x) => {
    if(x.corp === privName) {
      if(x.amount === 3) {
        out = <td>{PRIV[privName].med}</td>
      } else {
        out = <td class="auction-bid">{x.amount}</td>
      }
    }
  });
  return out;
}

function sendPass(props, gameName) {
  put(props, "pass/"+gameName, "")
}

function priorityCell(player, priorityHolder) {
  if(priorityHolder === player) {
    return <td><img src={ff} class="priority-arrow" alt="priority-marker"/></td>
  }
  return <td/>
}

function AuctionRow(wallet, currentPlayer, priorityHolder) {
  return <tr class={currentPlayer === wallet.name ? "selected" : "not-selected"}>
    {priorityCell(wallet.name, priorityHolder)}
    <td>{wallet.name}</td>
    <td>{wallet.cash}</td>
    {AuctionCell(wallet, "flos")}
    {AuctionCell(wallet, "ws")}
    {AuctionCell(wallet, "can")}
    {AuctionCell(wallet, "gls")}
    {AuctionCell(wallet, "niag")}
    {AuctionCell(wallet, "stc")}
    <td/>
  </tr>
}

function auctionHeader(props, text, obj, block, board) {
  if (obj.num >= block) {
    return <th onClick={() => clickAuctionHeader(props, text, block, board)}>{obj.med}</th>
  } else {
    return <th>{PRIV.SOLD.med}</th>
  }
}

function showDiscount(props, board) {
  var cert = PRIV[board.currentCorp];
  return <div class="subtitle" onClick={() => sendAuctionBuy(props, board)}>
    Offering: {cert.med} Price: {cert.price - board.auctionDiscount}
  </div>
}

function AuctionTable(props, gameName, board) {
  var block = PRIV[board.currentCorp].num;
  return <div>
    <table class="auction-table">
      <tr>
        <th/>
        <th>Player</th>
        <th>CASH</th>
        {auctionHeader(props, "flos", PRIV.flos, block, board)}
        {auctionHeader(props, "ws", PRIV.ws, block, board)}
        {auctionHeader(props, "can", PRIV.can, block, board)}
        {auctionHeader(props, "gls", PRIV.gls, block, board)}
        {auctionHeader(props, "niag", PRIV.niag, block, board)}
        {auctionHeader(props, "stc", PRIV.stc, block, board)}
        <th onClick={() => sendPass(props, gameName)}>PASS</th>
      </tr>
      {board.wallets.map((wallet) => AuctionRow(wallet, board.currentPlayer, board.priorityHolder))}
    </table>
    {showDiscount(props, board)}
  </div>
}

function sendBid(props, gameName, bidCorp, bidAmount) {
  put(props, "auction/bid/"+gameName+'/'+bidCorp+'/'+bidAmount, "")
  clearAsks();
}

function bidInputPanel(props, gameName, board, bidCorp, bidAmount) {
  if(!isVoid(bidCorp)) {
    return <div class="asker">
      <div class="asker-title">
        Bid {PRIV[bidCorp].med} {PRIV[bidCorp].name}:
        <input type="number" size="5" class="ask-box" onChange={(e) => setters.setBidAmount(e.target.value)}
               onKeyDown={(e) => onEnter(e.key, () => sendBid(props, gameName, bidCorp, e.target.value))} />
      </div>
      <div>
        {imageButton(() => sendBid(props, gameName, bidCorp, bidAmount), check, "bid")}
        {imageButton(clearAsks, cancel, "cancel")}
      </div>
    </div>
  }
}

function matchingBid(w, corp) {
  var out = false;
  w.privates.forEach((p) => {if(p.corp === corp) out = true})
  return out;
}

function getBidders(board) {
  var out = [];
  var corp = board.currentCorp;
  board.wallets.forEach((w) => {if (matchingBid(w, corp)) out.push(w.name)})
  return out;
}

function sendBidoff(props, gameName, winningBidder, bidAmount) {
  put(props, "auction/bidoff/"+gameName+"/"+winningBidder+"/"+bidAmount, "")
}

function bidoffPanel(props, gameName, board, bidoffWinner, bidAmount) {
  if(board.event === BIDOFF) {
    var choices = getBidders(board);
    return <div class="asker">
      <div class="asker-title">Auctioning {PRIV[board.currentCorp].med} {PRIV[board.currentCorp].name}</div>
      <table class="space-table"><tr><td>
        <div>Winning Bidder</div>
        {displayPills(choices, bidoffWinner, setters.setBidoffWinner, (x) => x, (x, y) => x === y)}
      </td><td>
        <div>Winning Bid</div>
        <div>
          <input type="number" size="4" class="big-ask-box" onChange={(e) => setters.setBidAmount(e.target.value)}
                 onKeyDown={(e) => onEnter(e.key, () => sendBidoff(props, gameName, bidoffWinner, e.target.value))} />
        </div>
      </td><td>
        <div>{bigImageButton(() => sendBidoff(props, gameName, bidoffWinner, bidAmount), play, "ok")}</div>
      </td></tr></table>
    </div>
  }
}

function AuctionPanel(props, gameName, board, bidCorp, bidAmount, bidoffWinner) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    {AuctionTable(props, gameName, board)}
    {bidInputPanel(props, gameName, board, bidCorp, bidAmount)}
    {bidoffPanel(props, gameName, board, bidoffWinner, bidAmount)}
  </div>
}

const SETPAR_BUTTON = <svg class="tiny-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70"><g>
  <path d="M 10 10 l 220 0 0 50 -220 0 0 -50" fill="lightyellow" stroke-width="2" stroke="black" />
  <text class="tiny-cert-text" x="65" y="45" fill="black">SET PAR</text>
</g></svg>

function showTinyStockCount(corpName, count, isPrez, hasSold) {
  var stroke = (hasSold) ? 'orange': 'black';
  var width = (isPrez) ? 10 : (hasSold) ? 4 : 2;


  return <svg class="tiny-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={CORP[corpName].bg} stroke-width={width} stroke={stroke} />
    <text class="tiny-cert-text" x="40" y="45" fill={CORP[corpName].color}>{count}</text>
  </g></svg>
}

function showMedStockCount(corpName, count, isPrez, hasSold) {
  if (isPrez) {
    return <svg class="med-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
      <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={CORP[corpName].bg} stroke-width="10" stroke='orange' />
      <text class="med-cert-text" x="40" y="45" fill={CORP[corpName].color}>{count}</text>
    </g></svg>
  }
  return <svg class="med-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
    <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={CORP[corpName].bg} stroke-width="2" stroke='black' />
    <text class="med-cert-text" x="40" y="45" fill={CORP[corpName].color}>{count}</text>
  </g></svg>
}

function markForSale(shares, newShareName, mv) {
  var done = false;
  shares.forEach(x => {
    if (x.name === newShareName) {
      x.amount = x.amount + 1;
      done = true;
    }
  })
  if (!done) {
    shares.push({name: newShareName, amount: 1})
  }

 setters.setMV(mv+1)
}

function playerShareCell(props, board, corp, wallet, sellList, mv, active) {
  var clazz="row-break"
  if (active && board.currentPlayer === wallet.name) {
    clazz="selected-column row-break"
  }
  var stock;
  wallet.stocks.forEach(x => {if(x.corp === corp.name) {stock = x}});
  if (isVoid(stock)) {
    return <td class={clazz} />
  }
  var f= board.currentPlayer === wallet.name ?
    ()=>{ markForSale(sellList, corp.name, mv)} :
    ()=>{ props.setters.setBanner("Not your turn") }
  if (board.phase === INITIAL) {
    f = () => { props.setters.setBanner("No sales in the 1st stock round")}
  }
  if(!active) f = ()=>{ }
  var hasSold = wallet.blocks.includes(corp.name);
  return <td class={clazz} onClick={f} >
    {showTinyStockCount(corp.name, stock.amount, corp.prez === wallet.name, hasSold)}
  </td>
}

function playerShareCells(props, board, corp, sellList, mv, active) {
  return board.wallets.map((w) => playerShareCell(props, board, corp, w, sellList, mv, active))
}

function setParClick(corp, board) {
  setters.setBuyCorp(corp);
  setters.setBuyType(PAR_TYPE);
  setters.setStockMove(board.moveNumber);
  setters.setNewPar(0);
}

function setParButton(corp, board, active) {
  if(!active) return
  return <button class="naked-button" onClick={() => setParClick(corp, board)}>{SETPAR_BUTTON}</button>
}

function corpHoldingGraphic(f, shares, corp) {
  if (shares === 0) {
    return <td>
      <svg class="tiny-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
         <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill='lightgray' stroke-width="2" stroke="black" />
         <text class="tiny-cert-text" x='40' y="45" fill='black'>{shares}</text>
       </g></svg>
    </td>
  }
  return <td onClick={f}>
    <svg class="tiny-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
      <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={CORP[corp.name].bg} stroke-width="2" stroke="black" />
      <text class="tiny-cert-text" x='40' y="45" fill={CORP[corp.name].color}>{shares}</text>
    </g></svg>
  </td>
}

function bankBuy(corp, board) {
  setters.setBuyType(BANK_TYPE);
  setters.setBuyCorp(corp);
  setters.setStockMove(board.moveNumber);
}

function poolBuy(corp, board) {
  setters.setBuyType(POOL_TYPE);
  setters.setBuyCorp(corp);
  setters.setStockMove(board.moveNumber);
}

function corpShareCells(props, board, corp, active) {
  var out = []
  out.push(<td>{CORP[corp.name].tiny}</td>)
  if(corp.par === 0) {
    out.push(<td class="row-break" colspan="4">{setParButton(corp, board, active)}</td>)
  } else {
    var f = active ? () => bankBuy(corp, board) : () => {}
    out.push(<td class="row-break">{corp.par > 0 ? corp.par : ""}</td>)
    out.push(<td>{corpHoldingGraphic(f, corp.bankShares, corp)}</td>)
    f = active ? () => poolBuy(corp, board) : () => {}
    out.push(<td class="row-break">{corp.price.price}</td>)
    out.push(<td>{corpHoldingGraphic(f, corp.poolShares, corp)}</td>)
  }
  return out;
}

function buyRow(props, gameName, board, corp, sellList, mv, active) {
  return <tr>
    {corpShareCells(props, board, corp, active)}
    {playerShareCells(props, board, corp, sellList, mv, active)}
  </tr>
}

function priorityArrow(board, name) {
  if (board.priorityHolder === name) {
    return <img src={ff} class="priority-arrow" alt="priority-marker"/>
  }
}

function playerNameHeader(board, name, active) {
  if (active && board.currentPlayer === name) {
    return <th class="selected-column">{priorityArrow(board, name)}{name}</th>
  }
  return <th>{priorityArrow(board, name)}{name}</th>
}

function playerNameColumns(board, active) {
  return board.players.map((name) => playerNameHeader(board, name, active))
}

function playerStockCashCell(w, board, active) {
  var clazz = "row-break";
  if (active && w.name === board.currentPlayer) {
    clazz = "selected row-break";
  }
  return <td class={clazz}>{w.cash}</td>
}

function playerValueCell(w, board, active) {
  var clazz = "row-break";
  if (active && w.name === board.currentPlayer) {
    clazz = "selected row-break";
  }
  return <td class={clazz}>{w.value}</td>
}

function stockCashRow(board, active) {
  return <tr>
    <td>{CASH_TINY}</td>
    <td class="row-break" colspan='4'>{board.bankCash}</td>
    {board.wallets.map((w) => playerStockCashCell(w, board, active))}
  </tr>
}

function totalValueRow(board, active) {
  return <tr>
    <td>{ESCROW_TINY}</td>
    <td class="row-break" colspan='4' />
    {board.wallets.map((w) => playerValueCell(w, board, active))}
  </tr>
}

function tinyPrivCell(privates, selected, active) {
  return <td class={(active && selected) ? "selected row-break" : "row-break"}>
    {privates.map((p) => <div>{PRIV[p.corp].tiny}</div>)}
  </td>
}

function stockPrivRow(board, active) {
  return <tr><td />
    <td class="row-break" colspan='4' />
    {board.wallets.map((w) => tinyPrivCell(w.privates, w.name === board.currentPlayer, active))}
  </tr>
}

function buyTable(props, gameName, board, sellList, mv, active) {
  return <table class="buy-table">
    <tr>
      <th/><th colspan="2">Bank</th><th colspan="2">Pool</th>
      {playerNameColumns(board, active)}
    </tr>
    {stockCashRow(board, active)}
    {totalValueRow(board, active)}
    {stockPrivRow(board, active)}
    {board.corps.map((corp) => buyRow(props, gameName, board, corp, sellList, mv, active))}
  </table>
}

function sendBuy(props, gameName, buyCorp, buyType, newPar, stockMove) {
  switch (buyType) {
    case "par":
      sendPar(props, gameName, buyCorp, newPar, stockMove);
      break;
    case "bank":
    case "pool":
      sendSimpleBuy(props, gameName, buyCorp, buyType, stockMove);
      break;
    default:
      props.setters.setBanner("Unknown buy configuration");
  }
  clearAsks();
}

function sendPar(props, gameName, buyCorp, newPar, stockMove) {
  put(props, "par/"+gameName+"/"+buyCorp.name+"/"+newPar, "", (resp) => receiveBoard(resp.data, stockMove))
  clearAsks()
}

function sendSimpleBuy(props, gameName, buyCorp, buyType, stockMove) {
  put(props, "buy/"+gameName+"/"+buyType+"/"+buyCorp.name, "", (resp) => receiveBoard(resp.data, stockMove))
  clearAsks()
}

function sendSale(props, gameName, sellList, stockMove) {
  put(props, "sell/"+gameName, sellList, (resp) => receiveBoard(resp.data, stockMove))
  clearAsks()
}

function sendBuySell(props, gameName, buyCorp, buyType, newPar, sellList, stockMove) {
  put(props, "buySell/"+gameName+"/"+buyType+"/"+buyCorp.name+"/"+newPar, sellList, (resp) => receiveBoard(resp.data, stockMove))
  clearAsks()
}

function sendSellBuy(props, gameName, buyCorp, buyType, newPar, sellList, stockMove) {
  put(props, "sellBuy/"+gameName+"/"+buyType+"/"+buyCorp.name+"/"+newPar, sellList, (resp) => receiveBoard(resp.data, stockMove))
  clearAsks()
}

function clearStockMove() {
  setters.setBuyCorp(null);
  setters.setSellList([]);
  setters.setStockMove(0);
}

function clearBuy() {
  setters.setBuyCorp(null);
}

function playerBuyAction(props, gameName, board, buyCorp, buyType, newPar) {
  switch (buyType) {
    case PAR_TYPE:
      return <td class='panel-cell med-text'>
        <div class='centered'>Launch {CORP[buyCorp.name].med}{smallImageButton(() => clearBuy(), cancel, "cancel")}</div>
        <div>Par <input type='number' class='ask-box' value={newPar} onChange={(e) => setters.setNewPar(e.target.value)}/></div>
      </td>
    case BANK_TYPE:
      return <td class='panel-cell med-text'><div class="centered">
        Buy Bank {CORP[buyCorp.name].med}{smallImageButton(() => clearBuy(), cancel, "cancel")}
      </div></td>
    case POOL_TYPE:
      return <td class='panel-cell med-text'><div class="centered">
        Buy Pool {CORP[buyCorp.name].med}{smallImageButton(() => clearBuy(), cancel, "cancel")}
      </div></td>
  }
}

function playerSellAction(props, gameName, board, sellList) {
  return <td class="panel-cell med-text">
    <div> Sell Stock </div>
    <div class="centered">
      {sellList.map(x => showMedStockCount(x.name, x.amount, false, false))}
      {smallImageButton(() => setters.setSellList([]), cancel, "cancel sale")}
    </div>
  </td>
}

function swapControl(buyFirst) {
  return bigImageButton(() => setters.setBuyFirst(!buyFirst), swap, "swap")
}

function playerStockActionPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove) {
  if(isVoid(buyCorp) && sellList.length == 0) {
    return <tr>
      <td class='panel-cell huge-text'>Pass</td>
      <td>{bigImageButton(() => sendPass(props, gameName), play, "pass")}</td>
    </tr>
  }
  if(sellList.length == 0) {
    return <tr>
      {playerBuyAction(props, gameName, board, buyCorp, buyType, newPar)}
      <td>{bigImageButton(() => sendBuy(props, gameName, buyCorp, buyType, newPar, stockMove), play, "buy")}</td>
    </tr>
  }
  if(isVoid(buyCorp)) {
    return <tr>
      {playerSellAction(props, gameName, board, sellList)}
      <td>{bigImageButton(() => sendSale(props, gameName, sellList, stockMove), play, "pass")}</td>
    </tr>
  }
  if(buyFirst) {
    return <tr>
      {playerBuyAction(props, gameName, board, buyCorp, buyType, newPar)}
      {swapControl(buyFirst)}
      {playerSellAction(props, gameName, board, sellList)}
      <td>{bigImageButton(() => sendBuySell(props, gameName, buyCorp, buyType, newPar, sellList, stockMove), play, "pass")}</td>
    </tr>
  }
  return <tr>
    {playerSellAction(props, gameName, board, sellList)}
    {swapControl(buyFirst)}
    {playerBuyAction(props, gameName, board, buyCorp, buyType, newPar)}
    <td>{bigImageButton(() => sendSellBuy(props, gameName, buyCorp, buyType, newPar, sellList, stockMove), play, "pass")}</td>
  </tr>
}

function StockPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove, mv) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr><td colSpan='9'>{buyTable(props, gameName, board, sellList, mv, true)}</td></tr>
      {playerStockActionPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove)}
    </table>
    {showOpOrder(props, board, gameName)}
    <div>{showTrainOptions(props, board, gameName)}</div>
  </div>
}

function opRights(corp) {
  var out = "" + (corp.bridgeRights ? "b":"-") + (corp.portRights ?"p":"-") + (corp.tunnelRights ?"t":"-")
  return out
}

function opClass(corp, selected) {
  if(corp.name === selected) return "op-selected"
  return corp.hasOperated ? "op-done" : "op-todo"
}

function opIcon(x, clazz) {
  if (x.par === 0) return;
  var icon = !x.hasFloated ? CORP[x.name].tiny : CORP[x.name].med;
  return <td class={clazz}>{icon}</td>
}

function escrowCell(corp, clazz) {
  if(corp.escrow > 0) return <td class={clazz}>{corp.cash}+{corp.escrow}</td>
  return <td class={clazz}>{corp.cash}</td>
}

function showTinyPrivCert(x) {
  return PRIV[x.corp].tiny
}

function showCorpTrainsAndPrivs(corp, clazz) {
  if (corp.trains.length == 0 && corp.privates.length == 0) return <td class={clazz}>---</td>
  if (corp.privates.length == 0) return <td class="clazz">
    {corp.trains.map(x => showTinyStockCount(TRAIN, x, false, false))}
  </td>
  if (corp.trains.length == 0) return <td class="clazz"><div>
    {corp.privates.map(x => showTinyPrivCert(x))}
  </div></td>
  return <td class="clazz"><div>
    {corp.trains.map(x => showTinyStockCount(TRAIN, x, false, false))}
    {corp.privates.map(x => showTinyPrivCert(x))}
  </div></td>
}

function opOrderRow(board, corp) {
  if(corp.par === 0) return
  var clazz = opClass(corp, board.currentCorp)
  return <tr>
    {opIcon(corp, clazz)}
    <td class={clazz}>{corp.prez}</td>
    {escrowCell(corp, clazz)}
    <td class={clazz}>{corp.tokensMax - corp.tokensUsed}/{corp.tokensMax}</td>
    <td class={clazz}>{corp.lastRun}</td>
    <td class={clazz}>{corp.price.price}</td>
    <td class={clazz}>{corp.loans}</td>
    <td class={clazz}>{showCorpTrainsAndPrivs(corp, clazz)}</td>
    <td class={clazz}>{opRights(corp)}</td>
  </tr>
}

function escrowHeader(hide) {
  if(hide) return
  return <th>ESCROW</th>
}

function showOpOrder(props, board, gameName) {
  return <table class="auction-table">
    <tr><th>CORP</th><th>PREZ</th><th>CASH</th>
    <th>TOKENS</th><th>RUN</th><th>PRICE</th><th>LOANS</th><th>TRAINS</th><th>RIGHTS</th></tr>
    {board.corps.map(x => opOrderRow(board, x))}
  </table>
}

function maxTileColor(board) {
  if (board.trains.length > 13) return 'yellow';
  if (board.trains.length > 4) return 'green';
  if (board.trains.length > 1) return 'brown';
  return 'lightgrey';
}

function showTileOption(props, board, gameName) {
  var color = board.tilePlayed ? 'lightgray' : maxTileColor(board)
  return <td class='panel-cell'>
    <div class='centered'>TILE</div>
    <div class='centered'>
      {showHexButton(() => sendPayTile(props, gameName), color, 'med-cert', '$40', "black", 22, false)}
    </div>
  </td>
}

function showTokenOption(props, board, gameName, corp) {
  if (corp.tokensUsed == corp.tokensMax) return
  var price = corp.tokensUsed < 2 ? "$40": "$100";
  var offset = corp.tokensUsed < 2 ? 24: 20;
  var color = board.tokenPlayed ? 'lightgray' : 'lightblue'
  return <td class='panel-cell'>
    <div class='centered'>TOKEN</div>
    <div class='centered'>
      {showRoundButton(() => sendPayToken(props, gameName), 'med-cert', color, price, 'black', offset, false)}
    </div>
  </td>
}

function sendTakeLoan(props, board, gameName) {
  put(props, "loan/"+gameName, "")
}

function sendPayTile(props, gameName) {
  put(props, "tile/"+gameName, "")
}

function sendPayToken(props, gameName) {
  put(props, "token/"+gameName, "")
}

function showEarlyLoanChoice(props, board, gameName) {
  var f = board.loanTaken ? () => props.setters.setBanner("Error: Max one loan per turn") :
                            () => sendTakeLoan(props, board, gameName)
  var color = board.loanTaken ? 'lightgray' : 'pink'
  return <td class="panel-cell">
    <div class='centered'>LOAN</div>
    <div class='centered'>
      {showSquareToken(f, color, 'black', 'med-cert', "$100", 20, false)}
    </div>
  </td>
}

const WITHHOLD_PAY = ['Withhold', 'Pay Out']

function sendRevenue(props, gameName, selected, amount) {
  clearAsks();
  put(props, (selected === 'Withhold' ? 'withhold' : 'payout')+"/"+gameName+"/"+amount, "")
}

function getRevenueInformation(props, board, gameName, selected, bidAmount) {
  return <table>
      <tr>
        <td>
          <div class='med-text'>
            Revenue: <input onChange={(x) => setters.setBidAmount(x.target.value)}
                            value={bidAmount} type='number' size='5' class='ask-box' />
          </div>
          {displayPills(WITHHOLD_PAY, selected, (x) => setters.setWithholdOption(x),
                       (x) => x, (x,y) => x === y, HORIZONTAL)}
        </td>
        <td>{bigImageButton(() => sendRevenue(props, gameName, selected, bidAmount), play, "ok")}</td>
      </tr>
    </table>
}

function showLoanOption(props, board, gameName) {
  if (board.loanTaken) return
  return <td class="panel-cell">
    <div class='centered'>LATE LOAN</div>
    <div class='centered'>
      {showSquareToken(() => {}, 'pink', 'black', 'med-cert', "$100", 20, false)}
    </div>
  </td>
}

function askBuyingPriv() {
  clearAsks();
  setters.setBuyingPriv(true);
}

function noPlayerPrivs(board) {
  var out = true;
  board.wallets.forEach(w => {
    if(w.privates.length > 0) {out = false;}
  })
  return out;
}

function usableCorps(board) {
  var out = true;
  board.corps.forEach(c => {
    if(c.privates.length > 0) {out = false;}
  })
  if (board.tunnelTokens > 0  || board.bridgeTokens > 0) out = false;
  return out;
}

function showPrivateOptions(props, board, gameName, buyingPriv, usingPriv) {
  var buyGray = buyingPriv || board.trains.length > 13 || noPlayerPrivs(board);
  var useGray = usingPriv || usableCorps(board);
  return <td class="panel-cell">
    <div>PRIVATE</div>
    <div>
      {showSquareToken(() => askBuyingPriv(), buyGray ? 'lightgray' : 'lightgreen', 'black', 'med-cert', 'BUY', 21, false)}
      {showSquareToken(() => askUsingPriv(), useGray ? 'lightgray' : 'lightgreen', 'black', 'med-cert', 'USE', 21, false)}
    </div>
  </td>
}

function showPoolTrainButton(props, board, gameName) {
  if(board.trainPool.length == 0) return
  return showSquareToken(() => {alert("TODO POOL TRAIN")}, 'lightgreen', 'black', 'med-cert', 'POOL', 17, false)
}

function sendBankTrain(props, board, gameName) {
  put(props, "banktrain/"+gameName, "")
}

function showTrainButtons(props, board, gameName) {
  return <td class="panel-cell">
    <div>TRAINS</div>
    <div>
      {showSquareToken(() => { sendBankTrain(props, board, gameName) },
                       'lightgreen', 'black', 'med-cert', 'BANK', 16, false)}
      {showPoolTrainButton(props, board, gameName)}
    </div>
  </td>
}

function showTrainPool(board) {
  if(board.trainPool.length === 0) return;
  return <div class="flex-line">
    POOL: {board.trainPool.map(x => showTinyStockCount(TRAIN, x, false, false))}
  </div>
}

function showTrainOptions(props, board, gameName) {
  var pool = []
  if (board.trainPool.length > 0) {
    pool = board.trainPool.map(x => showTinyStockCount(TRAIN, x, false, false));
  }
  if (board.trains.length > 2) {
    var out = [ showTinyStockCount(TRAIN, board.trains[0], true, false) ];
    board.trains.slice(1).forEach(x => out.push(showTinyStockCount(TRAIN, x, false, false)));
    out.push(CORP[TRAIN].tiny);
    return <div>
      <div>TRAIN MARKET</div>
      <div class="flex-line">BANK: {out}</div>
      {showTrainPool(board)}
    </div>
  } else {
    return <div>
      <div>TRAIN MARKET</div>
      <div>CORP[TRAIN].tiny</div>
      {showTrainPool(board)}
    </div>
  }
}

function trainLevel(board) {
  if (board.trains.length < 2) return 10; //DIESEL
  return board.trains[0];
}

function showHex(fillColor, clazz, text, textcolor, offset, doEx) {
  var ex = doEx ? <path d="M 18 10 l 34 50 M 52 10 l -34 50" fill='none' stroke-width='4' stroke="red" /> : <path />
  return <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
    <path d="M 18 10 l 34 0 17 25 -17 25 -34 0 -17 -25 17 -25" fill={fillColor} stroke-width="2" stroke="black" />
    {ex}
    <text class="tiny-hex-text" x={offset} y="40" fill={textcolor}>{text}</text>
  </g></svg>
}

function showHexButton(f, fillColor, clazz, text, textcolor, offset, doEx) {
  return <button class="naked-button" onClick={f}>{showHex(fillColor, clazz, text, textcolor, offset, doEx)}</button>
}

function showRoundButton(f, clazz, bg, text, fillColor, offset, doEx) {
  var ex = doEx ? <path d="M 18 13 l 34 40 M 52 13 l -34 40" fill='none' stroke-width='4' stroke="red" /> : <path />
    return <button class='naked-button' onClick={f} >
      <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
        <circle cx='35' cy='35' r='25' fill={bg} stroke-width="2" stroke="black" />
        {ex}
        <text class="tiny-hex-text" x={offset} y="40" fill={fillColor} >{text}</text>
      </g></svg>
    </button>
}

function showSquareToken(f, fillColor, textcolor, clazz, text, offset, doEx) {
  var ex = doEx ? <path d="M 18 13 l 34 40 M 52 13 l -34 40" fill='none' stroke-width='4' stroke="red" /> : <path />
  return <button class='naked-button' onClick={f} >
    <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <rect width='50' height='50' x='10' y='10' rx='10' ry='10' fill={fillColor} stroke-width="2" stroke="black" />
      {ex}
      <text class="tiny-hex-text" x={offset} y="40" fill={textcolor} >{text}</text>
    </g></svg>
  </button>
}

function isPlayerPriv(privName, board) {
  var out = false;
  board.wallets.forEach(w => w.privates.forEach(p => {if(p.corp === privName) { out = true }}))
  return out
}

function privsToBuy(board) {
  var out = [];
  if (isPlayerPriv("flos", board)) out.push(PRIV.flos);
  if (isPlayerPriv("ws", board)) out.push(PRIV.ws);
  if (isPlayerPriv("can", board)) out.push(PRIV.can);
  if (isPlayerPriv("gls", board)) out.push(PRIV.gls);
  if (isPlayerPriv("niag", board)) out.push(PRIV.niag);
  if (isPlayerPriv("stc", board)) out.push(PRIV.stc);
  return out;
}

function sendBuyPriv(props, gameName, privChoice, privAmount) {
  put(props, "buypriv/"+gameName+"/"+privChoice.key+"/"+privAmount, "");
  clearAsks();
}

function getBuyPrivChoice(props, board, gameName, privChoice, bidAmount) {
  return <table>
    <tr>
      <td>
        {displayPills(privsToBuy(board), privChoice, (x) => setters.setPrivChoice(x),
                     (x) => x.med, (x,y) => x === y, HORIZONTAL)}
        <div class='med-text'>
          Price:
          <input value={bidAmount} onChange={(x) => setters.setBidAmount(x.target.value)}
                 type='number' size='5' class='ask-box' />
        </div>
      </td>
      <td>{bigImageButton(() => sendBuyPriv(props, gameName, privChoice, bidAmount), play, "ok")}</td>
      <td>{bigImageButton(() => clearAsks(), cancel, "cancel")}</td>
    </tr>
  </table>
}

function isCurrentCorpPriv(privName, board) {
  var out = false;
  board.corps.forEach((c) => {
    if(c.name === board.currentCorp) {
      c.privates.forEach((p) => {
        if(p.corp === privName && p.amount > 0) {
          out = true;
        }
      })
    }
  })
  return out;
}

function isOtherCorpPriv(privName, board) {
  var out = false;
  board.corps.forEach((c) => {
    if(c.name !== board.currentCorp) {
      c.privates.forEach((p) => {
        if(p.corp === privName && p.amount > 0) {
          out = true;
        }
      })
    }
  })
  return out;
}

function sendUse(props, priv, gameName, option) {
  put(props, "usePriv/"+gameName+'/'+priv+'/'+option, "")
  clearAsks();
}

function playWSToken(props, board, gameName) {
  if(isCurrentCorpPriv("ws", board)) {
    return <td>
      <div>TOKEN</div>
      <div>
        {showRoundButton(() => sendUse(props, 'ws', gameName, true), 'med-cert', 'purple', "W&S", 'white', 19, false)}
      </div>
      <div>KIRSCH</div>
    </td>
  }
}

function playWSTile(props, board, gameName) {
  if(isCurrentCorpPriv("ws", board)) {
    return <td>
      <div>TILEONLY</div>
      <div>
        {showHexButton(() => sendUse(props, 'ws', gameName, false), 'purple', 'med-cert', "W&S", 'white', 19, false)}
      </div>
      <div>KIRSCH</div>
    </td>
  }
}

function playCANtoken(props, board, gameName) {
  if(isCurrentCorpPriv("can", board)) {
    return <td>
      <div>TILE</div>
      <div>
        {showHexButton(() => sendUse(props, 'can', gameName, false), 'red', 'med-cert', "CAN", 'white', 20, false)}
      </div>
      <div>HOME</div>
    </td>
  }
}

function playGLSPort(props, board, gameName) {
 if(isCurrentCorpPriv("gls", board)) {
    return <td>
      <div>PLACE</div>
      <div>
        {showSquareToken(() => sendUse(props, 'gls', gameName, false), 'blue', 'white', 'med-cert', "GLS", 22, false)}
      </div>
      <div>PORT</div>
    </td>
  }
}

function buyBridge(props, board, gameName) {
  if(board.bridgeTokens > 0) {
    return <td>
      <div>BRIDGE</div>
      <div>
        {showRoundButton(() => sendUse(props, 'niag', gameName, false), 'med-cert', 'white', '$50', 'black', 22, false)}
      </div>
      <div>RIGHTS</div>
    </td>
  }
}

function buyTunnel(props, board, gameName) {
  if(board.tunnelTokens > 0) {
    return <td>
      <div>TUNNEL</div>
      <div>
        {showRoundButton(() => sendUse(props, 'stc', gameName, false), 'med-cert', 'white', '$50', 'black', 22, false)}
      </div>
      <div>RIGHTS</div>
    </td>
  }
}

function getUsePrivChoice(props, board, privChoice, gameName) {
  return <table>
    <tr>
      {playWSTile(props, board, gameName)}
      {playWSToken(props, board, gameName)}
      {playCANtoken(props, board, gameName)}
      {playGLSPort(props, board, gameName)}
      {buyBridge(props, board, gameName)}
      {buyTunnel(props, board, gameName)}
      <td>{bigImageButton(() => clearAsks(), cancel, "cancel")}</td>
    </tr>
  </table>
}

function preOpActionCell(props, board, gameName, withholdOption, buyingPriv, privChoice, usingPriv, bidAmount) {
  if (buyingPriv) return getBuyPrivChoice(props, board, gameName, privChoice, bidAmount);
  if(usingPriv) return getUsePrivChoice(props, board, privChoice, gameName)
  return getRevenueInformation(props, board, gameName, withholdOption, bidAmount)
}

function showWalletsBriefly(board) {
  return buyTable({}, "", board, [], board.moveNumber, false)
}

function PreRevOpPanel(props, board, gameName, withholdOption, buyingPriv, privChoice, usingPriv, bidAmount) {
  var corp = getCurrentCorp(board)
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr>
        <td colspan='5'><div class="centered">
          {showOpOrder(props, board, gameName)}
        </div></td>
      </tr><tr>
        {showEarlyLoanChoice(props, board, gameName)}
        {showPrivateOptions(props, board, gameName, buyingPriv, usingPriv)}
        {showTileOption(props, board, gameName)}
        {showTokenOption(props, board, gameName, corp)}
        {showDestButton(props, board, gameName)}
      </tr><tr>
        <td colspan='5' class="panel-cell"><div class="centered">
          {preOpActionCell(props, board, gameName, withholdOption, buyingPriv, privChoice, usingPriv, bidAmount)}
        </div></td>
      </tr><tr>
        <td colspan='5'><div class='centered'>
          {showWalletsBriefly(board)}
        </div></td>
      </tr><tr>
        <td colspan='5'>{showTrainOptions(props, board, gameName)}</td>
      </tr>
    </table>
  </div>
}

function sendDest(props, board, gameName) {
  put(props, "destination/"+gameName, "");
}

function showDestButton(props, board, gameName) {
  var corp = getCurrentCorp(board)
  if (corp.fundingType !== 10) return;
  var color = (corp.reachedDest) ? 'lightgreen' : 'white';
  var f = (corp.reachedDest) ? () => {} : () => sendDest(props, board, gameName)
  return <td class="panel-cell">
    <div>DESTINATION</div>
    <div>
      {showRoundButton(f, 'med-cert', color, 'DEST', 'black', 17, false)}
    </div>
  </td>
}

function sendEndOpTurn(props, board, gameName) {
  put(props, "endop/"+gameName, "")
}

function sendForcedTrain(props, board, gameName) { //TODO make an option screen with Diesel and pool if needed
  put(props, "forcedTrain/"+gameName+"/bank", "")
}

function showEndTurnOptions(props, board, gameName) {
  var c = getCurrentCorp(board);
  if (c.trains.length > 0) {
    return <td class="panel-cell" colspan='3'><div class='huge-text-flex'>
       DONE{bigImageButton(() =>{ sendEndOpTurn(props, board, gameName) }, play, "DONE")}
    </div></td>
  } else {
    return <td class="panel-cell" colspan='4'>
      <div>END WITH NO TRAIN / FORCED BUY?</div>
      <div>
        {showRoundButton(() => { sendEndOpTurn(props, board, gameName) },
                                 'med-cert', 'lightyellow', "NO", 'black', 24, false)}
        {showRoundButton(() => { sendForcedTrain(props, board, gameName)},
                                 'med-cert', 'lightyellow', "YES", 'black', 21, false)}
      </div>
    </td>
  }
}

function showPostTurnExtraRow(props, board, gameName, buyingPriv, privChoice, bidAmount, usingPriv) {
  if (buyingPriv) return <tr><td colspan='4' class='panel-cell'>
    {getBuyPrivChoice(props, board, gameName, privChoice, bidAmount)}
  </td></tr>
  if (usingPriv) return <tr><td colspan='4' class='panel-cell'>
    {getUsePrivChoice(props, board, privChoice, gameName)}
  </td></tr>
  return <tr>
    {showEndTurnOptions(props, board, gameName)}
  </tr>
}

function sendDrop(props, board, gameName, c, size) {
  put(props, "dropTrain/"+gameName+"/"+c.name+"/"+size, "")
}

function dropTrainButton(props, board, gameName, c, size) {
  var f = () => sendDrop(props, board, gameName, c, size)
  if(c.trains.includes(size)) return showSquareToken(
    f, 'lightgray', 'black', 'med-cert small-text', size, 28, false
  )
}

function dropChoice(props, board, gameName, c, limit) {
  if(c.trains.length <= limit) return
  return <div class="chooser med-text">
    {c.name}
    {dropTrainButton(props, board, gameName, c, 3)}
    {dropTrainButton(props, board, gameName, c, 4)}
    {dropTrainButton(props, board, gameName, c, 5)}
    {dropTrainButton(props, board, gameName, c, 6)}
  </div>
}

function trainLimit(board) {
  if(board.currentCorp === "CGR") return 3;
  if(board.trains.length < 2) return 2;
  if(board.trains.length < 9) return 3;
  return 4;
}

function TrainDropChoices(props, board, gameName) {
  var limit = trainLimit(board)
  return <div>
    <div class="asker-title">Select Train to Drop</div>
    <div>{board.corps.map(c => dropChoice(props, board, gameName, c, limit))}</div>
  </div>
}

function TrainDropPanel(props, board, gameName) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr>
        <td colspan='4'><div class="centered">
          {showOpOrder(props, board, gameName)}
        </div></td>
      </tr><tr><td colspan='4'>
        {TrainDropChoices(props, board, gameName)}
      </td></tr><tr>
        <td colspan='4'><div class='centered'>
          {showWalletsBriefly(board)}
        </div></td>
      </tr>
    </table>
    <div>{showTrainOptions(props, board, gameName)}</div>
  </div>
}

function PostRevOpPanel(props, board, gameName, buyingPriv, privChoice, bidAmount, usingPriv) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr>
        <td colspan='4'><div class="centered">
          {showOpOrder(props, board, gameName)}
        </div></td>
      </tr><tr>
        {showEarlyLoanChoice(props, board, gameName)}
        {showPrivateOptions(props, board, gameName, buyingPriv)}
        {showTrainButtons(props, board, gameName)}
      </tr>
      {showPostTurnExtraRow(props, board, gameName, buyingPriv, privChoice, bidAmount, usingPriv)}
      <tr>
        <td colspan='4'><div class='centered'>
          {showWalletsBriefly(board)}
        </div></td>
      </tr><tr>
      </tr>
    </table>
    <div>{showTrainOptions(props, board, gameName)}</div>
  </div>
}

function getCurrentCorp(board) {
  return findCorp(board, board.currentCorp)
}

function findCorp(board, name) {
  var out = null;
  board.corps.forEach((x) => {if(name === x.name) out = x})
  return out;
}

function askUsingPriv() {
  clearAsks();
  setters.setUsingPriv(true);
}

function findWallet(name, board) {
  var out = null;
  board.wallets.forEach((x) => {if(name === x.name) out = x})
  return out;
}

function findCurrentPrez(board) {
  return findWallet(getCurrentCorp(board).prez, board);
}

function unblockedStocks(wallet) {
  return wallet.stocks.filter(x => !wallet.blocks.includes(x.corp));
}

function sendForcedSale(props, board, gameName, buyCorp, bidAmount) {
  put(props, "forcedSale/"+gameName+"/"+buyCorp+"/"+bidAmount, "")
}

function showForcedSaleOptions(props, board, gameName, buyCorp, bidAmount, wallet) {
  return <div class="centered"><table>
      <tr><th colspan = '4'>FORCED SALE FOR {wallet.name} (${-wallet.cash})</th></tr>
      <tr>
        <td>
          {displayPills(unblockedStocks(wallet), buyCorp, (x) => setters.setBuyCorp(x.corp),
                            x=>CORP[x.corp].med, (x, y) => x.corp === y, HORIZONTAL)}
          <div class='med-text'>
            Quantity:
            <input value={bidAmount} onChange={(x) => setters.setBidAmount(x.target.value)}
                   type='number' size='5' class='ask-box' />
          </div>
        </td>
        <td>{bigImageButton(() => sendForcedSale(props, board, gameName, buyCorp, bidAmount), play, "ok")}</td>
        <td>{bigImageButton(() => clearAsks(), cancel, "cancel")}</td>
      </tr>
  </table></div>
}

function ForcedSalePanel(props, board, gameName, buyCorp, bidAmount) {
  var wallet = findCurrentPrez(board);
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr>
        <td colspan='4'><div class="centered">
          {showOpOrder(props, board, gameName)}
        </div></td>
      </tr>
      <tr><td class="panel-cell">
        {showForcedSaleOptions(props, board, gameName, buyCorp, bidAmount, wallet)}
      </td></tr><tr>
        <td colspan='4'><div class='centered'>
          {showWalletsBriefly(board)}
        </div></td>
      </tr>
    </table>
    <div>{showTrainOptions(props, board, gameName)}</div>
  </div>
}

function GameOverPanel(props, board, gameName) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <div>GAME HAS ENDED -- UNDO IS AVAILABLE</div>
    {showWalletsBriefly(board)}
  </div>
}

export function TrainPanel(props) {
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameList, setGameList] = useState(null);
  const [addingGame, setAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [oldPlayerName, setOldPlayerName] = useState("");
  const [editingPlayerName, setEditingPlayerName] = useState(false);
  const [shuffleOnStart, setShuffleOnStart] = useState(true);
  const [bidCorp, setBidCorp] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidoffWinner, setBidoffWinner] = useState(null);

  const [buyCorp, setBuyCorp] = useState(null);
  const [sellList, setSellList] = useState([]);
  const [buyFirst, setBuyFirst] = useState(true);
  const [newPar, setNewPar] = useState(0);
  const [buyType, setBuyType] = useState("");
  const [stockMove, setStockMove] = useState(0);
  const [mv, setMV] = useState(0);

  const [withholdOption, setWithholdOption] = useState(null);
  const [buyingPriv, setBuyingPriv] = useState(null);
  const [privChoice, setPrivChoice] = useState(null);
  const [usingPriv, setUsingPriv] = useState(null);

  setters.setGameName = setGameName;
  setters.setBoard = setBoard;
  setters.setGameList = setGameList;
  setters.setAddingGame = setAddingGame;
  setters.setNewGameName = setNewGameName;
  setters.setNewPlayerName = setNewPlayerName
  setters.setOldPlayerName = setOldPlayerName;
  setters.setEditingPlayerName = setEditingPlayerName;
  setters.setBidCorp = setBidCorp;
  setters.setBidAmount = setBidAmount;
  setters.setBidoffWinner = setBidoffWinner;

  setters.setBuyCorp = setBuyCorp;
  setters.setSellList = setSellList;
  setters.setBuyFirst = setBuyFirst;
  setters.setNewPar = setNewPar;
  setters.setBuyType = setBuyType;
  setters.setStockMove = setStockMove;
  setters.setMV = setMV;

  setters.setWithholdOption = setWithholdOption;
  setters.setBuyingPriv = setBuyingPriv;
  setters.setPrivChoice = setPrivChoice;
  setters.setUsingPriv = setUsingPriv;

  if (addingGame) {
    return AddGamePanel(props, newGameName);
  }
  if (isVoid(gameName)) {
    return GameChooser(props, gameList);
  }
  if (isVoid(board)) {
    loadBoard(props, gameName);
    return <div>
      <div>Loading Board for {gameName}</div>
      {imageButton(() => setGameName(null), cancel, "cancel")}
    </div>
  }
  if (editingPlayerName) {
    return <div>
      {showTitle(props, gameName)}
      {EditPlayerNamePanel(props, gameName, oldPlayerName, newPlayerName)}
    </div>
  }
  if (board.phase === GATHER) { //TODO put into a Panel object
    return <div>
      {showTitle(props, gameName)}
      {showUndoBar(props, board, gameName)}
      <div class="new-players">
        {listPlayersForGather(board)}
      </div>
      <div class="gather">
        New Player:
        <input type="text" value={newPlayerName} class="med-text"
               onChange={(e) => setNewPlayerName(e.target.value)}
               onKeyDown={(e) => onEnter(e.key, () => addPlayer(props, gameName, newPlayerName))}/>
        {imageButton(() => addPlayer(props, gameName, newPlayerName), add, "add")}
      </div>
      <div>
        <input type="checkbox" checked={shuffleOnStart} onChange={(e) => setShuffleOnStart(e.target.checked)} />
        Shuffle on Start
      </div>
      <div>{bigImageButton(() => startGame(props, gameName, shuffleOnStart), play, "startGame")}</div>
    </div>
  }
  if(board.phase === AUCTION) {
    return AuctionPanel(props, gameName, board, bidCorp, bidAmount, bidoffWinner);
  }
  if(board.phase === STOCK || board.phase === INITIAL) {
    return StockPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove, mv);
  }
  if(board.phase === OP && board.event === PRE_REV) {
    return PreRevOpPanel(props, board, gameName, withholdOption, buyingPriv, privChoice, usingPriv, bidAmount)
  }
  if(board.phase === OP && board.event === POST_REV) {
    return PostRevOpPanel(props, board, gameName, buyingPriv, privChoice, bidAmount, usingPriv)
  }
  if(board.phase === OP && board.event === TRAIN_DROP) {
    return TrainDropPanel(props, board, gameName);
  }
  if(board.phase === OP && board.event === FORCED_SALE) {
    return ForcedSalePanel(props, board, gameName, buyCorp, bidAmount);
  }
  if(board.phase === DONE) {
    return GameOverPanel(props, board, gameName)
  }
  return <div>
    <div class ="title">
      {gameName} (unknown state={board.phase})
      {imageButton(() => setGameName(null), cancel, "cancel")}
    </div>
    {showUndoBar(props, board, gameName)}
  </div>
}