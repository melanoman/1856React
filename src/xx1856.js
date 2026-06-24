import React, {useState, useEffect} from 'react';
import { displayPills, HORIZONTAL, VERTICAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from './util.js';
import './xx1856.css';

import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';

const URLH = 'http://10.0.0.143:32109/18xx/';

const setters = {};

function put(props, cmd, pkg, f, ff) {
  var t = (resp) => receiveBoard(props, resp.data);
  if(!isVoid(f)) t = f
  props.axios.put(URLH+cmd, pkg).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff()
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.data);
      } else {
        props.setters.setBanner("Server Error: "+error);
      }
    }
  );
}

function get(props, cmd, f, ff) {
  var t = (resp) => receiveBoard(props, resp.data);
  if(!isVoid(f)) t = f
  props.axios.get(URLH+cmd).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff();
      if(error.response) {
        props.setters.setBanner("error: "+error.response.data);
      } else {
        props.setters.setBanner("Server Error: "+error);
      }
    }
  );
}

function selectGame(props, name) {
  get(props, "board/"+name)
}

function startAddingGame() {
  setters.setAddingGame(true);
}

function receiveGList(data) {
  setters.setGList(data)
  setters.setGLoad(false);
}

function receiveBoard(props, data) {
  setters.setBoard(data);
}

function receiveNewBoard(props, data) {
  setters.setAddingGame(false);
  setters.setGList(null);
  setters.setBoard(data);
}

function loadGList(props) {
  setters.setGLoad(true);
  get(props, "list", r => receiveGList(r.data), () => {setters.setGLoad(false)})
}

function createGame(props, gameName) {
  put(props, "create/"+gameName, "", r => receiveNewBoard(props, r.data), () => {setters.setAddingGame(false)})
}

function GameAdder(props, newGameName) {
  return <div>
    <div class='title'>1856 Clerk { settingsButton(props) }</div>
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

  if (addingGame) { return GameAdder(props, newGameName); }
  if (isVoid(board)) { return GameChooser(props, gList, gLoad); }
  return <div>Game is {board.name}</div>;
}
