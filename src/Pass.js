import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

var adding = false;
var loading = false;

function clearLeagueSelection(props) {
  props.setters.setSPleague(null);
}

function displayLeagues(leagues, setSPleague) {
  return leagues.map((league) => <button class="which" onClick={() => setSPleague(league)}>{league.id}</button>);
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
  return displayLeagues(props.SPleagues, props.setters.setSPleague);
}

function createLeague(props) {
  props.axios.get('http://10.0.0.143:32109/sp/league/create/'+props.SPnewLeagueS+'?display='+props.SPnewLeagueL
  ).then((response) => handleCreated(props, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createLeague response!"+props.SPnewLeagueS);
    }
  });
  props.setters.setTweak(props.tweak + 1);
  adding = false;
}

function LeagueFunction(props) {
  if (props.SPleague == null) { return (<div>no league selected</div> )}
  return (<div>
      <div class="leagueFunction">
          <button onClick={() => clearLeagueSelection(props)}>Standings</button>
          <button onClick={() => clearLeagueSelection(props)}>Schedule</button>
      </div>
      <div class="leagueSel"><span>{props.SPleague.display}</span></div>
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