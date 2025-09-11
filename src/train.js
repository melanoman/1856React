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
const PRE_REV = "PRE_REV";
const POST_REV = "POST_REV";
const CGRFORM= "CGRFORM";
const DONE = "DONE";

const PAR_TYPE = "par";
const BANK_TYPE = "bank";
const POOL_TYPE = "pool";

const TRAIN = "TRAIN";

var loadingList = false;
var loadingBoard = false;

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function clearAsks() {
  setters.setBidCorp(null);
  setters.setBuyCorp(null);
  setters.setSellList([]);
}

function undo(props, name) {
  clearAsks();
  props.axios.put(URLH+"undo/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.data);
      } else {
        props.setters.setBanner("no undo response!");
      }
    }
  );
}

function redo(props, name) {
  clearAsks();
  props.axios.put(URLH+"redo/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("redo error: "+error.response.data);
      } else {
        props.setters.setBanner("no redo response!");
      }
    }
  );
}

function redoAll(props, name) {
  clearAsks();
  props.axios.put(URLH+"redoAll/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("redoAll error:"+error.response.data);
      } else {
        props.setters.setBanner("no redoAll response!");
      }
    }
  );
}

function loadGameList(props) {
  loadingList = true;
  props.axios.get(URLH+"list").then((resp) => receiveList(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("loadGameList error: "+error.response.data);
      } else {
        props.setters.setBanner("no loadList response!");
      }
    }
  );
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
  props.axios.put(URLH+"create/"+newGameName).then((resp) => gameCreated(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("createGame error: "+error.response.data);
      } else {
        props.setters.setBanner("no createGame response!");
      }
    }
  );
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
  props.axios.get(URLH+"status/"+gameName).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingBoard = false;
      if(error.response) {
        props.setters.setBanner("loadBoard error: "+error.response.data);
      } else {
        props.setters.setBanner("no loadGame response!");
      }
    }
  );
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
  props.axios.put(URLH+"player/new/"+gameName+'/'+player).then(() => loadBoard(props, gameName)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.data);
      } else {
        props.setters.setBanner("no addPlayer response!");
      }
    }
  );
  setters.setNewPlayerName("");
}

function changePlayerName(props, gameName, oldName, newName) {
  setters.setEditingPlayerName(false);
  if(isBlank(newName) || oldName === newName) {
    return;
  }
  props.axios.put(URLH+"player/rename/"+gameName+"/"+oldName+"/"+newName).then(
    (resp) => receiveBoard(resp.data)).catch(
    (error) => {
      setters.setNewPlayerName("");
      if(error.response) {
        props.setters.setBanner("ChangeName Error: "+error.response.data);
      } else {
        props.setters.setBanner("no renamePlayer response!");
      }
    }
  );
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
  if(board.phase === OP) return <span class="left">Operating Round (countdown {board.remainingOpRounds})</span>
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
  props.axios.put(URLH+"start/"+gameName+"?shuffle="+shuffle).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("startGame Error: "+error.response.data);
      } else {
        props.setters.setBanner("no startGame response!");
      }
    }
  );
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
  flos: {med: medCert("FLOS", 18, 3, 'tan', 'black'), tiny:tinyCert("FLOS",15, 'tan', 'black'),
         price: 20, num:1, name:"Flos Tramway"},
  ws:   {med: medCert("W&S",  16, 3, 'purple', 'white'), tiny:tinyCert("W&S",16, 'purple', 'white'),
         price: 40, num:2, name:"Waterloo & Sawgreen Railway Co."},
  can:  {med: medCert("CAN",  18, 3, 'red', 'white'), tiny:tinyCert("CAN",18, 'red', 'white'),
         price: 50, num:3, name:"The Canada Company"},
  gls:  {med: medCert("GLS",  22, 3, 'blue', 'white'), tiny:tinyCert("GLS",20, 'blue', 'white'),
         price: 70, num:4, name:"Great Lakes Shipping Company"},
  niag: {med: medCert("NIAG", 16, 3, 'aqua', 'black'), tiny:tinyCert("NIAG",15, 'aqua', 'black'),
         price: 100,num:5, name:"Niagara Falls Suspension Bridge Company"},
  stc:  {med: medCert("ST.C", 24, 3, 'gray', 'yellow'), tiny:tinyCert("ST.C",19, 'gray', 'yellow'),
         price: 100,num:6, name:"St. Clair Frontier Tunnel Company"},
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

