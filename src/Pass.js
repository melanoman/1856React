import React from 'react';
import './Pass.css';

import addButton from './icon/addButton.svg';

const TAB_NONE = 0;
const TAB_TEAMS = 1;
const TAB_STANDINGS = 2;
const TAB_SCHEDULE = 3;

var league_tab = TAB_NONE;
var loadingLeagues = false;
var loadingRaces = false;
var loadingSeasons = false;
var addingLeague = false;
var addingSeason = false;
var addingRace = false;

function isActive(left, right) {
  if(left === right) {
    return "stab";
  } else {
    return "tab";
  }
}

function provoke(props) {
  props.setters.setTweak(props.tweak + 1);
}

function selectTeams(props) {
  if (league_tab === TAB_TEAMS) return;
  league_tab = TAB_TEAMS;
  provoke(props);
}

function selectStandings(props) {
  if(league_tab === TAB_STANDINGS) return;
  league_tab = TAB_STANDINGS;
  provoke(props);
}

function selectSchedule(props) {
  if(league_tab === TAB_SCHEDULE) return;
  league_tab = TAB_SCHEDULE;
  provoke(props);
}

function clearLeagueSelection(props) {
  props.setters.setSPleague(null);
}

function cancelAdd(props) {
  addingSeason = false;
  addingLeague = false;
  addingRace = false;
  provoke(props);
}

function displayPill(pill, sel, setSel, getText, eq) {
  if(eq(pill, sel)) {
    return <button class="thich" onClick={() => setSel(pill)}>{getText(pill)}</button>
  } else {
    return <button class="which" onClick={() => setSel(pill)}>{getText(pill)}</button>
  }
}

function displayPills(pills, sel, setSel, getText, eq) {
  return pills.map((pill) => displayPill(pill, sel, setSel, getText, eq));
}

function handleCreated(props, sel) {
  props.setters.setSPleague(sel);
  props.setters.setSPleagues(null);
}

function handleNewSeason(sel, props) {
  props.setters.setSPseason(sel);
  props.setters.setSPseasons(null);
}

function receiveLeagueList(props, response) {
  props.setters.setSPleagues(response.data);
  loadingLeagues = false;
}

function receiveSeasonList(props, response) {
  props.setters.setSPseasons(response.data);
  loadingSeasons = false;
}

function receiveRaceList(props, response) {
  props.setters.setSPraces(response.data);
  loadingRaces = false;
}

function startAddingLeague(props) {
  addingLeague = true;
  clearLeagueSelection(props);
  provoke(props);
}

function startAddingSeason(props) {
  addingSeason = true;
  props.setters.setSPseason(null);
  provoke(props);
}

function startAddingRace(props) {
  addingRace = true;
  props.setters.setSPrace(null);
  provoke(props);
}

function sameRace(nut, bolt) {
  if(nut === bolt) { return true; }
  if(nut === null || bolt === null || nut === undefined | bolt === undefined) {return false;}
  return (
    nut.id.leagueID === bolt.id.leagueID &&
    nut.id.seasonNumber === bolt.id.seasonNumber &&
    nut.id.raceNumber === bolt.id.raceNumber
  );
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

function getLeagueText(league) {
  return league.id;
}

function getRaceText(race) {
  return race.displayName;
}

function sameLeague(nut, bolt) {
  if(nut === bolt) { return true; }
  if(nut === null || bolt === null || nut === undefined | bolt === undefined) {return false;}
  return nut.id === bolt.id;
}

function listLeagues(props) {
  if (props.SPleagues === undefined || props.SPleagues === null) {
    if (loadingLeagues) {
      return "Loading in progress";
    } else {
      loadingLeagues = true;
      loadLeagues(props);
      return (<button onClick={() => loadLeagues(props)}>LOAD</button>);
    }
  }
  return displayPills(props.SPleagues, props.SPleague, props.setters.setSPleague, getLeagueText, sameLeague);
}

function filterSeasonByLeague(seasons, league) {
  if (league === undefined || league === null || seasons === undefined || seasons === null) return [];
  return seasons.filter((season) => league.id == season.id.leagueID);
}

function loadSeasons(props) {
  props.axios.get('http://10.0.0.143:32109/sp/seasons'
  ).then((response) => receiveSeasonList(props, response)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("error in loadSeasons");
    } else {
      props.setters.setBanner("no loadSeasons response!");
    }
  });
}

function getSeasonText(season) {
  return season.displayName;
}

function sameSeason(nut, bolt) {
  if(nut === bolt) { return true; }
  if(nut === null || bolt === null || nut === undefined | bolt === undefined) {return false;}
  return (nut.id.leagueID === bolt.id.leagueID && nut.id.seasonNumber === bolt.id.seasonNumber);
}

function loadRaces(props) {
  props.axios.get('http://10.0.0.143:32109/sp/races'
  ).then((response) => receiveRaceList(props, response)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("error in loadRaces");
      } else {
        props.setters.setBanner("no loadRaces response!");
      }
  });
}

