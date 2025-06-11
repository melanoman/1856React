import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

const TAB_NONE = 0;
const TAB_TEAMS = 1;
const TAB_STANDINGS = 2;
const TAB_SCHEDULE = 3;

var league_tab = TAB_NONE;
var adding = false;
var loading = false;

function provoke(props) {
  props.setters.setTweak(props.tweak + 1);
}

function showTeams(props) {
  if (league_tab === TAB_TEAMS) return;
  league_tab = TAB_TEAMS;
  provoke(props);
}

function showStandings(props) {
  if(league_tab === TAB_STANDINGS) return;
  league_tab = TAB_STANDINGS;
  provoke(props);
}

function showSchedule(props) {
  if(league_tab === TAB_SCHEDULE) return;
  league_tab = TAB_SCHEDULE;
  provoke(props);
}

function clearLeagueSelection(props) {
  props.setters.setSPleague(null);
}

function displayLeague(league, sel, setSPleague) {
  if(league === sel) {
    return <button class="thich" onClick={() => setSPleague(league)}>{league.id}</button>
  } else {
    return <button class="which" onClick={() => setSPleague(league)}>{league.id}</button>
  }
}

function displayLeagues(leagues, sel, setSPleague) {
  return leagues.map((league) => displayLeague(league, sel, setSPleague));
}

function handleCreated(props, sel) {
  props.setters.setSPleague(sel);
  props.setters.setSPleagues(null);
}

function receiveLeagueList(props, response) {
  props.setters.setSPleagues(response.data);
  loading = false;
}

function startAdding(props) {
  adding = true;
  clearLeagueSelection(props);
  props.setters.setTweak(props.tweak + 1);
}

function loadLeagues(props) {
  props.axios.get('http://10.0.0.143:32109/sp/leagues'
  ).then((response) => receiveLeagueList(props, response)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("errro");
    } else {
      props.setters.setBanner("no loadLeagues response!");
    }
  });
}

function listLeagues(props) {
  if (props.SPleagues === undefined || props.SPleagues === null) {
    if (loading) {
      return "Loading in progress";
    } else {
      loading = true;
      loadLeagues(props);
      return (<button onClick={() => loadLeagues(props)}>LOAD</button>);
    }
  }
  return displayLeagues(props.SPleagues, props.SPleague, props.setters.setSPleague);
}

function createLeague(props) {
  props.axios.get('http://10.0.0.143:32109/sp/new/league/'+props.SPnewLeagueS+'?display='+props.SPnewLeagueL
  ).then((response) => handleCreated(props, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createLeague response!"+props.SPnewLeagueS);
    }
  });
  provoke(props);
  adding = false;
}

function createSeason(props) { // TODO get displayName input and calculate season number
  props.axios.get('http://10.0.0.143:32109/sp/new/season/alpha/5?display=Sommer'
  ).then((response) => alert("Season display is" +response.data.displayName)).catch((error) => {
      if(error.response) {
        alert(error.response.status + ":" + error.response.data);
      } else {
        alert("no createSeason response!"+props.SPnewLeagueS);
      }
    });
    provoke(props);
    adding = false;
}

function makeSchedulePanel(props) {
  return (<div class="vcd"><button onClick={() => createSeason(props)}>MakeSeason</button></div>);
}

function makeStandingsPanel(props) {
  return(<div class="vcd">TODO make standings panel</div>);
}

function makeTeamChooser(props) {
  return(<div class="vcd">TODO makeTeamChooser</div>);
}

function topTab(props) {
  switch (league_tab) {
    case TAB_NONE:
    return;
    case TAB_SCHEDULE:
    return makeSchedulePanel(props);
    case TAB_STANDINGS:
    return makeStandingsPanel(props);
    case TAB_TEAMS:
    return makeTeamChooser(props);
  }
}

function LeagueFunction(props) {
  if (props.SPleague == null) { return (<div>no league selected</div> )}
  return (<div>
      <div class="leagueFunction">
          <button onClick={() => showTeams(props)}>Teams</button>
          <button onClick={() => showSchedule(props)}>Schedule</button>
          <button onClick={() => showStandings(props)}>Standings</button>
      </div>
      <div class="leagueSel"><span>{props.SPleague.display}</span></div>
      <div>{topTab(props)}</div>
  </div>);
};

function showAdder(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Adding New League</span></div>
    <div>Short Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueS(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueL(e.target.value)}/></div>
    <button onClick={() => createLeague(props)}>Add</button>
  </div>);
}

function showSelector(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span></div>
    <div class="vcd">
      { listLeagues(props) }
      <span><button onClick={() => startAdding(props)} class="naked-button">
         <img src={addButton} class="click-icon"/>
      </button></span>
    </div>
    {LeagueFunction(props)}
  </div>);
}

export default function PassPanel(props) {
  if (adding) {
    return showAdder(props);
  } else {
    return showSelector(props);
  }
}