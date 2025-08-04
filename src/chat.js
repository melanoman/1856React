import React from 'react';
import './chat.css';
import {imageButton, displayPills, settingsButton, onEnter } from "./util.js";
import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import send from './icon/send.svg';

const URLH = 'http://10.0.0.143:32109/';
const PLAIN_TEXT = {headers: {"Content-Type": "text/plain"}};
var loadingList = false;

function isVoid(x) {
  return x === null || x === undefined;
}

function chatText() {
  return (<div class="vc">TODO load text for chat</div>);
}

function receiveNewChat(props, response) {
  props.setters.setChat(response.data);
}

function addChatTable(props) {
  props.setters.setAddingChat(false);
  props.axios.put(URLH+'table/create/'+props.newChatName+'/chat'
  ).then((response) => receiveNewChat(props, response)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error adding chat table"+error.message);
      } else {
        props.setters.setBanner("no addChat response!");
      }
    }
  );
}

function cancelAdd(props) {
  props.setters.setAddingChat(false);
}

function receiveChatList(props, response) {
  props.setters.setChatList(response.data.map((gt) => gt.name));
  loadingList = false;
}

function loadList(props) {
  props.setters.setChatList([]);
  props.axios.get(URLH+'tables/all'
  ).then((response) => receiveChatList(props, response)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error asking for chat list"+error.message);
      } else {
        props.setters.setBanner("no chatList response!");
      }
    }
  );
}

function chatList(props) {
  if (props.chatList === undefined || props.chatList === null) {
    if (loadingList) {
      return [];
    } else {
      loadingList = true;
      loadList(props);
      return [];
    }
  }
  return props.chatList;
}

function selChat(sel, props) {
  props.setters.setChat(sel);
}

function startAddingChat(props) {
  props.setters.setAddingChat(true);
}

function chatChooser(props) {
  if(props.addingChat) {
    return;
  } else if(props.admin) {
    return (<div class="sec-fill">
      {displayPills(chatList(props), props.chat, (sel) => selChat(sel, props), (sel) => sel, (x,y) => x == y, null, 0)}
      {imageButton(() => startAddingChat(props), add, "Add Chat")}
    </div>);
  } else {
    return (<div class="sec-fill">
      {displayPills(chatList(props), props.chat, (sel) => selChat(sel, props), (sel) => sel, (x,y) => x == y, null, 0)}
    </div>);
  }
}

function chatHeader(props) {
  return (<div>
    <div class="title">
      Chats{settingsButton(props)}
    </div>
    {chatChooser(props)}
  </div>);
}

function receiveChatMessageNumber(props, response) {
  alert("TODO download updates");
}

function sendChatText(props) {
  props.axios.put(URLH+'message/send/'+props.chat, props.outChat, PLAIN_TEXT
  ).then((response) => receiveChatMessageNumber(props, response)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error sending chat text "+error.message);
      } else {
        props.setters.setBanner("no sendText response!");
      }
    }
  );
  props.setters.setOutChat("");
}

export default function ChatPanel(props) {
  if (isVoid(props.user)) return <div />;
  if(props.addingChat) {
    return <div class="chat-top">
      {chatHeader(props)}
      <div>
        TableName:
        <input type="text" onChange={(e) => props.setters.setNewChatName(e.target.value)} />
      </div>
      <div>
        {imageButton(() => addChatTable(props), check, 'ok')}
        {imageButton(() => cancelAdd(props), cancel, 'cancel')}
      </div>
    </div>
  }
  if (isVoid(props.chat)) {
    return (<div class="chat-top">
      {chatHeader(props)}
    </div>);
  }

  return <div class="chat-top">
    {chatHeader(props)}
    <div class="title">Chat channel is {props.chat}</div>
    {chatText()}
    <div class="vc">
      <input class="wide" type="text" value={props.outChat}
             onKeyDown={((e) => onEnter(e.key, () => sendChatText(props)))}
             onChange={(e) => props.setters.setOutChat(e.target.value)} />
      {imageButton(() => sendChatText(props), send, "send")}
    </div>
  </div>
}