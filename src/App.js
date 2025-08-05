import React, { useState } from 'react';
import axios from 'axios';
import logo from './icon/xlogo.svg';
import die from './icon/die.svg';
import home from './icon/home.svg';
import racecar from './icon/SPlogo.svg';
import add from './icon/add.svg';
import train from './icon/train.svg';
import './App.css';
import DicePanel from './Dice.js';
import PassPanel from './Pass.js';
import { loginDisplay, LoginPanel, AccountPanel } from './Login.js';
import { imageButton, VERTICAL, displayPills, settingsButton } from './util.js';
import ChatPanel from './chat.js';

function setHomeOrLogin(user, setMainSwitch) {
  if(user === null) {
    setMainSwitch(-1);
  } else {
    setMainSwitch(1);
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
      {displayPills(RPSList(), null, (sel) => selRPS(sel), (sel) => sel, (x,y) => x == y, null, 0)}
      {imageButton(() => alert("TODO add RPS"), add, "Add RPS")}
    </div>);
  } else {
    return (<div class="sec-fill">
      {displayPills(RPSList(), null, (sel) => selRPS(sel), (sel) => sel, (x,y) => x == y, null, 0)}
    </div>);
  }
}

function MainWindow(props) {
  switch(props.mainSwitch) {
    case -1: return <LoginPanel axios={props.axios} setters={props.setters}
                                login={props.loginName} pass={props.password} />
    case -2: return <AccountPanel axios={props.axios} setters={props.setters} user={props.user} />
    case 1:  return (
       <div>
         <div class="sec-title">Roshambo (aka Rock-Paper-Scissors)</div>
         {RPSchooser(props)}
       </div>
    );
    case 2:  return (<div>
      <div class="sec-title">Dice Rolling Tool</div>
      <DicePanel axios={props.axios} display={props.rollDisplay}
                 fiddle={(x) => props.sw(props.setters.setRollDisplay, props.rollDisplay, x)}
                 custom={props.custom} setCustom={props.setters.setCustom} />
    </div>);
    case 3:  return <PassPanel axios={axios} display={props.rollDisplay} admin={props.admin}
                               SPleague={props.SPleague} SPleagues={props.SPleagues}
                               SPnewLeagueS={props.SPnewLeagueS} SPnewLeagueL={props.SPnewLeagueL}
                               SPseason={props.SPseason} SPseasons={props.SPseasons}
                               SPnewSeasonDisplay={props.SPnewSeasonDisplay}
                               SPrace={props.SPrace} SPraces={props.SPraces}
                               SPnewRaceDisplay={props.SPnewRaceDisplay} SPnewRaceMult={props.SPnewRaceMult}
                               SPnewRaceTrack={props.SPnewRaceTrack}
                               SPteam={props.SPteam} SPteams={props.SPteams}
                               SPnewTeamID={props.SPnewTeamID} SPnewTeamDisplay={props.SPnewTeamDisplay}
                               SPdriver={props.SPdriver} SPdrivers={props.SPdrivers}
                               SPnewDriverBirth={props.SPnewDriverBirth}
                               SPnewDriverDisplay={props.SPnewDriverDisplay}
                               SPresultRace={props.SPresultRace} SPresultDriver={props.SPresultDriver}
                               SPresultTeam={props.SPresultTeam} SPresultList={props.SPresultList}
                               SPresultCompleted={props.SPresultCompleted}
                               SPinjuryDuration={props.SPinjuryDuration}
                               SPinjuryPending={props.SPinjuryPending}
                               SPswitch={props.SPswitch} SPpreview={props.SPpreview}
                               SPstandingsScope={props.SPstandingsScope} SPstandingsType={props.SPstandingsType}
                               SPstandings={props.SPstandings}
                               setters={props.setters} tweak={props.tweak} />
    case 4:  return <div class='sec-title'>1856 Accountant</div>;
    default: return "Undefined panel";
  }
}

function hack3(setBanner, setMainSwitch) {
  setMainSwitch(3);
}

function hack4(setBanner, setMainSwitch) {
  setMainSwitch(4);
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
  const [chat, setChat] = useState(null);
  const [chatTextInput, setChatTextInput] = useState("");
  const [chatText, setChatText] = useState("Loading...");
  const [chatList, setChatList] = useState(null);
  const [addingChat, setAddingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [outChat, setOutChat] = useState("");

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
    setChatTextInput: setChatTextInput,
    setChatText: setChatText,
    setChatList: setChatList,
    setAddingChat: setAddingChat,
    setNewChatName: setNewChatName,
    setOutChat: setOutChat,

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
               <div onClick={() => setHomeOrLogin(user, setMainSwitch)}><img src={home} className="home-button" alt="ChatTool" /></div>
               <div onClick={() => setMainSwitch(2)}><img src={die} className="icon-button" alt="DiceTool" /></div>
               <div onClick={() => hack3(setBanner, setMainSwitch)}><img src={racecar} className="icon-button" alt="Third" /></div>
               <div onClick={() => hack4(setBanner, setMainSwitch)}><img src={train} className="home-button" alt="Fourth" /></div>
            </div>
            <div className="vertical">
              {showBanner(banner, setBanner)}
              <div className="App-main">
                <MainWindow tweak={tweak} axios={axios} setters={setters} admin={admin}
                            loginName={loginName} password={password}
                            chat={chat} chatText={chatText} chatTextInput={chatTextInput}
                            mainSwitch={mainSwitch} rollDisplay={rollDisplay} sw={appendOrClear}
                            custom={custom} loginName={loginName} password={password} user={user}
                />
              </div>
            </div>
        </div>
        <div>
          <ChatPanel
               setters={setters} axios={axios} user={user} admin={admin}
               chat={chat} chatText={chatText} chatTextInput={chatTextInput}
               chatList={chatList} addingChat={addingChat} newChatName={newChatName}
               outChat={outChat}
          />
        </div>
    </div>
  );
}

export default App;
