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
import { loginDisplay, loginPanel, accountPanel } from './Login.js';
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

function mainWindow(tweak,
        axios, setters, admin, chat, chatText, chatTextInput, mainSwitch, rtv, sw,
        custom, Login, Pass, user, SPswitch,
        SPleague, SPleagues, SPnewLeagueS, SPnewLeagueL,
        SPseason, SPseasons, SPnewSeasonDisplay,
        SPrace, SPraces, SPnewRaceDisplay, SPnewRaceMult, SPnewRaceTrack,
        SPteam, SPteams, SPnewTeamID, SPnewTeamDisplay,
        SPdriver, SPdrivers, SPnewDriverBirth, SPnewDriverDisplay,
        SPresultRace, SPresultDriver, SPresultTeam, SPresultList,
        SPresultCompleted, SPinjuryDuration, SPinjuryPending, SPpreview,
        SPstandingsType, SPstandingsScope, SPstandings
) {
  var props = {
    setters: setters,
    chat: chat,
    admin: admin
  };

  switch(mainSwitch) {
    case -1: return loginPanel(axios, setters, Login, Pass);
    case -2: return accountPanel(axios, setters, user);
    case 1:  return (
       <div>
         <div class="sec-title">Roshambo (aka Rock-Paper-Scissors)</div>
         {RPSchooser(props)}
       </div>
    );
    case 2:  return (<div>
      <div class="sec-title">Dice Rolling Tool</div>
      <DicePanel axios={axios} display={rtv}
                 fiddle={(x) => sw(setters.setRollDisplay, rtv, x)}
                 custom={custom} setCustom={setters.setCustom} />
    </div>);
    case 3:  return <PassPanel axios={axios} display={rtv} admin={admin}
                               SPleague={SPleague} SPleagues={SPleagues}
                               SPnewLeagueS={SPnewLeagueS} SPnewLeagueL={SPnewLeagueL}
                               SPseason={SPseason} SPseasons={SPseasons} SPnewSeasonDisplay={SPnewSeasonDisplay}
                               SPrace={SPrace} SPraces={SPraces}
                               SPnewRaceDisplay={SPnewRaceDisplay} SPnewRaceMult={SPnewRaceMult}
                               SPnewRaceTrack={SPnewRaceTrack}
                               SPteam={SPteam} SPteams={SPteams}
                               SPnewTeamID={SPnewTeamID} SPnewTeamDisplay={SPnewTeamDisplay}
                               SPdriver={SPdriver} SPdrivers={SPdrivers}
                               SPnewDriverBirth={SPnewDriverBirth} SPnewDriverDisplay={SPnewDriverDisplay}
                               SPresultRace={SPresultRace} SPresultDriver={SPresultDriver}
                               SPresultTeam={SPresultTeam} SPresultList={SPresultList}
                               SPresultCompleted={SPresultCompleted} SPinjuryDuration={SPinjuryDuration}
                               SPinjuryPending={SPinjuryPending} SPswitch={SPswitch} SPpreview={SPpreview}
                               SPstandingsScope={SPstandingsScope} SPstandingsType={SPstandingsType}
                               SPstandings={SPstandings}
                               setters={setters} tweak={tweak} />
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

  const [custom, setCustom] = useState(1);
  const [mainSwitch, setMainSwitch] = useState(-1);
  const [rollDisplay, setRollDisplay] = useState(['']);
  const [loginName, setLoginName] = useState(['']);
  const [password, setPassword] = useState(['']);
  const [addr, setAddr] = useState('');
  const [userDisplay, setUserDisplay] = useState('');

  const [SPswitch, setSPswitch] = useState(0);
  const [SPleague, setSPleague] = useState(null);
  const [SPleagues, setSPleagues] = useState(null);
  const [SPnewLeagueS, setSPnewLeagueS] = useState(null);
  const [SPnewLeagueL, setSPnewLeagueL] = useState(null);
  const [SPseason, setSPseason] = useState(null);
  const [SPseasons, setSPseasons] = useState(null);
  const [SPnewSeasonDisplay, setSPnewSeasonDisplay] = useState(null);
  const [SPrace, setSPrace] = useState(null);
  const [SPraces, setSPraces] = useState(null);
  const [SPnewRaceDisplay, setSPnewRaceDisplay] = useState(null);
  const [SPnewRaceTrack, setSPnewRaceTrack] = useState(null);
  const [SPnewRaceMult, setSPnewRaceMult] = useState(null);
  const [SPteam, setSPteam] = useState(null);
  const [SPteams, setSPteams] = useState(null);
  const [SPnewTeamDisplay, setSPnewTeamDisplay] = useState(null);
  const [SPnewTeamID, setSPnewTeamID] = useState(null);
  const [SPdriver, setSPdriver] = useState(null);
  const [SPdrivers, setSPdrivers] = useState(null);
  const [SPnewDriverBirth, setSPnewDriverBirth] = useState(null);
  const [SPnewDriverDisplay, setSPnewDriverDisplay] = useState(null);
  const [SPresultRace, setSPresultRace] = useState(null);
  const [SPresultTeam, setSPresultTeam] = useState(null);
  const [SPresultDriver, setSPresultDriver] = useState(null);
  const [SPresultList, setSPresultList] = useState(null);
  const [SPinjuryPending, setSPinjuryPending] = useState(false);
  const [SPinjuryDuration, setSPinjuryDuration] = useState(-1);
  const [SPresultCompleted, setSPresultCompleted] = useState(null);
  const [SPpreview, setSPpreview] = useState(null);

  const [SPstandingsType, setSPstandingsType] = useState('team');
  const [SPstandingsScope, setSPstandingsScope] = useState('all');
  const [SPstandings, setSPstandings] = useState(null);

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

    setLoginName: setLoginName,
    setPassword: setPassword,
    setAddr: setAddr,
    setUserDisplay: setUserDisplay,
    setRollDisplay: setRollDisplay,

    setSPswitch: setSPswitch,
    setSPleague: setSPleague,
    setSPleagues: setSPleagues,
    setSPnewLeagueS: setSPnewLeagueS,
    setSPnewLeagueL: setSPnewLeagueL,

    setSPseason: setSPseason,
    setSPseasons: setSPseasons,
    setSPnewSeasonDisplay: setSPnewSeasonDisplay,

    setSPrace: setSPrace,
    setSPraces: setSPraces,
    setSPnewRaceDisplay: setSPnewRaceDisplay,
    setSPnewRaceTrack: setSPnewRaceTrack,
    setSPnewRaceMult: setSPnewRaceMult,

    setSPteam: setSPteam,
    setSPteams: setSPteams,
    setSPnewTeamDisplay: setSPnewTeamDisplay,
    setSPnewTeamID: setSPnewTeamID,

    setSPdriver: setSPdriver,
    setSPdrivers: setSPdrivers,
    setSPnewDriverBirth: setSPnewDriverBirth,
    setSPnewDriverDisplay: setSPnewDriverDisplay,

    setSPresultRace: setSPresultRace,
    setSPresultTeam: setSPresultTeam,
    setSPresultDriver: setSPresultDriver,
    setSPresultList: setSPresultList,
    setSPresultCompleted: setSPresultCompleted,
    setSPinjuryDuration: setSPinjuryDuration,
    setSPinjuryPending: setSPinjuryPending,
    setSPpreview: setSPpreview,

    setSPstandingsType: setSPstandingsType,
    setSPstandingsScope: setSPstandingsScope,
    setSPstandings: setSPstandings
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
                {mainWindow(tweak, axios, setters, admin, chat, chatText, chatTextInput,
                            mainSwitch, rollDisplay, appendOrClear,
                            custom, loginName, password, user, SPswitch,
                            SPleague, SPleagues, SPnewLeagueS, SPnewLeagueL,
                            SPseason, SPseasons, SPnewSeasonDisplay,
                            SPrace, SPraces, SPnewRaceDisplay, SPnewRaceMult, SPnewRaceTrack,
                            SPteam, SPteams, SPnewTeamID, SPnewTeamDisplay,
                            SPdriver, SPdrivers, SPnewDriverBirth, SPnewDriverDisplay,
                            SPresultRace, SPresultDriver, SPresultTeam, SPresultList,
                            SPresultCompleted, SPinjuryDuration, SPinjuryPending, SPpreview,
                            SPstandingsType, SPstandingsScope, SPstandings
                )}
              </div>
            </div>
        </div>
        <div>
          <ChatPanel
               setters={setters} axios={axios} user={user} admin={admin}
               chat={chat} chatText={chatText} chatTextInput={chatTextInput}
               chatList={chatList} addingChat={addingChat} newChatName={newChatName}
          />
        </div>
    </div>
  );
}

export default App;
