import React, {useState, useEffect} from 'react';
import { displayPills, HORIZONTAL, VERTICAL, isVoid, isBlank,
         imageButton, smallImageButton, bigImageButton,
         settingsButton, onEnter } from '../util.js';
import './xx1856.css';
import { Auction } from './xxAuction.js';
import { Seater } from './xxSeater.js';
import { StockPanel, StockTable } from './stock.js';
import {OperationPanel, CorpTable, showTrainMarket} from './op.js';
import {svgCert} from './certs.js';
import {MarketTable} from './market.js';

import add from '../icon/add.svg';
import check from '../icon/check.svg';
import cancel from '../icon/cancel.svg';
import ff from '../icon/ff.svg';
import left from '../icon/left.svg';
import right from '../icon/right.svg';

const URLH = 'http://10.0.0.143:32109/18xx/';

const setters = {};
const net = {};
const net2 = {};
const bnet = {};
const bnet2 = {};
const gameNameHolder = {};

function tick(props) {
  if(props.admin) return;
  loadBoard(props)
}

function put(net, cmd, pkg, f, ff) {
  var t = (resp) => receiveBoard(resp.data)
  if(!isVoid(f)) t = f
    net.axios.put(URLH+cmd, pkg).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff()
      if(error.response) {
        net.setBanner("Error: "+error.response.data);
      } else {
        net.setBanner("Client Error: "+error);
      }
    }
  );
}

function get(net, cmd, f, ff) {
  var t = (resp) => receiveBoard(resp.data);
  if(!isVoid(f)) t = f
    net.axios.get(URLH+cmd).then(t).catch(
    (error) => {
      if (!isVoid(ff)) ff();
      if(error.response) {
        net.setBanner("error: "+error.response.data);
      } else {
        net.setBanner("Client Error: "+error);
      }
    }
  );
}

function loadBoard(props) {
  if(isVoid(gameNameHolder.name)) return
  net.get(net, "board/"+gameNameHolder.name)
}

const phase2display = {
  GATHER: "Enter Names",
  AUCTION: "Auction",
  INITIAL: "Stock 1",
  STOCK: "Stock",
  OP: "Operating",
  DONE: "Game Over"
}

function displayRound(board) {
  if(board.phase === 'OP') {
    return "OP "+board.generation+" ("+board.thisOR+"/"+board.maxOR+")";
  }
  if (board.phase === 'STOCK') return "Stock "+board.generation;
  return phase2display[board.phase];
}

function selectGame(props, name, newScale, newBScale) {
  setters.setScale(newScale)
  setters.setBScale(newBScale)
  gameNameHolder.name = name
  net.get(net, "board/"+name)
}

function startAddingGame() {
  setters.setAddingGame(true);
}

function receiveGList(data) {
  setters.setGList(data)
  setters.setGLoad(false);
}

function receiveBoard(data) {
  setters.setBoard(data);
}

function receiveNewBoard(data) {
  setters.setAddingGame(false);
  setters.setGList(null);
  setters.setBoard(data);
}

function loadGList(props) {
  setters.setGLoad(true);
  net.get(net, "list", r => receiveGList(r.data), () => {setters.setGLoad(false)})
}

function createGame(props, gameName) {
  net.put(net, "create/"+gameName, "", r => receiveNewBoard(r.data), () => {setters.setAddingGame(false)})
}

function GameAdder(props, newGameName) {
  return <div>
    <div class='title'>1856 Clerk { settingsButton(props) }</div>
    <div>
      Game Name:
      <input type="text" value={newGameName}
             onChange={(e)=>setters.setNewGameName(e.target.value)}
             onKeyDown={(e) => onEnter(e.key, () => createGame(props, newGameName)) } />
    </div>
    <div>
      {imageButton(() => createGame(props, newGameName), check, "ok")}
      {imageButton(cancelAddGame, cancel, "cancel")}
    </div>
  </div>;
}

const STOCK_SAMPLE = {
}

