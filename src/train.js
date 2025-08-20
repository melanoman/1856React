import React, {useState} from 'react';
import { displayPills, HORIZONTAL, isVoid, imageButton, settingsButton, onEnter } from './util.js';
import './train.css'

import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';

const setters = {}
const URLH = 'http://10.0.0.143:32109/1856/';

const GATHER = "GATHER";

var loadingList = false;
var loadingBoard = false;

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function loadGameList(props) {
  loadingList = true;
  props.axios.get(URLH+"list").then((resp) => receiveList(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function selectGame(name) {
  setters.setGameName(name);
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
        props.setters.setBanner("errro");
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
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no loadGame response!");
      }
    }
  );
}

function listPlayersForGather(board) {
  return board.players.map((player) => <div class="new-player">Player {player}</div>);
}

function addPlayer(props, gameName, player) {
  props.axios.put(URLH+"player/new/"+gameName+'/'+player).then(() => loadBoard(props, gameName)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.error);
      } else {
        props.setters.setBanner("no addPlayer response!");
      }
    }
  );
  setters.setNewPlayerName("");
}

export function TrainPanel(props) {
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameList, setGameList] = useState(null);
  const [addingGame, setAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

  setters.setGameName = setGameName;
  setters.setBoard = setBoard;
  setters.setGameList = setGameList;
  setters.setAddingGame = setAddingGame;
  setters.setNewGameName = setNewGameName;
  setters.setNewPlayerName = setNewPlayerName

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
  if (board.phase === GATHER) {
    return <div>
      <div class="title">{gameName} (not started){imageButton(() => setGameName(null), cancel, "cancel")}</div>
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
      <div>=== Shuffle controller goes here ===</div>
      <div>=== start game controller goes here ===</div>
    </div>
  }
  return <div>
    <div class ="title">
      {gameName} (unknown state={board.phase})
      {imageButton(() => setGameName(null), cancel, "cancel")}
    </div>
  </div>
}