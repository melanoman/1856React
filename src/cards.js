import React, {useState} from 'react';
import './cards.css';
import {isVoid, displayPills, VERTICAL, smallImageButton} from './util.js';

import cancel from './icon/cancel.svg';

const NO_GAME = 0;
const GAME_PENDING = 1;
const setters = {};

const URLH = 'http://10.0.0.143:32109/cards/';


const ADDITION_MENU = [
  {name: 'thirteens'},
  {name: 'TODO'}
]

const MENU_LIST = [
  {name: 'simple additon ==>', sub:ADDITION_MENU},
  {name: 'TODO'}
];

function put(props, cmd, pkg, f, ff) {
  var t = (resp) => receiveTableau(resp.data);
  if(!isVoid(f)) t = f
  props.axios.put(URLH+cmd, pkg).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff()
      if(error.response) {
        props.setters.setBanner("Error: "+error.response.data);
      } else {
        props.setters.setBanner("no server put response!");
      }
    }
  );
}

function get(props, cmd, f, ff) {
  var t = (resp) => receiveTableau(resp.data);
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

function selectMenuItem(props, x) {
  setters.setSelection(x)
  if(isVoid(x.sub)) {
    setters.setCardSwitch(GAME_PENDING)
    setters.setDisplayName(x.name)
    startGame(props, x.name)
  }
}

function selectSubMenu(props, selection, x) {
  var gameName = selection.name+x.name
  setters.setSubSel(x)
  setters.setCardSwitch(GAME_PENDING);
  setters.setDisplayName(gameName)
  startGame(props, gameName)
}

function startGame(props, gameName) {
  put(props, "new/"+gameName, "");
}

function receiveTableau(props) { }

function header(name) {
  if(isVoid(name)) return <div class="card-title">Solitaire -- Choose a Game</div>
  return <div class="card-title">Solitaire -- { name.name }</div>
}

function clearSelection(props) {
  //TODO cancel game at server
  setters.setSelection(null);
  setters.setCardSwitch(NO_GAME);
  setters.setSubSel(null);
}

export function CardPanel(props) {
  const [cardSwitch, setCardSwitch] = useState(NO_GAME);
  const [selection, setSelection] = useState(null);
  const [subSel, setSubSel] = useState(null);
  const [tableau, setTableau] = useState(null);
  const [displayName, setDisplayName] = useState(null);

  setters.setCardSwitch = setCardSwitch;
  setters.setSelection = setSelection;
  setters.setSubSel = setSubSel;
  setters.setTableau = setTableau;
  setters.setDisplayName = setDisplayName;

  if(cardSwitch === NO_GAME) {
    if(isVoid(selection)) return <div>
      {header()}
      <div>{displayPills(MENU_LIST, null, x=>selectMenuItem(props, x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
    return <div>
      {header(null)}
      <div class="card-subtitle">{selection.name}</div>
      <div>{displayPills(ADDITION_MENU, null, x=>selectSubMenu(props, selection, x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
  }
  if(cardSwitch === GAME_PENDING) {
    return <div>
      {header()}
      <div class="card-subtitle">{displayName} {smallImageButton(x=>clearSelection(props), cancel, "cancel")}</div>
      <div>Waiting for game to start</div>
    </div>
  }
  return <div>TODO start game</div>
}