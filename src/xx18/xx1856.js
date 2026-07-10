import React, {useState, useEffect} from 'react';
import { displayPills, HORIZONTAL, VERTICAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from '../util.js';
import './xx1856.css';
import { Auction } from './xxAuction.js';
import { Seater } from './xxSeater.js';
import { StockPanel } from './stock.js';
import {OperationPanel} from './op.js';

import add from '../icon/add.svg';
import check from '../icon/check.svg';
import cancel from '../icon/cancel.svg';
import ff from '../icon/ff.svg';
import left from '../icon/left.svg';
import right from '../icon/right.svg';

const URLH = 'http://10.0.0.143:32109/18xx/';

const setters = {};
const net = {};

function put(net, cmd, pkg, f, ff) {
  var t = (resp) => receiveBoard(resp.data)
  if(!isVoid(f)) t = f
    net.axios.put(URLH+cmd, pkg).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff()
      if(error.response) {
        net.setBanner("Error: "+error.response.data);
      } else {
        net.setBanner("Client Error: "+error);
      }
    }
  );
}

function get(net, cmd, f, ff) {
  var t = (resp) => receiveBoard(resp.data);
  if(!isVoid(f)) t = f
    net.axios.get(URLH+cmd).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff();
      if(error.response) {
        net.setBanner("error: "+error.response.data);
      } else {
        net.setBanner("Client Error: "+error);
      }
    }
  );
}

const phase2display = {
  GATHER: "Enter Names",
  AUCTION: "Auction",
  INITIAL: "1st Stock",
  STOCK: "Stock",
  OP: "Operating",
  DONE: "Game Over"
}

function displayRound(phase) {
  return phase2display[phase];
}

function selectGame(props, name) {
  net.get(net, "board/"+name)
}

function startAddingGame() {
  setters.setAddingGame(true);
}

function receiveGList(data) {
  setters.setGList(data)
  setters.setGLoad(false);
}

function receiveBoard(data) {
  setters.setBoard(data);
}

function receiveNewBoard(data) {
  setters.setAddingGame(false);
  setters.setGList(null);
  setters.setBoard(data);
}

function loadGList(props) {
  setters.setGLoad(true);
  net.get(net, "list", r => receiveGList(r.data), () => {setters.setGLoad(false)})
}

function createGame(props, gameName) {
  net.put(net, "create/"+gameName, "", r => receiveNewBoard(r.data), () => {setters.setAddingGame(false)})
}

function GameAdder(props, newGameName) {
  return <div>
    <div class='title'>1856 Clerk { settingsButton(props) }</div>
    <div>
      Game Name:
      <input type="text" value={newGameName}
             onChange={(e)=>setters.setNewGameName(e.target.value)}
             onKeyDown={(e) => onEnter(e.key, () => createGame(props, newGameName)) } />
    </div>
    <div>
      {imageButton(() => createGame(props, newGameName), check, "ok")}
      {imageButton(cancelAddGame, cancel, "cancel")}
    </div>
  </div>;
}

function GameChooser(props, gameList, loading) {
  if (isVoid(gameList)) {
    if (loading) {
      return <div>Loading in progress {loading?"true":"false"}</div>;
    } else {
      loadGList(props);
      return <div>failing to load</div>;
    }
  }
  return <div>
    <div class='title'>1856 Clerk { settingsButton(props) }</div>
    <div class="chooser">
      {displayPills(gameList, "", (x) => selectGame(props, x.name), (x)=>x.name, () => false, HORIZONTAL)}
      {props.admin ? imageButton(startAddingGame, add, "add") : <span/> }
    </div>
  </div>
}

function cancelAddGame() {
  setters.setAddingGame(false);
}

function undo(props, name) {
  net.put(net, "undo/"+name)
}

function redo(props, name) {
  net.put(net, "redo/"+name)
}

function redoAll(props, name) {
  net.put(net, "redoAll/"+name)
}

function moveNumberText(board) {
  if(board.undoCount > 0) return (board.moveNumber-board.undoCount)+"/"+board.moveNumber;
  return board.moveNumber
}

function GameHeader(props, board) {
  return <div class="unbar">
      <span>
        {smallImageButton(() => undo(props, board.name), left, "undo")}
        Move {moveNumberText(board)}
        {smallImageButton(() => redo(props, board.name), right, "redo")}
        {smallImageButton(() => redoAll(props, board.name), ff, "redoAll")}
      </span>
      <span>{board.name}{smallImageButton(() => setters.setBoard(null), cancel, "cancel")}</span>
      <span>{displayRound(board.phase)}</span>
  </div>
}

export function XXPanel(props) {
  const [board, setBoard] = useState(null);
  const [gList, setGList] = useState(null);
  const [gLoad, setGLoad] = useState(false);
  const [addingGame, setAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");

  setters.setBoard = setBoard;
  setters.setGList = setGList;
  setters.setGLoad = setGLoad;
  setters.setAddingGame = setAddingGame;
  setters.setNewGameName = setNewGameName;

  net.axios = props.axios;
  net.put = put;
  net.get = get;
  net.setBanner = props.setters.setBanner;
  net.admin = props.admin;

  if (addingGame) { return GameAdder(props, newGameName); }
  if (isVoid(board)) { return GameChooser(props, gList, gLoad); }
  if (board.phase === 'GATHER') return <div>
    <div>{GameHeader(props, board)}</div>
    <Seater net={net} board={board} />
  </div>
  if (board.phase === 'AUCTION') return <div>
    <div>{GameHeader(props, board)}</div>
    <Auction net={net} board={board} />
  </div>
  if (board.phase === 'STOCK' || board.phase === 'INITIAL') return <div>
    <div>{GameHeader(props, board)}</div>
    <div>{<StockPanel net={net} board={board} />}</div>
  </div>
  if (board.phase === 'OP') return <div>
    <div>{GameHeader(props, board)}</div>
    <OperationPanel net={net} board={board} />
  </div>
  return <div>
    <div>{GameHeader(props, board)}</div>
    <div>Unknown game state {JSON.stringify(board)}</div>
  </div>
}
