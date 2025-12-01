import React, {useState} from 'react';
import './cards.css';
import {isVoid, displayPills, VERTICAL} from './util.js';

const NO_GAME = 0;
const GAME_PENDING = 1;
const setters = {};

const ADDITION_MENU = [
  {name: 'thirteens'},
  {name: 'TODO'}
]

const MENU_LIST = [
  {name: 'simple additon ==>', sub:ADDITION_MENU},
  {name: 'TODO'}
];

function selectMenuItem(x) {
  setters.setSelection(x)
}

function selectSubMenu(x) {
  setters.setSubSel(x)
  setters.setCardSwitch(GAME_PENDING);
  //TODO
}

function header(name) {
  if(isVoid(name)) return <div class="card-title">Solitaire -- Choose a Game</div>
  return <div class="card-title">Solitaire -- { name.name }</div>
}

export function CardPanel(props) {
  const [cardSwitch, setCardSwitch] = useState(NO_GAME);
  const [selection, setSelection] = useState(null);
  const [subSel, setSubSel] = useState(null);
  const [tableau, setTableau] = useState(null);

  setters.setCardSwitch = setCardSwitch;
  setters.setSelection = setSelection;
  setters.setSubSel = setSubSel;
  setters.setTableau = setTableau;

  if(cardSwitch === NO_GAME) {
    if(isVoid(selection)) return <div>
      {header()}
      <div>{displayPills(MENU_LIST, null, x=>selectMenuItem(x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
    return <div>
      {header(null)}
      <div class="card-subtitle">{selection.name}</div>
      <div>{displayPills(ADDITION_MENU, null, x=>selectSubMenu(x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
  }
  return <div>TODO start game</div>
}