function filterRacesByLeagueAndSeason(races, league, season) {
  if (league === undefined || league === null ||
      season === undefined || season === null ||
      races === undefined || races === null) {
    return [{id:{seasonNumber:1, raceNumber:1, leagueID: "fake"}, displayName: "idiot"}];
  }

  return races.filter(((race) => race.id.leagueID === league.id &&
                                 race.id.seasonNumber === season.id.seasonNumber
  ));
}

function listRaces(props) {
  if (props.SPraces === undefined || props.SPraces === null) {
    if(loadingRaces) {
      return "LoadingRaces in progress";
    } else {
      loadingRaces = true;
      loadRaces(props);
      return "sending loadRaces request";
    }
  }

  return displayPills(
    filterRacesByLeagueAndSeason(props.SPraces, props.SPleague, props.SPSeason),
    props.SPrace, props.setters.setSPrace, getRaceText, sameRace
  );
}

function listSeasons(props) {
  if (props.SPseasons === undefined || props.SPseasons === null) {
      if (loadingSeasons) {
        return "loading in progress";
      } else {
        loadingSeasons = true;
        loadSeasons(props);
        return "sending loadSeason request";
      }
  }
  return displayPills(
    filterSeasonByLeague(props.SPseasons, props.SPleague),
    props.SPseason, props.setters.setSPseason, getSeasonText, sameSeason
  );
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
  addingLeague = false;
}

function createSeason(props) {
  props.setters.setSPseasons(null);
  props.axios.get('http://10.0.0.143:32109/sp/new/season/'+props.SPleague.id+'?display='+props.SPnewSeasonDisplay
  ).then((response) => handleNewSeason(response.data, props)).catch((error) => {
      if(error.response) {
        alert(error.response.status + ":" + error.response.data);
      } else {
        alert("no createSeason response!"+props.SPnewLeagueS);
      }
    });
    provoke(props);
    addingSeason = false;
}

function createRace(props) {
  alert("createRace not implemented");
}

function displayScheduleDetail(props) {
  if(addingSeason) {
    return (<div>
      <div class="selTitle"><span>Adding New Season</span></div>
      <div>displayName:<input type="text" onChange={(e)=>props.setters.setSPnewSeasonDisplay(e.target.value)} /></div>
      <div>
        <button onClick={() => createSeason(props) }>Add</button>
        <button onClick={() => cancelAdd(props)}>X</button>
      </div>
    </div>);
  } else {
    return <div>{makeRacePanel(props)}</div>
  }
}

function makeRacePanel(props) {
  if(addingRace) {
    return (<div>
      <div>{showRaceSelector(props)}</div>
      <div class="selTitle"><span>Adding New Race</span></div>
      <div>
        <button onClick={() => createRace(props) }>Add</button>
        <button onClick={() => cancelAdd(props)}>X</button>
      </div>
    </div>);
  } else {
    return <div>{showRaceSelector(props)}</div>
  }
}

function makeSchedulePanel(props) {
  return (<div>
    <div class="vcd">
      <div>{listSeasons(props)}</div>
      <div><button class="naked-button" onClick={() => startAddingSeason(props)}>
        <img src={addButton} class="click-icon"/>
      </button></div>
    </div>
    {displayScheduleDetail(props)}
  </div>);
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
          <button class={isActive(league_tab, TAB_TEAMS)} onClick={() => selectTeams(props)}>Teams</button>
          <button class={isActive(league_tab, TAB_SCHEDULE)} onClick={() => selectSchedule(props)}>Schedule</button>
          <button class={isActive(league_tab, TAB_STANDINGS)} onClick={() => selectStandings(props)}>Standings</button>
      </div>
      <div class="selTitle"><span>{props.SPleague.display}</span></div>
      <div>{topTab(props)}</div>
  </div>);
};

function showLeagueAdder(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Adding New League</span></div>
    <div>Short Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueS(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueL(e.target.value)}/></div>
    <button onClick={() => createLeague(props)}>Add</button> <button onClick={() => cancelAdd(props)}>X</button>
  </div>);
}

function showLeagueSelector(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span></div>
    <div class="vcd">
      { listLeagues(props) }
      <span><button onClick={() => startAddingLeague(props)} class="naked-button">
         <img src={addButton} class="click-icon"/>
      </button></span>
    </div>
    {LeagueFunction(props)}
  </div>);
}

function showRaceSelector(props) {
  if(props.SPleague === null || props.SPleague === undefined ||
     props.SPseason === null || props.SPseason === undefined ||
     props.SPseason.id.leagueID !== props.SPleague.id) {
    return (<div class="vcd">
      stuff goes here
    </div>);
  }

  return (<div class="Pass-top">
    <div class="selTitle"><span>{props.SPleague.id} {props.SPseason.displayName} Schedule</span></div>
    <div class="vcd">
      {listRaces(props)}
      <span><button onClick={() => startAddingRace(props)} class="naked-button">
         <img src={addButton} class="click-icon"/>
      </button></span>
    </div>
  </div>);
}

export default function PassPanel(props) {
  if (addingLeague) {
    return showLeagueAdder(props);
  } else {
    return showLeagueSelector(props);
  }
}