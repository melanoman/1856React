import React from 'react';
import './chat.css';
import {imageButton} from "./util.js";
import send from './icon/send.svg';

function isVoid(x) {
  return x === null || x === undefined;
}

function chatText() {
  return (<div class="vc">TODO load text for chat</div>);
}

export default function ChatPanel(props) {
  if (isVoid(props.chat)) {
    return;
  }
  return <div class="chat-top">
    <div class="title">Chat channel is {props.chat}</div>
    {chatText()}
    <div class="vc">
      <input class="wide" type="text" onChange={() => props.setters.setChatText()} />
      {imageButton(() => alert("TODO send chat text"), send, "send")}
    </div>
  </div>
}