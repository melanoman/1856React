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

const CARD_WIDTH = 40;
const CARD_HEIGHT = 55;
const CARD_MARGIN = 10;

function displayPlacement(placement) {
  var out = []
  var gx=0
  var gy=0
  var index=0
  while(gy < placement.gridHeight) {
    while(gx < placement.gridWidth) {
      out = out.concat(svgCard(placement.deck[index],
                               placement.x + gx*(CARD_WIDTH+CARD_MARGIN),
                               placement.y + gy*(CARD_HEIGHT+CARD_MARGIN)))
      index = index + 1
      gx = gx + 1
      if(index>=placement.deck.length) return out;
    }
    gx = 0
    gy = gy + 1
  }
  return out;
}

function svgCard(card, x, y) {
  if(isVoid(card)) return [];
  var suit = Math.floor(card.id/13)%4;
  var rank = rankChar(card.id)
  var box="M "+x+" "+y+" l 40 0 0 55 -40 0 0 -55"
  var bg= card.highlight ? 'lightyellow':'white'
  return [
    <path d={box} fill={bg} x={x} y={y} />,
    <text font-size="15px" fill="black" x={2+x} y={15+y}>{rank}</text>,
    <text font-size="15px" fill="black" x={28+x} y={51+y}>{rank}</text>,
    <text font-size="20px" fill={suitColor(suit)} x={x+12.5} y={y+35}>{SUITS[suit]}</text>
  ]
}


function findGrid(p, x, y) {
  if(x < p.x || y < p.y) return null;
  if((x-p.x) % (CARD_WIDTH+CARD_MARGIN) > CARD_WIDTH) return null;
  if((y-p.y) % (CARD_HEIGHT+CARD_MARGIN) > CARD_HEIGHT) return null;
  var gx = Math.floor((x-p.x) / (CARD_WIDTH+CARD_MARGIN))
  var gy = Math.floor((y-p.y) / (CARD_HEIGHT+CARD_MARGIN))
  if(gx >= p.gridWidth || gy >= p.gridHeight) return null;
  return {id: p.id, x: gx, y: gy, i: gx + gy*p.gridWidth }
}

function tableauClick(props, e, tableau) {
  var i = tableau.placements.length;
  var ex = e.nativeEvent.offsetX;
  var ey = e.nativeEvent.offsetY;
  while(i>0) {
    i = i - 1
    var p = tableau.placements[i];
    var grid = findGrid(p, ex, ey)
    if(!isVoid(grid)) {
      put(props, "select/"+tableau.id+"/"+grid.id+"/"+grid.x+"/"+grid.y, "")
    }
  }
}

function winImage() {
  return <text fill='black' font-size='50pt' x='250' y='250'>YOU WIN!</text>
}

function loseImage() {
  return <text fill='black' font-size='50pt' x='250' y='250'>YOU LOSE!</text>
}

function buildTableauSVG(tableau) {
  var out = tableau.placements.flatMap(x=>displayPlacement(x))
  if (tableau.result === 1) {
      out.push(winImage())
  } else if (tableau.result === -1) {
      out.push(loseImage())
  }
  return out
}

function displayTableau(props, tableau) {
  return <svg height='500px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" fill='lightgreen'
              onClick={(e)=>tableauClick(props, e, tableau)}>
    <g>
      <rect x='0' y = '0' width='800' height='500' />
      {buildTableauSVG(tableau)}
    </g>
  </svg>
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