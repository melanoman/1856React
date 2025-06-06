import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

function clearLeagueSelection(props) {
  props.setters.setSPleague(null);
}

function listLeagues(props) {
  return "TODO LIST LEAGUES";
}

function createLeague(props, name) {
  props.axios.get('http://10.0.0.143:32109/sp/league/create/'+name
  ).then((response) => props.setters.setBanner(response.data.id)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.me);
    } else {
      props.setters.setBanner("no response!");
    }
  });
}

function LeagueFunction(props) {
  if (props.SPleague == null) { return (<div>no league selected</div> )}
  return (<div>
      <div class="leagueSel"><span>{props.SPleague}</span></div>
      <div class="leagueFunction">
          <button onClick={() => clearLeagueSelection(props)}>Standings</button>
          <button onClick={() => clearLeagueSelection(props)}>Schedule</button>
      </div>
  </div>);
};

export default function PassPanel(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span></div>
    <div class="vcd">
        { listLeagues(props) }
        <span><button onClick={() => createLeague(props, "alpha")} class="naked-button">
            <img src={addButton} class="click-icon"/>
        </button></span>
    </div>
    {LeagueFunction(props)}
  </div>);
}