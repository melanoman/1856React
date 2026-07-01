import React, {useState, useEffect} from 'react';
import '../util.css';

import { smallImageButton, imageButton, bigImageButton, isVoid, onEnter } from '../util.js';

import add from '../icon/add.svg';
import check from '../icon/check.svg';
import cancel from '../icon/cancel.svg';
import pencil from '../icon/pencil.svg';
import play from '../icon/playGreen.svg';

const setters = {}

function changePlayerName(props, oldName, newName) {
  setters.setNewPlayerName("");
  setters.setEditingPlayer(null)
  props.net.put(props.net, "renamePlayer/"+props.board.name+"/"+oldName+"/"+newName)
}

function abortPlayerNameChange() { setters.setEditingPlayer(false) }

function EditPlayerNamePanel(props, oldPlayerName, newPlayerName) {
  return <div>
    <div class="subtitle">Changing name of {oldPlayerName}</div>
    <input type="text" value={newPlayerName} class="med-text"
        onChange={(e) => setters.setNewPlayerName(e.target.value)}
        onKeyDown={(e) => onEnter(e.key,
                   () => changePlayerName(props, oldPlayerName, newPlayerName))}/>
    <div>
      {imageButton(() => changePlayerName(props, oldPlayerName, newPlayerName), check, "ok")}
      {imageButton(() => abortPlayerNameChange(), cancel, "cancel")}
    </div>
  </div>
}

function playerNameEdit(props, player) {
  setters.setEditingPlayer(player);
}

function playerEditButton(props, player) {
  return smallImageButton(() => playerNameEdit(props, player.name), pencil, "edit");
}

function PlayerNameDisplay(props, player) {
  return <div class="new-player">
    Player {player.name}{playerEditButton(props, player)}
  </div>;
}

function addPlayer(props, newPlayerName) {
  props.net.put(props.net, "addPlayer/"+props.board.name+"/"+newPlayerName);
  setters.setNewPlayerName("");
}

function AddPlayerLine(props, newPlayerName) {
  return <div>
    <span>Add Player</span>
    <span>
      <input type="text" value={newPlayerName} class="med-text"
        onChange={(e) => setters.setNewPlayerName(e.target.value)}
        onKeyDown={(e) => onEnter(e.key,
          () => addPlayer(props, newPlayerName))}/>
    </span>
  </div>
}

function startGame(props, shuffle) {
  props.net.put(props.net, "startGame/"+props.board.name+"/"+shuffle)
}

export function Seater(props) {
  const [newPlayerName, setNewPlayerName] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [shuffle, setShuffle] = useState(false);

  setters.setNewPlayerName = setNewPlayerName;
  setters.setEditingPlayer = setEditingPlayer;
  setters.setShuffle = setShuffle;

  if(isVoid(props.board)) return <div class="error">Error: No Game to display</div>
  if(!isVoid(editingPlayer)) return <div>{EditPlayerNamePanel(props, editingPlayer, newPlayerName)}</div>
  return <div>
    {props.board.players.map((player) => PlayerNameDisplay(props, player))}
    <div>{ AddPlayerLine(props, newPlayerName) }</div>
    <div>
      <input type="checkbox" checked={shuffle} onChange={(e) => setters.setShuffle(e.target.checked)} />
      Shuffle on Start
    </div>
    <div>{bigImageButton(() => startGame(props, shuffle), play, "startGame")}</div>
  </div>
}