function GameChooser(props, gameList, loading, newScale, scale, newBScale, BScale) {
  if (isVoid(gameList)) {
    if (loading) {
      return <div>Loading in progress {loading?"true":"false"}</div>;
    } else {
      loadGList(props);
      return <div>failing to load</div>;
    }
  }
  var fsh = net.pt(22)
  var bfsh = bnet.pt(22)
  var ss = {}
  ss['background'] = 'lightblue';
  return <div>
    <div class='title'>1856 Clerk { settingsButton(props) }</div>
    <div class="chooser">
      {displayPills(gameList, "", (x) => selectGame(props, x.name, newScale, newBScale), (x)=>x.name, () => false, HORIZONTAL)}
      {props.admin ? imageButton(startAddingGame, add, "add") : <span/> }
    </div>
    <div class="asker-title">
      Top Scale:
      <input class="asker-value" type="text" value={newScale} size='3'
             onChange={(e)=>setters.setNewScale(e.target.value)}
             onKeyDown={(e)=>onEnter(e.key, () => setters.setScale(newScale)) } />
    </div>
    <div>
      <table>
        <tr style={ss}>
          <th style={fsh}>{svgCert(net.ht(30), 'S', 'black', 2, 'black', 'lightpink')}</th>
          <th style={fsh}>888</th>
          <th style={fsh}>{svgCert(net.ht(30), 'S', 'black', 2, 'black', 'lightpink')}</th>
          <th style={fsh}>888</th>
          <th>{svgCert(net.ht(30), 'S', 'black', 2, 'black', 'lightpink')}</th>
          <th class="pad5" style={fsh}>Sample 1</th>
          <th class="pad5" style={fsh}>
            <img src={ff} class="priority-arrow" alt="priority-marker"/>Sample2
          </th>
          <th class="pad5" style={fsh}>Sample 3</th>
          <th class="pad5" style={fsh}>Sample 4</th>
          <th class="pad5" style={fsh}>Sample 5</th>
          <th class="pad5" style={fsh}>Sample 6</th>
        </tr>
      </table>
    </div>
    <div class="asker-title">
      Bottom Scale:
      <input class="asker-value" type="text" value={newBScale} size='3'
             onChange={(e)=>setters.setNewBScale(e.target.value)}
             onKeyDown={(e)=>onEnter(e.key, () => setters.setBScale(newBScale)) } />
    </div>
    <div>
      <table>
        <tr style={ss}>
          <th style={bfsh}>{svgCert(net.ht(30), 'S', 'black', 2, 'black', 'lightpink')}</th>
          <th style={bfsh}>PREZ</th><th style={bfsh}>CASH</th>
          <th style={bfsh}>TOKEN</th><th style={bfsh}>RUN</th>
          <th style={bfsh}>PRICE</th>
          <th style={bfsh}>LOANS</th><th style={bfsh}>TRAINS</th>
          <th style={bfsh}>RIGHTS</th><th style={bfsh}>IPO TYPE</th>
        </tr>
      </table>
    </div>
  </div>
}


function cancelAddGame() {
  setters.setAddingGame(false);
}

function undo(props, name) {
  net.put(net, "undo/"+name)
}

function redo(props, name) {
  net.put(net, "redo/"+name)
}

function redoAll(props, name) {
  net.put(net, "redoAll/"+name)
}

function moveNumberText(board) {
  if(board.undoCount > 0) return (board.moveNumber-board.undoCount)+"/"+board.moveNumber;
  return board.moveNumber
}

function detachBoard() {
  setters.setBoard(null)
  gameNameHolder.name = null;
}

function GameHeader(props, board) {
  return <div class="unbar">
      <span>
        {smallImageButton(() => undo(props, board.name), left, "undo")}
        Move {moveNumberText(board)}
        {smallImageButton(() => redo(props, board.name), right, "redo")}
        {smallImageButton(() => redoAll(props, board.name), ff, "redoAll")}
      </span>
      <span>{board.name}{smallImageButton(detachBoard, cancel, "cancel")}</span>
      <span>{displayRound(board)}</span>
  </div>
}