function sendAuctionBuy(props, board) {
  props.axios.put(URLH+"auction/buy/"+board.name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("auctionBuy Error: "+error.response.data);
      } else {
        props.setters.setBanner("no auctionBuy response!");
      }
    }
  );
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
  props.axios.put(URLH+"pass/"+gameName).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("sendPass Error: "+error.response.data);
      } else {
        props.setters.setBanner("no sendPass response!");
      }
    }
  )
}

function priorityCell(player, priorityHolder) {
  if(priorityHolder === player) {
    return <td><img src={ff} class="priority-arrow" alt="priority-marker"/></td>
  }
  return <td/>
}

function AuctionRow(wallet, currentPlayer, priorityHolder) { //TODO show pass
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
  var cmd = URLH+"auction/bid/"+gameName+'/'+bidCorp+'/'+bidAmount;
  clearAsks();
  props.axios.put(cmd).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("sendBid Error: "+error.response.data);
      } else {
        props.setters.setBanner("no sendBid response!");
      }
    }
  );
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
  props.axios.put(URLH+"auction/bidoff/"+gameName+"/"+winningBidder+"/"+bidAmount
  ).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("finalBid Error: "+error.response.data);
      } else {
        props.setters.setBanner("no finalBid response!");
      }
    }
  );
}

