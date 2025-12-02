import React, {useState} from 'react';
import './cards.css';
import {isVoid, displayPills, VERTICAL, smallImageButton} from './util.js';

import cancel from './icon/cancel.svg';

const NO_GAME = 0;
const GAME_PENDING = 1;
const GAME_ON = 2;
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
  var t = (resp) => receiveTableau(props, resp.data);
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

function receiveTableau(props, data) {
  setters.setTableau(data)
  setters.setCardSwitch(GAME_ON)
}

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

function displayPlacement(placement) {
  //TODO unfake displayPlacement -- currently shows only one card of group
  return svgCard(placement.deck[0], placement.x, placement.y)
}

function svgCard(card, x, y) {
  var suit = Math.floor(card.id/13)%4;
  var rank = rankChar(card.id)
  var box="M "+x+" "+y+" l 40 0 0 55 -40 0 0 -55"
  return [
    <path d={box} fill="white" x={x} y={y} />,
    <text font-size="15px" fill="black" x={2+x} y={15+y}>{rank}</text>,
    <text font-size="15px" fill="black" x={28+x} y={51+y}>{rank}</text>,
    <text font-size="20px" fill={suitColor(suit)} x={x+12.5} y={y+35}>{SUITS[suit]}</text>
  ]
}

function displayTableau(props, tableau) {
  return <svg height='500px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" fill='lightgreen'><g>
    <rect x='0' y = '0' width='800' height='500' />
    {tableau.placements.flatMap(x=>displayPlacement(x))}
  </g></svg>
}

const SUITS = ["♣", "♦", "♥", "♠"]

function suitChar(suit) {
  return SUITS[suit]
}

function suitColor(suit) {
  switch(suit) {
    case 0: return 'green';
    case 1: return 'blue';
    case 2: return 'red';
    case 3: return 'black';
  }
}

function rankChar(card) {
  var rank = card%13
  switch(rank) {
    case 0: return 'A';
    case 9: return 'T';
    case 10: return 'J';
    case 11: return 'Q';
    case 12: return 'K';
    default: return (rank+1);
  }
}

function drawCard(card, x, y) {
  var suit = Math.floor(card/13)%4;
  var rank = rankChar(card)
  return <svg height='500px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill='lightgreen'><g>
    <rect x='0' y = '0' width='800' height='500' />
    <path d="M 5 5 l 40 0 0 55 -40 0 0 -55" fill='white' />
    <text font-size="15px" fill="black" x='7' y='20'>{rank}</text>
    <text font-size="15px" fill="black" x='33' y='56'>{rank}</text>
    <text font-size="20px" fill={suitColor(suit)} x='17.5' y='40'>{SUITS[suit]}</text>
  </g></svg>
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
      <div class="card-title">Solitaire -- Choose a Game</div>
      <div>{displayPills(MENU_LIST, null, x=>selectMenuItem(props, x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
    return <div>
      <div class="card-title">Solitaire -- Choose a Game</div>
      <div class="card-subtitle">{selection.name}</div>
      <div>{displayPills(ADDITION_MENU, null, x=>selectSubMenu(props, selection, x), x=>x.name, ()=>false, VERTICAL)}</div>
    </div>
  }
  if(cardSwitch === GAME_PENDING) {
    return <div>
      <div class="card-title">Solitaire -- Game Starting</div>
      <div class="card-subtitle">{displayName} {smallImageButton(x=>clearSelection(props), cancel, "cancel")}</div>
      <div>Waiting for game to start</div>
    </div>
  }
  if(cardSwitch === GAME_ON) {
    return <div>
      <div class="card-title">Solitaire</div>
      <div class="card-subtitle">{displayName} {smallImageButton(x=>clearSelection(props), cancel, "cancel")}</div>
      {displayTableau(props, tableau)}
    </div>
  }
  return <div>TODO start game</div>
}