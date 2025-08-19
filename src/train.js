import React, {useState} from 'react';
import { displayPills, HORIZONTAL, isVoid } from './util.js';
import './train.css'

const setters = {}
const URLH = 'http://10.0.0.143:32109/1856/';

var loadingList = false;

function receiveList(list) {
  setters.setGameList(list);
  loadingList = false;
}

function loadGameList(props) {
  loadingList = true;
  props.axios.get(URLH+"list").then((resp) => receiveList(resp.data)).catch(
    (error) => {
      loadingList = false;
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function selectGame(name) {
  setters.setGameName(name);
}

function GameChooser(props, gameList) {
  if (isVoid(gameList)) {
    if (loadingList) {
      return "Loading in progress";
    } else {
      loadGameList(props);
      return;
    }
  }
  return displayPills(gameList, "", (x) => selectGame(x.name), (x)=>x.name, () => false, HORIZONTAL);
}

export function TrainPanel(props) {
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameList, setGameList] = useState(null);

  setters.setGameName = setGameName;
  setters.setBoard = setBoard;
  setters.setGameList = setGameList;

  if (isVoid(gameName)) {
    return GameChooser(props, gameList);
  }
  return <div>The game chosen is {gameName}</div>
}