function bidoffPanel(props, gameName, board, bidoffWinner, bidAmount) {
  if(board.event === "bidoff") {
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

function playerShareCell(props, board, corp, wallet, sellList, mv) {
  var clazz="row-break"
  if (board.currentPlayer === wallet.name) {
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

  return <td class={clazz} onClick={f} >
    {showTinyStockCount(corp.name, stock.amount, corp.prez === wallet.name, stock.hasSold)}
  </td>
}

function playerShareCells(props, board, corp, sellList, mv) {
  return board.wallets.map((w) => playerShareCell(props, board, corp, w, sellList, mv))
}

function setParClick(corp, board) {
  setters.setBuyCorp(corp);
  setters.setBuyType(PAR_TYPE);
  setters.setStockMove(board.moveNumber);
  setters.setNewPar(0);
}

function setParButton(corp, board) {
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

function corpShareCells(props, board, corp) {
  var out = []
  out.push(<td>{CORP[corp.name].tiny}</td>)
  if(corp.par === 0) {
    out.push(<td class="row-break" colspan="4">{setParButton(corp, board)}</td>)
  } else {
    out.push(<td class="row-break">{corp.par > 0 ? corp.par : ""}</td>)
    out.push(<td>{corpHoldingGraphic(() => bankBuy(corp, board), corp.bankShares, corp)}</td>)
    out.push(<td class="row-break">{corp.price.price}</td>)
    out.push(<td>{corpHoldingGraphic(() => poolBuy(corp, board), corp.poolShares, corp)}</td>)
  }
  return out;
}

function buyRow(props, gameName, board, corp, sellList, mv) {
  return <tr>
    {corpShareCells(props, board, corp)}
    {playerShareCells(props, board, corp, sellList, mv)}
  </tr>
}

function priorityArrow(board, name) {
  if (board.priorityHolder === name) {
    return <img src={ff} class="priority-arrow" alt="priority-marker"/>
  }
}

function playerNameHeader(board, name) {
  if (board.currentPlayer === name) {
    return <th class="selected-column">{priorityArrow(board, name)}{name}</th>
  }
  return <th>{priorityArrow(board, name)}{name}</th>
}

function playerNameColumns(board) {
  return board.players.map((name) => playerNameHeader(board, name))
}

function playerStockCashCell(w, board) {
  var clazz = "row-break";
  if (w.name === board.currentPlayer) {
    clazz = "selected row-break";
  }
  return <td class={clazz}>{w.cash}</td>
}

function stockCashRow(board) {
  return <tr>
    <td>{CASH_TINY}</td>
    <td class="row-break" colspan ='4'>{board.bankCash}</td>
    {board.wallets.map((w) => playerStockCashCell(w, board))}
  </tr>
}

function tinyPrivCell(privates, selected) {
  return <td class={selected ? "selected row-break" : "row-break"}>
    {privates.map((p) => <div>{PRIV[p.corp].tiny}</div>)}
  </td>
}

function stockPrivRow(board) {
  return <tr>
    <td class="row-break" />
    <td class="row-break" colspan='4' />
    {board.wallets.map((w) => tinyPrivCell(w.privates, w.name === board.currentPlayer))}
  </tr>
}

function buyTable(props, gameName, board, sellList, mv) {
  return <table class="buy-table">
    <tr><th/><th colspan="2">Bank</th><th colspan="2">Pool</th>{playerNameColumns(board)}</tr>
    {stockCashRow(board)}
    {stockPrivRow(board)}
    {board.corps.map((corp) => buyRow(props, gameName, board, corp, sellList, mv))}
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
      props.setBanner("Unknown buy configuration");
  }
}

function sendPar(props, gameName, buyCorp, newPar, stockMove) {
  props.axios.put(URLH+"par/"+gameName+"/"+buyCorp.name+"/"+newPar).then(
                 (resp) => receiveBoard(resp.data, stockMove)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("setPar Error: "+error.response.data);
      } else {
        props.setters.setBanner("no setPar response!");
      }
    }
  );
}

function sendSimpleBuy(props, gameName, buyCorp, buyType, stockMove) {
  props.axios.put(URLH+"buy/"+gameName+"/"+buyType+"/"+buyCorp.name).then(
                 (resp) => receiveBoard(resp.data, stockMove)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("simpleBuy Error: "+error.response.data);
      } else {
        props.setters.setBanner("no simpleBuy response!");
      }
    }
  );
}

function sendSale(props, gameName, sellList, stockMove) { //TODO sendSale
  props.axios.put(URLH+"sell/"+gameName, sellList).then((resp) => receiveBoard(resp.data, stockMove)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("stockSale Error: "+error.response.data);
      } else {
        props.setters.setBanner("no stockSale response!");
      }
    }
  );
}


function sendBuySell() {  //TODO sendBuySell
  alert("TODO send BS")
}

function sendSellBuy() {  //TODO sendSellBuy (same as BS?)
  alert("TODO send SB")
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
        Buy Bank {CORP[buyCorp.name].med}{smallImageButton(() => clearBuy(), cancel, "cancel")}
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
  if(sellList.length == 0) { //TODO different types of buy
    return <tr>
      {playerBuyAction(props, gameName, board, buyCorp, buyType, newPar)}
      <td>{bigImageButton(() => sendBuy(props, gameName, buyCorp, buyType, newPar, stockMove), play, "buy")}</td>
    </tr>
  }
  if(isVoid(buyCorp)) { // TODO SOON build sell list
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
      <td>{bigImageButton(() => sendBuySell(props, gameName, buyCorp, buyType, newPar, sellList), play, "pass")}</td>
    </tr>
  }
  return <tr>
    {playerSellAction(props, gameName, board, sellList)}
    {swapControl(buyFirst)}
    {playerBuyAction(props, gameName, board, buyCorp, buyType, newPar)}
    <td>{bigImageButton(() => sendSellBuy(props, gameName, buyCorp, buyType, newPar, sellList), play, "pass")}</td>
  </tr>
}

function StockPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove, mv) {
  return <div>
    {showTitle(props, gameName)}
    {showUndoBar(props, board, gameName)}
    <table>
      <tr><td colSpan='9'>{buyTable(props, gameName, board, sellList, mv)}</td></tr>
      {playerStockActionPanel(props, gameName, board, buyFirst, buyCorp, buyType, newPar, sellList, stockMove)}
    </table>
  </div>
}

function opClass(board, corp) {
  if(corp.name === board.currentCorp) return "op-selected"
  return corp.hasOperated ? "op-done" : "op-todo"
}

function opIcon(board, x) {
  if (x.par === 0) return;
  var icon = x.hasFloated ? CORP[x.name].tiny : CORP[x.name].med;
  return <div class={opClass(board, x)}>{icon}</div>
}

function showOpOrder(props, board, gameName) {
  return board.corps.map(x => opIcon(board, x))
}

function maxTileColor(board) {
  if(board.trains.length < 2) return 'lightgray';
  switch(board.trains[0]) {
    case 2: return 'yellow';
    case 3: case 4: return 'green';
    case 5: case 6: return 'brown';
    default: return 'lightblue'; //something is wrong
  }
}

function extraToken(props, board, gameName) { //TODO if current corp has W&S, offer power

}

function extraTile(props, board, gameName) { //TODO if current corp has CA, offer power

}

function showTileOption(props, board, gameName) {
  // TODO make clickable, show selected
  var color = maxTileColor(board);
  return <td class='panel-cell'>
    <div class='centered'>TILE LAY</div>
    <div class='centered'>
      {showHexButton(() => {}, color, 'med-cert', "", 20, true)}
      {showHexButton(() => {}, color, 'med-cert', "", 20, false)}
      {showHexButton(() => {}, color, 'med-cert', "$40", 22, false)}
    </div>
  </td>
}

function showTokenOption(props, board, gameName) {
  return <td class='panel-cell'>
    <div class='centered'>TOKEN PLACEMENT</div>
    <div class='centered'>
      {showToken(() => {}, 'black', 'med-cert', "", 20, true)}
      {showToken(() => {}, 'black', 'med-cert', "", 20, false)}
      {showToken(() => {}, 'black', 'med-cert', "$40", 22, false)}
    </div>
  </td>
}

function showEarlyLoanChoice(props, board, gameName) {
  return <td class="panel-cell">
    <div class='centered'>EARLY LOAN</div>
    <div class='centered'>
      {showLoanToken(() => {}, 'pink', 'med-cert', "$100", 20, true)}
      {showLoanToken(() => {}, 'pink', 'med-cert', "$100", 20, false)}
    </div>
  </td>
}

function getRevenueInformation(props, board, gameName) {
  return [
    <td><table class="panel-cell"><tr class='med-text'>
      <td colspan='2'>Revenue: <input type='number' size='5' class='ask-box' /></td>
    </tr><tr>
      <td><button class='which'>Withhold</button></td>
      <td><button class='which'>Pay Out</button></td>
    </tr></table></td>,
    <td>{bigImageButton(() => alert("TODO commit revenue choices"), play, "ok")}</td>
  ]
}

function showLoanOption() {
  return <td class="panel-cell">
    <div class='centered'>LATE LOAN</div>
    <div class='centered'>
      {showLoanToken(() => {}, 'pink', 'med-cert', "$100", 20, true)}
      {showLoanToken(() => {}, 'pink', 'med-cert', "$100", 20, false)}
    </div>
  </td>
}

function showBuyPrivOptions() { //TODO BUY PRIV PANEL
  return <td class="panel-cell med-text">BUY PRIV</td>
}

