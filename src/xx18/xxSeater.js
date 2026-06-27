import React, {useState, useEffect} from 'react';
import '../util.css';

import { smallImageButton, imageButton, isVoid, onEnter } from '../util.js';

import add from '../icon/add.svg';
import check from '../icon/check.svg';
import cancel from '../icon/cancel.svg';
import pencil from '../icon/pencil.svg';

const setters = {}

function changePlayerName() { alert("TODO changeName") }
function abortPlayerNameChange() {alert("TODO abortNameChange") }

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

function playerNameEdit(props, player) {
  alert("TODO edit name screen")
}

function playerEditButton(props, player) {
  return smallImageButton(() => playerNameEdit(props, player), pencil, "edit");
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

export function Seater(props) {
  const [newPlayerName, setNewPlayerName] = useState(null);

  setters.setNewPlayerName = setNewPlayerName;

  if(isVoid(props.board)) return <div class="error">Error: No Game to display</div>
  return <div>
    {props.board.players.map((player) => PlayerNameDisplay(props, player))}
    <div>{ AddPlayerLine(props, newPlayerName) }</div>
    <div>SHUFFLE CHECKBOX HERE</div>
    <div>START GAME HERE</div>
  </div>
}