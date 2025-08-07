import React, {useState} from 'react';
import './chat.css';
import {imageButton, displayPills, settingsButton, onEnter } from "./util.js";
import add from './icon/add.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import nuke from './icon/delete.svg';
import send from './icon/send.svg';

const URLH = 'http://10.0.0.143:32109/';
const PLAIN_TEXT = {headers: {"Content-Type": "text/plain"}};

function isVoid(x) {
  return x === null || x === undefined;
}

function receiveNewChat(props, response) {
  props.setters.setChat(response.data);
}

function addChatTable(props, newChatName, setAddingChat) {
  setAddingChat(false);
  props.setters.setChatList(null);
  props.axios.put(URLH+'table/create/'+newChatName+'/chat'
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

function receiveChatList(props, response, setLoadingList) {
  props.setters.setChatList(response.data.map((gt) => gt.name));
  setLoadingList(false);
}

function loadList(props, setLoadingList) {
  props.setters.setChatList([]);
  props.axios.get(URLH+'tables/chat'
  ).then((response) => receiveChatList(props, response, setLoadingList)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error asking for chat list"+error.message);
      } else {
        props.setters.setBanner("no chatList response!");
      }
    }
  );
}

function chatList(props, loadingList, setLoadingList) {
  if (props.chatList === undefined || props.chatList === null) {
    if (loadingList) {
      return [];
    } else {
      setLoadingList(true);
      loadList(props, setLoadingList);
      return [];
    }
  }
  return props.chatList;
}

function selChat(sel, props) {
  props.setters.setChat(sel);
}

export function ChatChooser(props) {
  const [addingChat, setAddingChat] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  if(addingChat) {
    return <div>
      <div class="title">Add Chat Channel {settingsButton(props)}</div>
      <div>Name: <input type="text" onChange={(e) => setNewChatName(e.target.value)} /></div>
      <div>
        {imageButton(() => addChatTable(props, newChatName, setAddingChat), check, "ok")}
        {imageButton(() => setAddingChat(false), cancel, "cancel")}
      </div>
    </div>
  } else if(props.admin) {
    return (<div>
      <div class="title">Select Chat Channel {settingsButton(props)}</div>
      <div class="sec-fill">
        {displayPills(chatList(props, loadingList, setLoadingList),
           props.chat, (sel) => selChat(sel, props), (sel) => sel, (x,y) => x === y, null, 0)}
        {imageButton(() => setAddingChat(true), add, "Add Chat")}
      </div>
    </div>);
  } else {
    return (<div>
      <div class="title">Select Chat Channel {settingsButton(props)}</div>
      <div class="sec-fill">
        {displayPills(chatList(props, loadingList, setLoadingList),
                      props.chat, (sel) => selChat(sel, props), (sel) => sel, (x,y) => x === y, null, 0)}
      </div>
    </div>);
  }
}

function chatHeader(props) {
  return (<div>
    <div class="subtitle">
      Chat channel is {props.chat}
    </div>
  </div>);
}

function receiveChatMessageNumber(props, response, setChatText) {
  setChatText(null);
}

function sendChatText(props, outChat, setChatText, setOutChat) {
  props.axios.put(URLH+'message/send/'+props.chat+'/'+props.user, outChat, PLAIN_TEXT
  ).then((response) => receiveChatMessageNumber(props, response, setChatText)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error sending chat text "+error.message);
      } else {
        props.setters.setBanner("no sendText response!");
      }
    }
  );
  setOutChat("");
}

function transformMessages(setChatText, setLoadingChat, msgs) {
  setChatText(msgs.reverse().map((m) => <div>[{m.author}] {m.text}</div>));
  setLoadingChat(false);
}

function loadChat(props, setChatText, setLoadingChat) {
  setLoadingChat(true);
  props.axios.get(URLH+'message/get/'+props.chat+'/10'
  ).then((response) => transformMessages(setChatText, setLoadingChat, response.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("Error sending chat text "+error.message);
      } else {
        props.setters.setBanner("no sendText response!");
        setLoadingChat(false);
      }
    }
  );
}

function showChatText(props, chatText, setChatText, loadingChat, setLoadingChat) {
  if(isVoid(chatText)) {
    if (!loadingChat) {
      setLoadingChat(true);
      loadChat(props, setChatText, setLoadingChat);
    }
    return <div class="vc" ignore={chatText} >Totally Loading</div>
  }
  return <div class="vert">{chatText}</div>
}

export default function ChatPanel(props) {
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatText, setChatText] = useState(null);
  const [outChat, setOutChat] = useState("");
  if (isVoid(props.user) || isVoid(props.chat)) {
    return <div />;
  }

  return <div class="chat-top">
    {chatHeader(props)}
    {showChatText(props, chatText, setChatText, loadingChat, setLoadingChat)}
    <div class="vc">
      <input class="wide" type="text" value={outChat}
             onKeyDown={((e) => onEnter(e.key, () => sendChatText(props, outChat, setChatText, setOutChat)))}
             onChange={(e) => setOutChat(e.target.value)} />
      {imageButton(() => sendChatText(props, outChat, setChatText, setOutChat), send, "send")}
    </div>
  </div>
}