function showPrivOption() {return "USE/BUY PRIV"}
function showTrainOptions(props, board, gameName) { //TODO make Clickable
  if (board.trains.length > 2) { //TODO make clickable
    var out = [ showTinyStockCount(TRAIN, board.trains[0], true, false) ];
    board.trains.slice(1).forEach(x => out.push(showTinyStockCount(TRAIN, x, false, false)));
    out.push(CORP[TRAIN].tiny);
    return <div><div class="centered">TRAIN MARKET</div><div>{out}</div></div>
  } else { //TODO make this clickable and gfx
    return <div>CORP[TRAIN].tiny</div>
  }
}

function trainLevel(board) {
  if (board.trains.length < 2) return 10; //DIESEL
  return board.trains[0];
}

function showHex(fillColor, clazz, text, offset, doEx) {
  var ex = doEx ? <path d="M 18 10 l 34 50 M 52 10 l -34 50" fill='none' stroke-width='4' stroke="red" /> : <path />
  return <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
    <path d="M 18 10 l 34 0 17 25 -17 25 -34 0 -17 -25 17 -25" fill={fillColor} stroke-width="2" stroke="black" />
    {ex}
    <text class="tiny-hex-text" x={offset} y="40" fill='black'>{text}</text>
  </g></svg>
}

function showHexButton(f, fillColor, clazz, text, offset, doEx) {
  return <button class="naked-button" onClick={f}>{showHex(fillColor, clazz, text, offset, doEx)}</button>
}

function showToken(f, fillColor, clazz, text, offset, doEx) {
  var ex = doEx ? <path d="M 18 13 l 34 40 M 52 13 l -34 40" fill='none' stroke-width='4' stroke="red" /> : <path />
    return <button class='naked-button' onClick={f} >
      <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
        <circle cx='35' cy='35' r='25' fill='lightblue' stroke-width="2" stroke="black" />
        {ex}
        <text class="tiny-hex-text" x={offset} y="40" fill={fillColor} >{text}</text>
      </g></svg>
    </button>
}

function showLoanToken(f, fillColor, clazz, text, offset, doEx) {
  var ex = doEx ? <path d="M 18 13 l 34 40 M 52 13 l -34 40" fill='none' stroke-width='4' stroke="red" /> : <path />
  return <button class='naked-button' onClick={f} >
    <svg class={clazz} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><g>
      <rect width='50' height='50' x='10' y='10' rx='10' ry='10' fill={fillColor} stroke-width="2" stroke="black" />
      {ex}
      <text class="tiny-hex-text" x={offset} y="40" fill='black' >{text}</text>
    </g></svg>
  </button>
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
  if (board.phase === GATHER) {
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
    return <div>
      {showTitle(props, gameName)}
      {showUndoBar(props, board, gameName)}
      <table>
        <tr>
          <td vertical-align='top'>{showOpOrder(props, board, gameName)}</td>
          <td>
            <table><tr>
              {showEarlyLoanChoice(props, board, gameName)}
              {showBuyPrivOptions(props, board, gameName)}
            </tr><tr>
              {showTileOption(props, board, gameName)}
              {showTokenOption(props, board, gameName)}
            </tr></table>
            {getRevenueInformation(props, board, gameName)}

            <div>{showTrainOptions(props, board, gameName)}</div>
          </td>
        </tr>
      </table>
    </div>
  }
  if(board.phase === STOCK && board.event === POST_REV) {
    return <div>
      {showTitle(props, gameName)}
      {showUndoBar(props, board, gameName)}
      <table>
        <tr>
          <td vertical-align='top'>{showOpOrder(props, board, gameName)}</td>
          <td>
            <div>{showLoanOption(props, board, gameName)}</div>
            <div>{showPrivOption(props, board, gameName)}</div>
          </td>
        </tr>
      </table>
      <div>{showTrainOptions(props, board, gameName)}</div>
      <div>SHOW SELECTED ACTIONS, CONFIRM</div>
    </div>
  }
  return <div>
    <div class ="title">
      {gameName} (unknown state={board.phase})
      {imageButton(() => setGameName(null), cancel, "cancel")}
    </div>
    {showUndoBar(props, board, gameName)}
  </div>
}