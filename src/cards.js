import React, {useState} from 'react';
import './cards.css';
import {isVoid, displayPills, VERTICAL} from './util.js';

const NO_GAME = 0;
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

export function CardPanel(props) {
  const [cardSwitch, setCardSwitch] = useState(NO_GAME);
  const [selection, setSelection] = useState(null);
  const [tableau, setTableau] = useState(null);

  setters.setCardSwitch = setCardSwitch;
  setters.setSelection = setSelection;
  setters.setTableau = setTableau;

  if(cardSwitch === NO_GAME) {
    if(isVoid(selection)) return <div>
      <div>Nothing is selected</div>
      <div>{displayPills(MENU_LIST, null, x=>selectMenuItem(x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
    return <div>
      <div>{selection.name} is selected</div>
    </div>
  }
}