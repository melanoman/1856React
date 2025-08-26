import React, {useState} from 'react';
import { displayPills, HORIZONTAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from './util.js';
import './train.css'

import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import play from './icon/playGreen.svg';
import pencil from './icon/pencil.svg';
import left from './icon/left.svg';
import right from './icon/right.svg';
import ff from './icon/ff.svg';

const setters = {}
const URLH = 'http://10.0.0.143:32109/1856/';

const GATHER = "GATHER";
const AUCTION = "AUCTION";
const STOCK = "STOCK";
const OP = "OP";
const CGRFORM= "CGRFORM";
const DONE = "DONE";

var loadingList = false;
var loadingBoard = false;

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function clearAsks() {
  setters.setBidCorp(null);
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

function receiveBoard(board) {
  loadingBoard = false;
  setters.setBoard(board);
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
  if(board.phase === OP) return <span class="left">Operating Round (countdown {board.remainingOpRounds})</span>
}

function showUndoBar(props, board) {
  if(board.undoCount > 0) {
    return <div class="undo-bar">
      <span>
        {smallImageButton(() => undo(props, board.name), left, "undo")}
        Move {board.moveNumber - board.undoCount} of {board.moveNumber}
        {smallImageButton(() => redo(props, board.name), right, "redo")}
        {smallImageButton(() => redoAll(props, board.name), ff, "redoAll")}
      </span>
      {showRound(board)}
    </div>
  }
  return <div class="undo-bar">
    <span>
      {smallImageButton(() => undo(props, board.name), left, "undo")}
      Move {board.moveNumber}
    </span>
    {showRound(board)}
  </div>
}

function showTitle(props, gameName) {
  return <div class="title">
    1856 [{gameName}{imageButton(() => setters.setGameName(null), cancel, "cancel")}] {settingsButton(props)}
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

function showMedCert(text, x, border, bg, textColor) {
  return <svg class="med-cert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 70"><g>
   <path d="M 10 10 l 75 0 0 50 -75 0 0 -50" fill={bg} stroke-width={border} stroke="black" />
   <text class="med-cert-text" x={x} y="45" fill={textColor}>{text}</text>
  </g></svg>
}

const priv = {
  flos: {med: showMedCert("FLOS", 18, 3, 'tan', 'black'),    price: 20, num:1, name:"Flos Tramway"},
  ws:   {med: showMedCert("W&S",  16, 3, 'purple', 'white'), price: 40, num:2, name:"Waterloo & Sawgreen Railway Co."},
  can:  {med: showMedCert("CAN",  18, 3, 'red', 'white'),    price: 50, num:3, name:"The Canada Company"},
  gls:  {med: showMedCert("GLS",  22, 3, 'blue', 'white'),   price: 70, num:4, name:"Great Lakes Shipping Company"},
  niag: {med: showMedCert("NIAG", 16, 3, 'aqua', 'black'),   price: 100,num:5, name:"Niagara Falls Suspension Bridge Company"},
  stc:  {med: showMedCert("ST.C", 24, 3, 'gray', 'yellow'),  price: 100,num:6, name:"St. Clair Frontier Tunnel Company"},
  SOLD: {med: showMedCert("SOLD", 14, 4, 'gray', 'white'),   price:-1, num:-1},
}

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
  var corpNum = priv[corpName].num;
  if (corpNum === block) sendAuctionBuy(props, board);
  if (corpNum > block) setters.setBidCorp(corpName);
}

function AuctionCell(wallet, privName) {
  var out = <td/>;
  wallet.privates.forEach((x) => {
    if(x.corp === privName) {
      if(x.amount === 3) {
        out = <td>{priv[privName].med}</td>
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
    return <th>{priv.SOLD.med}</th>
  }
}

function showDiscount(props, board) {
  var cert = priv[board.currentCorp];
  return <div class="subtitle" onClick={() => sendAuctionBuy(props, board)}>
    Offering: {cert.med} Price: {cert.price - board.auctionDiscount}
  </div>
}

function AuctionTable(props, gameName, board) {
  var block = priv[board.currentCorp].num;
  return <div>
    <table class="auction-table">
      <tr>
        <th/>
        <th>Player</th>
        <th>CASH</th>
        {auctionHeader(props, "flos", priv.flos, block, board)}
        {auctionHeader(props, "ws", priv.ws, block, board)}
        {auctionHeader(props, "can", priv.can, block, board)}
        {auctionHeader(props, "gls", priv.gls, block, board)}
        {auctionHeader(props, "niag", priv.niag, block, board)}
        {auctionHeader(props, "stc", priv.stc, block, board)}
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
        Bid {priv[bidCorp].med} {priv[bidCorp].name}:
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
      <div class="asker-title">Auctioning {priv[board.currentCorp].med} {priv[board.currentCorp].name}</div>
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
    {showUndoBar(props, board)}
    {AuctionTable(props, gameName, board)}
    {bidInputPanel(props, gameName, board, bidCorp, bidAmount)}
    {bidoffPanel(props, gameName, board, bidoffWinner, bidAmount)}
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
      {showUndoBar(props, board)}
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
  if(board.phase === STOCK) {
    return <div>
      {showTitle(props, gameName)}
      {showUndoBar(props, board)}
      <div>Stock Phase Goes Here</div>
    </div>
  }
  if(board.phase === OP) {
    return <div>
      {showTitle(props, gameName)}
      {showUndoBar(props, board)}
      <div>Operating Phase Goes Here</div>
    </div>
  }
  return <div>
    <div class ="title">
      {gameName} (unknown state={board.phase})
      {imageButton(() => setGameName(null), cancel, "cancel")}
    </div>
    {showUndoBar(props, board)}
  </div>
}