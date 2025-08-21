import React, {useState} from 'react';
import { displayPills, HORIZONTAL, isVoid, isBlank,
         imageButton, smallImageButton, settingsButton, onEnter } from './util.js';
import './train.css'

import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import pencil from './icon/pencil.svg';
import left from './icon/left.svg';
import right from './icon/right.svg';
import ff from './icon/ff.svg';

const setters = {}
const URLH = 'http://10.0.0.143:32109/1856/';

const GATHER = "GATHER";

var loadingList = false;
var loadingBoard = false;

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function undo(props, name) {
  props.axios.put(URLH+"undo/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.message); //TODO fix display
      } else {
        props.setters.setBanner("no undo response!");
      }
    }
  );
}

function redo(props, name) {
  props.axios.put(URLH+"redo/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no redo response!");
      }
    }
  );
}

function redoAll(props, name) {
  props.axios.put(URLH+"redoAll/"+name).then((resp) => receiveBoard(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("errro");
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
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no loadList response!");
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
        props.setters.setBanner("Error: "+error.response.error);
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
        props.setters.setBanner("ChangeName Error: "+error.response.error);
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

function showUndoBar(props, board) {
  if(board.undoCount > 0) {
    return <div class="undo-rewound">
      {smallImageButton(() => undo(props, board.name), left, "undo")}
      Move {board.moveNumber - board.undoCount} of {board.moveNumber}
      {smallImageButton(() => redo(props, board.name), right, "redo")}
      {smallImageButton(() => redoAll(props, board.name), ff, "redoAll")}
    </div>
  }
  return <div class="undo-current">
    {smallImageButton(() => undo(props, board.name), left, "undo")}
    Move {board.moveNumber}
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

export function TrainPanel(props) {
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameList, setGameList] = useState(null);
  const [addingGame, setAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [oldPlayerName, setOldPlayerName] = useState("");
  const [editingPlayerName, setEditingPlayerName] = useState(false);

  setters.setGameName = setGameName;
  setters.setBoard = setBoard;
  setters.setGameList = setGameList;
  setters.setAddingGame = setAddingGame;
  setters.setNewGameName = setNewGameName;
  setters.setNewPlayerName = setNewPlayerName
  setters.setOldPlayerName = setOldPlayerName;
  setters.setEditingPlayerName = setEditingPlayerName;


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