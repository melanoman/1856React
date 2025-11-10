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
import { imageButton, VERTICAL, displayPills, settingsButton, isVoid } from './util.js';
import ChatPanel, {ChatChooser} from './chat.js';
import { RPSPanel } from './RPS.js';
import { TrainPanel, showOpOrder } from './train.js';

const CHAT_TAB = 1;
const DICE_TAB = 2;
const RPS_TAB = 3;
const PASS_TAB = 4;
const TRAIN_TAB = 5;
const GUEST_PANEL = 6;
const CAL_SWITCH = -10;

const BIG_MEDIA = 'big'
const PHONE_MEDIA = 'small'
const LAPTOP_MEDIA = 'big'
const TABLET_MEDIA = 'med'

function setMainOrLogin(user, setHide, setMainSwitch, val, e) {
  if(e.shiftKey) setHide(true);
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

function pickPhone(props) {
  props.setters.setMainSwitch(TRAIN_TAB)
  props.setters.setDevice(PHONE_MEDIA)
  props.setters.setUser('^_^'); //guest
  props.setters.setHideTop(true)
  props.setters.setHideChat(true)
  props.setters.setHideSide(true)
}

function pickTablet(props) {
  props.setters.setMainSwitch(CAL_SWITCH)
  props.setters.setDevice(TABLET_MEDIA)
  props.setters.setUser('^_^'); //guest
  props.setters.setHideTop(true)
  props.setters.setHideChat(true)
  props.setters.setHideSide(true)
}

function pickLaptop(props) {
  props.setters.setMainSwitch(TRAIN_TAB)
  props.setters.setDevice(BIG_MEDIA)
  props.setters.setUser('^_^'); //guest
  props.setters.setHideTop(true)
  props.setters.setHideChat(true)
  props.setters.setHideSide(true)
}

function pickAdmin(props) {
  props.setters.setMainSwitch(-1)
  props.setters.setDevice(BIG_MEDIA)
  props.setters.setHideTop(false)
  props.setters.setHideChat(false)
  props.setters.setHideSide(false)
}

const TEXT_DEVICE = 'text'
const GRAPHIC_DEVICE = 'icons'
const EDIT_DEVICE = 'editor'
const GUEST_LIST = [TEXT_DEVICE, GRAPHIC_DEVICE, EDIT_DEVICE, 'admin']

function pickPortal(x, props) {
  switch(x) {
    case TEXT_DEVICE: pickPhone(props); break;
    case GRAPHIC_DEVICE: pickTablet(props); break;
    case EDIT_DEVICE: pickLaptop(props); break;
    case 'admin': pickAdmin(props); break;
  }
}

function guestScreen(props) {
  return displayPills(GUEST_LIST, null, (x) => pickPortal(x, props), (x) => x, () => false, VERTICAL)
}

function MainWindow(props) {
  switch(props.mainSwitch) {
    case CAL_SWITCH: return calibrate1856(props)
    case -1: return <LoginPanel axios={props.axios} setters={props.setters}
                                login={props.loginName} pass={props.password} />
    case -2: return <AccountPanel axios={props.axios} setters={props.setters} user={props.user} />
    case -3: return guestScreen(props)
    case CHAT_TAB: return <ChatChooser admin={props.admin} setters={props.setters} axios={props.axios}
                                       chat={props.chat} chatList={props.chatList} />
    case RPS_TAB:  return <RPSPanel axios={props.axios} setters={props.setters} user = {props.user} />
    case DICE_TAB:  return (<div>
      <div class="sec-title">Dice Rolling Tool</div>
      <DicePanel axios={props.axios} display={props.rollDisplay}
                 fiddle={(x) => props.sw(props.setters.setRollDisplay, props.rollDisplay, x)}
                 custom={props.custom} setCustom={props.setters.setCustom} />
    </div>);
    case PASS_TAB: return <PassPanel axios={axios} display={props.rollDisplay} admin={props.admin}
                                     setters={props.setters} tweak={props.tweak} />
    case TRAIN_TAB: return <div>
      <TrainPanel axios={axios} setters={props.setters} admin = {props.admin}
                  device={props.device} opScale1856={props.opScale1856}
      />
    </div>
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

function showSidebar(hide, setHide, user, setMainSwitch) {
  if (hide) return
  return <div className="App-sidebar">
     <div onClick={(e) => setMainOrLogin(user, setHide, setMainSwitch, CHAT_TAB, e)}>
       <img src={chatIcon} className="home-button" alt="ChatTool" />
     </div>
     <div onClick={(e) => setMainOrLogin(user, setHide, setMainSwitch, DICE_TAB, e)}>
        <img src={die} className="icon-button" alt="DiceTool" />
     </div>
     <div onClick={(e) => setMainOrLogin(user, setHide, setMainSwitch, RPS_TAB, e)}>
        <img src={rpsIcon} className="icon-button" alt="Roshambo" />
     </div>
     <div onClick={(e) => setMainOrLogin(user, setHide, setMainSwitch, PASS_TAB, e)}>
       <img src={racecar} className="icon-button" alt="Season Pass" />
     </div>
     <div onClick={(e) => setMainOrLogin(user, setHide, setMainSwitch, TRAIN_TAB, e)}>
       <img src={train} className="home-button" alt="1856 Accountant" />
     </div>
  </div>
}

function header(hide, user, setters) {
  if(hide) return
  return <div className="App-header" onClick={() => setHomeOrLogout(user, setters.setMainSwitch)}>
    <ul className="App-list">
      <li className="App-center"><img src={logo} className="App-logo" alt="logo" /></li>
      <li>Game Tools</li>
      <li><img src={logo} className="App-logo" alt="logo" /></li>
      {loginDisplay(user)}
    </ul>
  </div>
}

const CALIBRATION_BOARD = {
  phase:"OP",
  corps:[{
    name: "BBG",
    par: 100,
    bankShares: 5,
    price: { price: 125, x: 5, y: 5 },
    cash: 8888,
    escrow: 888,
    tokensMax: 3,
    tokensUsed: 1,
    prez: "LongName",
    fundingType: 0,
    loans: 0,
    lastRun: 8888,
    privates: [],
    trains:[2,2,2,2],
    portRights:true,
    bridgeRights:true,
    tunnelRights:true,
    hasOperated:true,
    hasFloated:true,
    reachedDest:false,
    closing:false
  }]
}

function doCalibrate(props) {
  var thing = document.getElementById("OP_TABLE")
  var have = window.screen.width
  var need = window.innerWidth
  if (need > have) { props.setters.setOpScale1856(have/need) }
  props.setters.setMainSwitch(TRAIN_TAB)
}

function calibrate1856(props) {
  return <div>
    <div>calibrating sizes (hit the plus button)</div>
    <div>{showOpOrder(props, CALIBRATION_BOARD, "whatever")}</div>
    <div>{imageButton(() => doCalibrate(props), add, "calibrate")}</div>
  </div>
}

function App() {
  const [tweak, setTweak] = useState(0);

  const [user, setUser] = useState(null);
  const [banner, setBanner] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [hideSide, setHideSide] = useState(true);
  const [hideChat, setHideChat] = useState(true);
  const [hideTop, setHideTop] = useState(true);
  const [device, setDevice] = useState(BIG_MEDIA);

  const [chat, setChat] = useState("public");
  const [chatList, setChatList] = useState(null);
  const [chatText, setChatText] = useState(null);

  const [custom, setCustom] = useState(1);
  const [mainSwitch, setMainSwitch] = useState(-3);
  const [rollDisplay, setRollDisplay] = useState(['']);
  const [loginName, setLoginName] = useState(['']);
  const [password, setPassword] = useState(['']);
  const [addr, setAddr] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const [opScale1856, setOpScale1856] = useState(1);


  const setters = {
    setTweak: setTweak,

    setUser: setUser,
    setAdmin: setAdmin,
    setBanner: setBanner,
    setCustom: setCustom,
    setMainSwitch: setMainSwitch,
    setHideSide: setHideSide,
    setHideChat: setHideChat,
    setHideTop: setHideTop,
    setDevice: setDevice,

    setChat: setChat,
    setChatList: setChatList,
    setChatText: setChatText,

    setLoginName: setLoginName,
    setPassword: setPassword,
    setAddr: setAddr,
    setUserDisplay: setUserDisplay,
    setRollDisplay: setRollDisplay,

    setOpScale1856: setOpScale1856,
  };

  return (
    <div>
        {header(hideTop, user, setters)}
        <div className="App-sidesplit">
            {showSidebar(hideSide, setHideSide, user, setMainSwitch)}
            <div className="vertical">
              {showBanner(banner, setBanner)}
              <div className="App-main">
                <MainWindow tweak={tweak} axios={axios} setters={setters} admin={admin}
                            loginName={loginName} password={password}
                            chat={chat} chatList={chatList} chatText={chatText}
                            mainSwitch={mainSwitch} rollDisplay={rollDisplay} sw={appendOrClear}
                            custom={custom} user={user} device={device}
                            opScale1856={opScale1856}
                />
              </div>
            </div>
        </div>
        <div>
          <ChatPanel hide={hideChat} setters={setters} axios={axios} user={user} admin={admin} chat={chat} chatText={chatText} />
        </div>
    </div>
  );
}

export default App;
