import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

function clearLeague(props) {
  props.setters.setSPleague(null);
}

function createLeague(props, name) {
  props.axios.get('http://10.0.0.143:32109/sp/league/createDISABLE/'+name
  ).then((response) => props.setters.setBanner("success")).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no response");
    }
  });
}

function LeagueFunction(props) {
  if (props.SPleague == null) { return (<div /> )}
  return (<div>
      <div class="leagueSel"><span>{props.SPleague}</span></div>
      <div class="leagueFunction">
          <button onClick={() => clearLeague(props)}>Standings</button>
          <button onClick={() => clearLeague(props)}>Schedule</button>
      </div>
  </div>);
};

export default function PassPanel(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span></div>
    /* TODO load leagues */
    <div><button onClick={() => createLeague(props, "debug")} class="naked-button">
        <img src={addButton} class="click-icon"/>
    </button></div>
    {LeagueFunction(props)}
  </div>);
}