function makeFontStyle(sz, f) {
  var out = {}
  out["font-size"] = f(sz)+'pt';
  return out;
}

export function XXPanel(props) {
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [gList, setGList] = useState(null);
  const [gLoad, setGLoad] = useState(false);
  const [addingGame, setAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [scale, setScale] = useState(100);
  const [newScale, setNewScale] = useState(100);
  const [bScale, setBScale] = useState(100);
  const [newBScale, setNewBScale] = useState(100);

  setters.setGameName = setGameName
  setters.setBoard = setBoard;
  setters.setGList = setGList;
  setters.setGLoad = setGLoad;
  setters.setAddingGame = setAddingGame;
  setters.setNewGameName = setNewGameName;
  setters.setScale = setScale;
  setters.setNewScale = setNewScale;
  setters.setBScale = setBScale;
  setters.setNewBScale = setNewBScale;

  net.axios = props.axios;
  net.put = (x,y,z,a,b)=> {if (props.admin) {put(x,y,z,a,b);}}
  net.get = get;
  net.setBanner = props.setters.setBanner;
  net.admin = props.admin;
  net.ht = x=>scale*x/100;
  net.pt = x=>makeFontStyle(x, y=>y*scale/100)

  net2.axios = props.axios;
  net2.put = ()=>{};
  net2.get = get;
  net2.setBanner = props.setters.setBanner;
  net2.admin = false;
  net2.ht = x=>scale*x/100;
  net2.pt = x=>makeFontStyle(x, y=>y*scale/100)

  bnet.axios = props.axios;
  bnet.put = (x,y,z,a,b)=> {if (props.admin) {put(x,y,z,a,b);}}
  bnet.get = get;
  bnet.setBanner = props.setters.setBanner;
  bnet.admin = props.admin;
  bnet.ht = x=>bScale*x/100;
  bnet.pt = x=>makeFontStyle(x, y=>y*bScale/100)

  bnet2.axios = props.axios;
  bnet2.put = ()=>{};
  bnet2.get = get;
  bnet2.setBanner = props.setters.setBanner;
  bnet2.admin = false;
  bnet2.ht = x=>bScale*x/100;
  bnet2.pt = x=>makeFontStyle(x, y=>y*bScale/100)

  useEffect(() => {
    const handle = setInterval(() => tick(props), 1000);
    return () => clearInterval(handle);
  }, []);

  if (addingGame) { return GameAdder(props, newGameName); }
  if (isVoid(board)) { return GameChooser(props, gList, gLoad, newScale, scale, newBScale, bScale); }
  if (board.phase === 'GATHER') return <div>
    <div>{GameHeader(props, board)}</div>
    <Seater net={net} board={board} />
  </div>
  if (board.phase === 'AUCTION') return <div>
    <div>{GameHeader(props, board)}</div>
    <Auction net={net} board={board} />
  </div>
  if (board.phase === 'STOCK' || board.phase === 'INITIAL') return <div>
    <div>{GameHeader(props, board)}</div>
    <div><StockPanel net={net} board={board} /></div>
    <div><CorpTable net={bnet2} board={board} /></div>
    <div>{showTrainMarket(board, net.ht(25))}</div>
    <div><MarketTable board={board} net={bnet2} /></div>
  </div>
  if (board.phase === 'OP') return <div>
    <div>{GameHeader(props, board)}</div>
    <OperationPanel live={true} net={bnet} board={board} />
    <div>{<StockTable net={net2} board={board} />}</div>
    <div>{showTrainMarket(board, net.ht(25))}</div>
    <div><MarketTable board={board} net={bnet2} /></div>
  </div>
  if (board.phase === 'DONE') return <div>
    <div>{GameHeader(props, board)}</div>
    <div><StockTable net={net2} board={board} /></div>
    <div><CorpTable net={bnet2} board={board} /></div>
  </div>
  return <div>
    <div>{GameHeader(props, board)}</div>
    <div>Unknown game state {JSON.stringify(board)}</div>
  </div>
}
