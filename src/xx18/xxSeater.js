import React, {useState, useEffect} from 'react';
import '../util.css';

import { imageButton, isVoid, onEnter } from '../util.js';

import check from '../icon/check.svg';
import cancel from '../icon/cancel.svg';

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

function playerEditButton(props, player) {
}

function PlayerNameDisplay(props, player) {
    return <div class="new-player">Player {player.name}{playerEditButton(props, player)}</div>;
}

export function Seater(props) {
  const [newPlayerName, setNewPlayerName] = useState(null);

  setters.setNewPlayerName = setNewPlayerName;

  if(isVoid(props.board)) return <div class="error">Error: No Game to display</div>
  return <div>
    {props.board.players.map((player) => PlayerNameDisplay(props, player))}
    <div>Add player goes here</div>
  </div>
  //TODO if <6 players, show add player
}