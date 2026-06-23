import React, {useState, useEffect} from 'react';
import { displayPills, HORIZONTAL, VERTICAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from './util.js';
import './xx1856.css';

import add from './icon/add.svg';

const URLH = 'http://10.0.0.143:32109/18xx/';

const setters = {};

function receiveHistory() {
  //TODO
}

function get(props, cmd, f, ff) {
  var t = (resp) => receiveHistory(resp.data);
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

function selectGame(props, name) {
  setters.setGName(name);
  //TODO load board
}

function startAddingGame() {
  //TODO add game
}

function receiveGList(data) {
  setters.setGList(data)
  setters.setGLoad(false);
}

function loadGList(props) {
  setters.setGLoad(true);
  get(props, "list", (resp) => receiveGList(resp.data), () => {setters.setGLoad(false)})
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
    <div class='title'>1856 Accountant { settingsButton(props) }</div>
    <div class="chooser">
      {displayPills(gameList, "", (x) => selectGame(props, x.name), (x)=>x.name, () => false, HORIZONTAL)}
      {props.admin ? imageButton(startAddingGame, add, "add") : <span/> }
    </div>
  </div>
}

export function XXPanel(props) {
  const [gName, setGName] = useState(null);
  const [gList, setGList] = useState(null);
  const [gLoad, setGLoad] = useState(false);

  setters.setGName = setGName;
  setters.setGList = setGList;
  setters.setGLoad = setGLoad;

  if (isVoid(gName)) {
    return GameChooser(props, gList, gLoad);
  }
  return <div>Game is {gName}</div>;
}
