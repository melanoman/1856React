import React, { useState } from 'react';
import axios from 'axios';
import logo from './icon/xlogo.svg';
import die from './icon/die.svg';
import home from './icon/home.svg';
import racecar from './icon/SPlogo.svg';
import add from './icon/add.svg';
import train from './icon/train.svg';
import chatIcon from './icon/chat.svg';
import rpsIcon from './icon/rps_icon.svg';
import './App.css';
import DicePanel from './Dice.js';
import PassPanel from './Pass.js';
import { loginDisplay, LoginPanel, AccountPanel } from './Login.js';
import { imageButton, VERTICAL, displayPills, settingsButton } from './util.js';
import ChatPanel, {ChatChooser} from './chat.js';

const CHAT_TAB = 1;
const DICE_TAB = 2;
const RPS_TAB = 3;
const PASS_TAB = 4;
const TRAIN_TAB = 5;

function setMainOrLogin(user, setMainSwitch, val) {
  if(user === null) {
    setMainSwitch(-1);
  } else {
    setMainSwitch(val);
  }
}

function setHomeOrLogout(user, setMainSwitch) {
  if(user === null) {
    setMainSwitch(-1);
  } else {
    setMainSwitch(-2);
  }
}

function RPSList() {
  //TODO load the actual RPS list
  return ['Able', 'Baker', 'Chuck'];
}

function selRPS(sel) {
  //TODO pop the RPS into the display section
}

function RPSchooser(props) {
  if(props.admin) {
    return (<div class="sec-fill">
      {displayPills(RPSList(), null, (sel) => selRPS(sel), (sel) => sel, (x,y) => x === y, null, 0)}
      {imageButton(() => alert("TODO add RPS"), add, "Add RPS")}
    </div>);
  } else {
    return (<div class="sec-fill">
      {displayPills(RPSList(), null, (sel) => selRPS(sel), (sel) => sel, (x,y) => x === y, null, 0)}
    </div>);
  }
}

function MainWindow(props) {
  switch(props.mainSwitch) {
    case -1: return <LoginPanel axios={props.axios} setters={props.setters}
                                login={props.loginName} pass={props.password} />
    case -2: return <AccountPanel axios={props.axios} setters={props.setters} user={props.user} />
    case CHAT_TAB: return <ChatChooser admin={props.admin} setters={props.setters} axios={props.axios}
                                       chat={props.chat} chatList={props.chatList} />
    case RPS_TAB:  return (
       <div>
         <div class="sec-title">Roshambo (aka Rock-Paper-Scissors)</div>
         {RPSchooser(props)}
       </div>
    );
    case DICE_TAB:  return (<div>
      <div class="sec-title">Dice Rolling Tool</div>
      <DicePanel axios={props.axios} display={props.rollDisplay}
                 fiddle={(x) => props.sw(props.setters.setRollDisplay, props.rollDisplay, x)}
                 custom={props.custom} setCustom={props.setters.setCustom} />
    </div>);
    case PASS_TAB: return <PassPanel axios={axios} display={props.rollDisplay} admin={props.admin}
                                     setters={props.setters} tweak={props.tweak} />
    case TRAIN_TAB: return <div class='sec-title'>1856 Accountant</div>;
    default: return "Undefined panel";
  }
}

function appendOrClear(setter, oldVal, newVal) {
  if(newVal === null) {
    setter(['']);
  } else {
    setter(oldVal+'\n'+newVal);
  }
}

function showBanner(banner, setBanner) {
  if(banner === null) return <div />
  return (<div class="alert">
    <span class="closebtn" onClick={() => setBanner(null)}>&times;</span>
    {banner}
  </div>);
}

function App() {
  const [tweak, setTweak] = useState(0);

  const [user, setUser] = useState(null);
  const [banner, setBanner] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [chat, setChat] = useState("public");
  const [chatList, setChatList] = useState(null);

  const [custom, setCustom] = useState(1);
  const [mainSwitch, setMainSwitch] = useState(-1);
  const [rollDisplay, setRollDisplay] = useState(['']);
  const [loginName, setLoginName] = useState(['']);
  const [password, setPassword] = useState(['']);
  const [addr, setAddr] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const setters = {
    setTweak: setTweak,

    setUser: setUser,
    setAdmin: setAdmin,
    setBanner: setBanner,
    setCustom: setCustom,
    setMainSwitch: setMainSwitch,

    setChat: setChat,
    setChatList: setChatList,

    setLoginName: setLoginName,
    setPassword: setPassword,
    setAddr: setAddr,
    setUserDisplay: setUserDisplay,
    setRollDisplay: setRollDisplay,
  };

  return (
    <div>
        <div className="App-header" onClick={() => setHomeOrLogout(user, setMainSwitch)}>
              <ul className="App-list">
                <li className="App-center"><img src={logo} className="App-logo" alt="logo" /></li>
                <li>Game Tools</li>
                <li><img src={logo} className="App-logo" alt="logo" /></li>
                {loginDisplay(user)}
              </ul>
        </div>
        <div className="App-sidesplit">
            <div className="App-sidebar">
               <div onClick={() => setMainOrLogin(user, setMainSwitch, CHAT_TAB)}>
                 <img src={chatIcon} className="home-button" alt="ChatTool" />
               </div>
               <div onClick={() => setMainOrLogin(user, setMainSwitch, DICE_TAB)}>
                  <img src={die} className="icon-button" alt="DiceTool" />
               </div>
               <div onClick={() => setMainOrLogin(user, setMainSwitch, RPS_TAB)}>
                  <img src={rpsIcon} className="icon-button" alt="Roshambo" />
               </div>
               <div onClick={() => setMainOrLogin(user, setMainSwitch, PASS_TAB)}>
                 <img src={racecar} className="icon-button" alt="Season Pass" />
               </div>
               <div onClick={() => setMainOrLogin(user, setMainSwitch, TRAIN_TAB)}>
                 <img src={train} className="home-button" alt="1856 Accountant" />
               </div>
            </div>
            <div className="vertical">
              {showBanner(banner, setBanner)}
              <div className="App-main">
                <MainWindow tweak={tweak} axios={axios} setters={setters} admin={admin}
                            loginName={loginName} password={password}
                            chat={chat} chatList={chatList}
                            mainSwitch={mainSwitch} rollDisplay={rollDisplay} sw={appendOrClear}
                            custom={custom} user={user}
                />
              </div>
            </div>
        </div>
        <div>
          <ChatPanel setters={setters} axios={axios} user={user} admin={admin} chat={chat} />
        </div>
    </div>
  );
}

export default App;
