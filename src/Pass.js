import React, {useState} from 'react';
import './Pass.css';

import addButton from './icon/add.svg';
import flagButton from './icon/result.svg';
import noflag from './icon/noflag.svg';
import pencil from './icon/pencil.svg';
import ambo from './icon/ambo.svg';
import back from './icon/back.svg';
import check from './icon/check.svg';
import cancel from './icon/cancel.svg';
import clone from './icon/clone.svg';
import del from './icon/delete.svg';
import {imageButton, settingsButton} from './util.js';
const URLH = 'http://10.0.0.143:32109/sp/';

const TAB_NONE = 0;  // MUST MATCH APP.JS
const TAB_TEAMS = 1;
const TAB_STANDINGS = 2;
const TAB_SCHEDULE = 3;
const TAB_RUN = 4;
const VERTICAL = 8;
const HORIZONTAL = 9;

var loadingStandings = false;
var loadingLeagues = false;
var loadingRaces = false;
var loadingSeasons = false;
var loadingTeams = false;
var loadingDrivers = false;
var loadingPreview = false;
var oldResults = false;

function cancelResults(SP, props) {
  SP.setSPresultRace(null);
}

function isVoid(nut) {
  return nut === undefined || nut === null;
}

function reloadAll(SP, props) {
  SP.setSPleagues(null);
  SP.setSPraces(null);
  SP.setSPdrivers(null);
  SP.setSPseasons(null);
  SP.setSPteams(null);
  SP.setSPleague(null);
  SP.setSPrace(null);
  SP.setSPdriver(null);
  SP.setSPseason(null);
  SP.setSPteam(null);
  SP.setSPpreview(null);
}

function startEditingInjury(SP, props) {
  SP.setSPinjuryPending(true);
  SP.setSPinjuryDuration(-1);
}

function startEditingRace(SP, props) {
  cancelAll(SP, props);
  SP.setEditingRace(true);
  SP.setSPnewRaceDisplay(SP.race.displayName);
  SP.setSPnewRaceMult(SP.race.multiplier);
  SP.setSPnewRaceTrack(SP.race.trackName);
}

function receiveResults(SP, race, results) {
  SP.setSPresultRace(race);
  SP.setSPresultList(results);
  SP.setSPresultDriver(null);
  SP.setSPresultTeam(null);
}

function loadResults(SP, props) {
  props.axios.get(URLH+'results/'
      +SP.race.id.leagueID+'/'
      +SP.race.id.seasonNumber+'/'
      +SP.race.id.raceNumber
  ).then((response) => receiveResults(SP, SP.race, response.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function startEditingResults(SP, props) {
  cancelAll(SP);
  oldResults = true;
  loadResults(SP, props);
}

function startEditingLeague(SP) {
  cancelAll(SP);
  SP.setEditingLeague(true);
  SP.setSPnewLeagueL(SP.league.display);
}

function startEditingSeason(SP) {
  cancelAll(SP);
  SP.setSPnewSeasonDisplay(SP.season.displayName);
  SP.setSPrace(null);
  SP.setEditingSeason(true);
}

function startEditingTeam(SP) {
  cancelAll(SP);
  SP.setEditingTeam(true);
  SP.setSPnewTeamDisplay(SP.team.displayName);
}

function startEditingDriver(SP) {
  cancelAll(SP);
  SP.setEditingDriver(true);
  SP.setSPnewDriverDisplay(SP.driver.displayName);
  SP.setSPnewDriverBirth(SP.driver.birthday);
}

function cancelAll(SP) {
  cancelAdd(SP);
  cancelEdit(SP);
  SP.setSPpreview(null);
  SP.setSPstandings(null);
}
function isActive(left, right) {
  if(left === right) {
    return "stab";
  } else {
    return "tab";
  }
}

function selectTeams(SP, props) {
  SP.setTab(TAB_TEAMS);
}

function selectStandings(SP, props) {
  SP.setTab(TAB_STANDINGS);
}

function selectSchedule(SP, props) {
  SP.setTab(TAB_SCHEDULE);
}

function selectNextRace(SP, props) {
  SP.setTab(TAB_RUN);
}

function clearLeagueSelection(SP, props) {
  SP.setSPleague(null);
  SP.setSPpreview(null);
}

function cancelAdd(SP) {
  SP.setAddingSeason(false);
  SP.setAddingLeague(false);
  SP.setAddingRace(false);
  SP.setAddingTeam(false);
  SP.setAddingDriver(false);
}

function cancelEdit(SP) {
  SP.setEditingLeague(false);
  SP.setEditingRace(false);
  SP.setEditingSeason(false);
  SP.setEditingTeam(false);
  SP.setEditingDriver(false);
  SP.setSPinjuryPending(false);
  SP.setSPinjuryDuration(-1);
  SP.setSPpreview(null);
  SP.setSPresultRace(null);
}

function applySetSel(set, sel, SP, cancel) {
  if (cancel) {
    cancelAll(SP);
  }
  set(sel);
}

function displayPill(pill, sel, setSel, getText, eq, SP, ori, cancel) {
  if(ori === VERTICAL) {
    return (<div>
      {displayPillButton(pill, sel, setSel, getText, eq, SP)}
    </div>);
  }
  return displayPillButton(pill, sel, setSel, getText, eq, SP, cancel);
}

function displayPillButton(pill, sel, setSel, getText, eq, SP, cancel) {
  if(eq(pill, sel)) {
    return <button class="thich" onClick={() => applySetSel(setSel, pill, SP, cancel)}>{getText(pill)}</button>;
  } else {
    return <button class="which" onClick={() => applySetSel(setSel, pill, SP, cancel)}>{getText(pill)}</button>;
  }
}

function displayPills(pills, sel, setSel, getText, eq, SP, ori, cancel) {
  return pills.map((pill) => displayPill(pill, sel, setSel, getText, eq, SP, ori, cancel));
}

function handleNewClone(SP) {
  reloadAll(SP);
}

function handleCreated(SP, sel) {
  SP.setSPleague(sel);
  SP.setSPleagues(null);
  SP.setSPpreview(null);
  SP.setSPresultRace(null);
}

function handleNewSeason(SP, sel) {
  SP.setSPseason(sel);
  SP.setSPseasons(null);
}

function handleSeasonUpdate(SP, sel) {
  SP.setSPseason(sel);
  SP.setSPseasons(null);
}

function handleNewRace(SP, sel) {
  SP.setSPrace(sel);
  SP.setSPraces(null);
}

function handleRaceUpdate(SP, sel) {
  SP.setSPrace(sel);
  SP.setSPraces(null);
  cancelAll(SP);
}

function handleNewTeam(SP, sel) {
  SP.setSPteam(sel);
  SP.setSPteams(null);
}

function handleTeamUpdate(SP, sel) {
  SP.setSPteam(sel);
  SP.setSPteams(null);
  cancelAll(SP);
}

function handleTeamDeleted(SP) {
  SP.setSPteams(null);
  SP.setSPteam(null);
  cancelAll(SP);
}

function handleNewDriver(SP, sel) {
  SP.setSPdriver(sel);
  SP.setSPdrivers(null);
}

function handleDriverUpdate(SP, sel) {
  SP.setSPdriver(sel);
  SP.setSPdrivers(null);
}

function receiveLeagueList(SP, response) {
  SP.setSPleagues(response.data);
  loadingLeagues = false;
}

function receiveSeasonList(SP, response) {
  SP.setSPseasons(response.data);
  loadingSeasons = false;
}

function receiveRaceList(SP, response) {
  SP.setSPraces(response.data);
  loadingRaces = false;
}

function receiveTeamList(SP, response) {
  SP.setSPteams(response.data);
  loadingTeams = false;
}

function receivePreview(SP, response) {
  SP.setSPpreview(response.data);
  SP.setSPresultRace(null);
  loadingPreview = false;
}

function receiveDriverList(SP, response) {
  SP.setSPdrivers(response.data);
  loadingDrivers = false;
}

function startAddingLeague(SP) {
  cancelAll(SP);
  SP.setAddingLeague(true);
  clearLeagueSelection(SP);
}

function startAddingSeason(SP) {
  cancelAll(SP);
  SP.setAddingSeason(true);
  SP.setSPseason(null);
  SP.setSPrace(null);
}

function startAddingRace(SP) {
  cancelAll(SP);
  SP.setAddingRace(true);
  SP.setSPrace(null);
  SP.setSPnewRaceMult(1);
}

function startAddingTeam(SP) {
  cancelAll(SP);
  SP.setAddingTeam(true);
  SP.setSPteam(null);
}

function startAddingDriver(SP) {
  cancelAll(SP);
  SP.setAddingDriver(true);
  SP.setSPdriver(null);
}

function sameDriver(nut, bolt) {
    if(nut === bolt) { return true; }
    if(isVoid(nut) || isVoid(bolt)) {return false;}
    return (
      nut.id.leagueID === bolt.id.leagueID &&
      nut.id.teamID === bolt.id.teamID &&
      nut.id.driverNumber === bolt.id.driverNumber
    );
}

function sameRace(nut, bolt) {
  if(nut === bolt) { return true; }
  if(isVoid(nut) || isVoid(bolt)) {return false;}
  return (
    nut.id.leagueID === bolt.id.leagueID &&
    nut.id.seasonNumber === bolt.id.seasonNumber &&
    nut.id.raceNumber === bolt.id.raceNumber
  );
}

function loadLeagues(SP, props) {
  props.axios.get(URLH+'leagues'
  ).then((response) => receiveLeagueList(SP, response)).catch((error) => {
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

function sameLeague(nut, bolt) {
  if(nut === bolt) { return true; }
  if(isVoid(nut) || isVoid(bolt)) {return false;}
  return nut.id === bolt.id;
}

function setLeague(SP, league) {
  clearLeagueSelection(SP);
  SP.setSPleague(league);
}

function listLeagues(SP, props) {
  if (SP.leagues === undefined || SP.leagues === null) {
    if (loadingLeagues) {
      return "Loading in progress";
    } else {
      loadingLeagues = true;
      loadLeagues(SP, props);
      return;
    }
  }
  return displayPills(SP.leagues, SP.league, (league) => setLeague(SP, league),
                      getLeagueText, sameLeague, SP, HORIZONTAL, true);
}


function seasonCompare(nut, bolt) {
  return nut.id.seasonNumber - bolt.id.seasonNumber;
}

function filterSeasonByLeague(seasons, league) {
  if (isVoid(seasons) || isVoid(league)) return [];
  return seasons.filter((season) => league.id === season.id.leagueID).sort(seasonCompare);
}

function loadSeasons(SP, props) {
  props.axios.get(URLH+'seasons'
  ).then((response) => receiveSeasonList(SP, response)).catch((error) => {
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
  if(isVoid(nut) || isVoid(bolt)) {return false;}
  return (nut.id.leagueID === bolt.id.leagueID && nut.id.seasonNumber === bolt.id.seasonNumber);
}

function loadRaces(SP, props) {
  props.axios.get(URLH+'races'
  ).then((response) => receiveRaceList(SP, response)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("error in loadRaces");
      } else {
        props.setters.setBanner("no loadRaces response!");
      }
  });
}

function raceClass(SP, race) {
  if(sameRace(race, SP.race)) {
    return "selected-row";
  } else if (race.id.raceNumber%2 === 0) {
    return "even-row";
  } else {
    return "odd-row";
  }
}

function raceText(SP, race) {
  if(sameRace(race, SP.race)) {
    return "selected-cell-text";
  } else {
    return "normal-cell-text";
  }
}

function selectRaceRow(SP, race) {
  cancelAll(SP);
  SP.setSPrace(race);
}

function raceRow(SP, race) {
  return (<tr class={raceClass(SP, race)} onClick={() => selectRaceRow(SP, race)} >
    <td class={raceText(SP, race)} >{race.id.raceNumber}</td>
    <td class={raceText(SP, race)} >{race.displayName}</td>
    <td class={raceText(SP, race)} >{race.trackName}</td>
    <td class={raceText(SP, race)} >{race.multiplier}</td>
  </tr>)
}

function raceCompare(nut, bolt) {
  return nut.id.raceNumber - bolt.id.raceNumber;
}

function filterRacesByLeagueAndSeason(races, league, season) {
  if (isVoid(league) || isVoid(season) || isVoid(races)) {
    return [];
  }

  return races.filter(((race) => race.id.leagueID === league.id &&
                                 race.id.seasonNumber === season.id.seasonNumber
  )).sort(raceCompare);
}

function raceTable(SP) {
  return (<div><table class="stable">
    <tr><th>#</th><th>Race</th><th>Track</th><th>Bonus</th></tr>
    {filterRacesByLeagueAndSeason(SP.races, SP.league, SP.season).map((race) => raceRow(SP, race))}
  </table></div>);
}

function listRaces(SP, props) {
  if (isVoid(SP.races)) {
    if(loadingRaces) {
      return "LoadingRaces in progress";
    } else {
      loadingRaces = true;
      loadRaces(SP, props);
      return "sending loadRaces request";
    }
  }
  return raceTable(SP);
}

function listSeasons(SP, props) {
  if (isVoid(SP.seasons)) {
      if (loadingSeasons) {
        return "loading in progress";
      } else {
        loadingSeasons = true;
        loadSeasons(SP, props);
        return "sending loadSeason request";
      }
  }
  return displayPills(
    filterSeasonByLeague(SP.seasons, SP.league),
    SP.season, SP.setSPseason, getSeasonText, sameSeason, SP, HORIZONTAL, true
  );
}

function createLeague(SP, props) {
  props.axios.get(URLH+'new/league/'+SP.newLeagueS+'?display='+SP.newLeagueL
  ).then((response) => handleCreated(SP, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createLeague response!"+SP.newLeagueS);
    }
  });
  SP.setAddingLeague(false);
}

function createSeason(SP, props) {
  SP.setSPseasons(null);
  props.axios.get(URLH+'new/season/'+SP.league.id+'?display='+SP.newSeasonDisplay
  ).then((response) => handleNewSeason(SP, response.data)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no createSeason response!"+SP.newLeagueS);
      }
    });
    SP.setAddingSeason(false);
}

function updateSeason(SP, props) {
  SP.setSPseasons(null);
  props.axios.get(URLH+'update/season/'+SP.league.id+'/'+SP.season.id.seasonNumber+
    '?display='+SP.newSeasonDisplay
  ).then((response) => handleSeasonUpdate(SP, response.data)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no updateSeason response!"+SP.newLeagueS);
      }
    });
    SP.setEditingSeason(false);
}

function createRace(SP, props) {
  props.axios.get(URLH+'new/race/'+SP.league.id+'/'+SP.season.id.seasonNumber+
     '?display='+SP.newRaceDisplay+
     '&multiplier='+SP.newRaceMult+
     '&track='+SP.newRaceTrack
  ).then((response) => handleNewRace(SP, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createRace response! "+SP.newRaceDisplay);
    }
  });
  SP.setAddingRace(false);
  SP.setSPraces(null);
}

function updateRace(SP, props) {
  props.axios.get(URLH+'update/race/'+SP.league.id+'/'+SP.race.id.seasonNumber+'/'+SP.race.id.raceNumber+
     '?display='+SP.newRaceDisplay+
     '&multiplier='+SP.newRaceMult+
     '&track='+SP.newRaceTrack
  ).then((response) => handleRaceUpdate(SP, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no updateRace response! "+SP.newRaceDisplay);
    }
  });
  SP.setEditingRace(false);
  SP.setSPraces(null);
}

function createTeam(SP, props) {
  props.axios.get(URLH+'new/team/'+SP.league.id+'/'+SP.newTeamID+
    '?display='+SP.newTeamDisplay
  ).then((response) => handleNewTeam(SP, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createTeam response!"+SP.newTeamDisplay);
    }
  });
  SP.setAddingTeam(false);
  SP.setSPteams(null);
}

function displayScheduleDetail(SP, props) {
  if(SP.addingSeason) {
    return (<div>
      <div class="selTitle"><span>Adding New Season</span></div>
      <div>displayName:<input type="text" onChange={(e)=>SP.setSPnewSeasonDisplay(e.target.value)} /></div>
      <div>
        {imageButton(() => createSeason(SP, props), check, 'ok')}
        {imageButton(() => cancelAdd(SP), cancel, 'cancel')}
      </div>
    </div>);
  } else if (SP.editingSeason) {
    return (<div>
          <div class="selTitle"><span>Editing Season {SP.season.displayName}</span></div>
          <div>displayName:<input type="text" onChange={(e)=>SP.setSPnewSeasonDisplay(e.target.value)} /></div>
          <div>
            {imageButton(() => updateSeason(SP, props), check, 'ok')}
            {imageButton(() => cancelAll(SP, props), cancel, 'cancel')}
          </div>
        </div>);
  } else {
    return <div>{makeRacePanel(SP, props)}</div>
  }
}

function makeRacePanel(SP, props) {
  if(SP.addingRace) {
    return (<div>
      <div>{showRaceSelector(SP, props)}</div>
      <div class="selTitle"><span>Adding New Race</span></div>
      <div>Short Name:<input type="text" onChange={(e)=>SP.setSPnewRaceDisplay(e.target.value)} /></div>
      <div>Track Name:<input type="text" onChange={(e)=>SP.setSPnewRaceTrack(e.target.value)} /></div>
      <div>Muliplier:<input type="number" value={SP.newRaceMult}
                            onChange={(e)=>SP.setSPnewRaceMult(e.target.value)} /></div>
      <div>
        {imageButton(() => createRace(SP, props), check, 'add')}
        {imageButton(() => cancelAdd(SP), cancel, 'cancel')}
      </div>
    </div>);
  } else if(SP.editingRace) {
    return (<div>
      <div>{showRaceSelector(SP, props)}</div>
      <div class="selTitle"><span>Editing Race Number {SP.race.id.raceNumber}</span></div>
      <div>Short Name:<input type="text" value={SP.newRaceDisplay}
                             onChange={(e)=>SP.setSPnewRaceDisplay(e.target.value)} /></div>
      <div>Track Name:<input type="text" value={SP.newRaceTrack}
                             onChange={(e)=>SP.setSPnewRaceTrack(e.target.value)} /></div>
      <div>Muliplier:<input type="number" value={SP.newRaceMult}
                            onChange={(e)=>SP.setSPnewRaceMult(e.target.value)} /></div>
      <div>
        {imageButton(() => updateRace(SP, props), check, 'update')}
        {imageButton(() => cancelAll(SP, props), cancel, 'cancel')}
      </div>
    </div>);
  } else {
    return <div>{showRaceSelector(SP, props)}</div>
  }
}

function showEditSeasonButton(SP, props) {
  if(isVoid(SP.season) || SP.season.id.leagueID !== SP.league.id) {
    return;
  }

  return (imageButton(() =>startEditingSeason(SP, props), pencil, 'edit'));
}

function reallyCloneSchedule(SP, props, from) {
  props.axios.get(URLH+"clone/schedule/"+from+"/"+SP.league.id
  ).then((response) => handleNewClone(SP, props)).catch((error) => {
        if(error.response) {
          props.setters.setBanner(error.response.status + ":" + error.response.data);
        } else {
          props.setters.setBanner("no cloneSchedule response!"+SP.newTeamDisplay);
        }
  });
  SP.setSPseasons(null);
}

function cloneSchedule(SP, props) {
  var from = window.prompt("Clone from: ");
  if(window.confirm("Clone from "+from)) {
    reallyCloneSchedule(SP, props, from);
  }
}

function showCloneScheduleButton(SP, props) {
  if(!props.admin) {
      return;
  }

  return imageButton(() => cloneSchedule(SP, props), clone, 'clone');
}

function makeSchedulePanel(SP, props) {
  return (<div>
    <div class="vcd">
      <div>{listSeasons(SP, props)}</div>
      <div>{imageButton(() => startAddingSeason(SP, props), addButton, 'add')}</div>
      {showEditSeasonButton(SP, props)}
      {showCloneScheduleButton(SP, props)}
    </div>
    {displayScheduleDetail(SP, props)}
  </div>);
}

function thunk(x) {
  x.f();
}

const DRIVER_TYPE = 'driver';
const TEAM_TYPE = 'team';

const SEASON_SCOPE = 'season';
const ALLTIME_SCOPE = 'all';

function setStandingsType(SP, props, value) {
  loadingStandings = false;
  SP.setSPstandingsType(value);
  SP.setSPstandings(null);
}

function setStandingsScope(SP, props, value) {
  loadingStandings = false;
  SP.setSPstandingsScope(value);
  SP.setSPstandings(null);
}

function match(x, y) {
  return x===y;
}

function loadStandings(SP, props) {
  props.axios.get(URLH+'standings/'+SP.league.id+'/'+SP.standingsType+'/'+SP.standingsScope
    ).then((response) => receiveStandings(SP, response.data)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("error in loadStandings");
      } else {
        props.setters.setBanner("no standings response!");
      }
    });
}

function receiveStandings(SP, standings) {
  SP.setSPstandings(standings);
  loadingStandings = false;
}

function driverHeaders(isDriver) {
  if (isDriver) {
    return (<tr><th>Place</th><th>Points</th><th>Team</th><th>Driver</th></tr>);
  } else {
    return (<tr><th>Place</th><th>Points</th><th>Team</th></tr>);
  }
}

function standingRow(standing, isDriver) {
  if (isDriver) {
    return (<tr>
      <td>{standing.place}</td>
      <td>{standing.points}</td>
      <td>{standing.teamID}</td>
      <td>{standing.driverName}</td>
    </tr>);
  } else {
    return (<tr>
      <td>{standing.place}</td>
      <td>{standing.points}</td>
      <td>{standing.teamID}</td>
    </tr>);
  }
}

function standingsRows(standings, isDriver) {
  return standings.standings.map((standing) => standingRow(standing, isDriver));
}

function showStandingsTable(SP, props) {
  if (isVoid(SP.standings)) {
      if(loadingStandings) {
        return "LoadingStandings in progress";
      } else {
        loadingStandings = true;
        loadStandings(SP, props);
        return "sending loadStandings request";
      }
  }
  var isDriver = SP.standings.type === "driver";
  return (<div>
    <div class="vpad" />
    <table class="stable">
      {driverHeaders(isDriver)}
      {standingsRows(SP.standings, isDriver)}
    </table>
  </div>);
}

function makeStandingsPanel(SP, props) {
  return(<div>
    <div class="vcd">
      <div class="hpad" />
      <div>
        <div class="vpad" />
        <div><input type="radio" name="standings_type" value={DRIVER_TYPE}
                    checked={match(DRIVER_TYPE, SP.standingsType)}
                    onChange={(e) => setStandingsType(SP, props, e.target.value)} />
           Driver
        </div>
        <div><input type="radio" name="standings_type" value={TEAM_TYPE}
                    checked={match(TEAM_TYPE, SP.standingsType)}
                    onChange={(e) => setStandingsType(SP, props, e.target.value)} />
           Team
        </div>
        <select value={SP.standingsScope} onChange={(e) => setStandingsScope(SP, props, e.target.value)}>
          <option value="all">All Time</option>
          <option value="season">Current Season</option>
          <option value="1">Season One</option>
          <option value="2">Season Two</option>
          <option value="3">Season Three</option>
          <option value="4">Season Four</option>
          <option value="5">Season Five</option>
          <option value="6">Season Six</option>
        </select>
        <div class="vpad" />
      </div>
    </div>
    <div>{showStandingsTable(SP, props)}</div>
  </div>);
}

function getTeamText(team) {
  return team.id.teamID;
}

function startEnteringResults(SP, props) {
  SP.setSPresultRace(SP.preview.race);
  loadDrivers(SP, props);
}

function driverStatusClass(driver) {
  if(driver.remainingInjury > 0 || driver.experience < 0) {
    return "pink-row";
  } else if(driver.serialNumber % 2 === 0) {
    return "even-row";
  } else {
    return "odd-row";
  }
}

function experienceText(experience) {
  if(experience < 0) {
    return "RETIRED";
  } else if (experience < 11) {
    return "Rookie("+experience+")";
  } else if (experience < 31) {
    return "Veteran("+experience+")";
  } else if (experience < 51) {
    return "Elite("+experience+")";
  } else return "Legend("+experience+")";
}

function driverStatusTable(SP, props) {
  return (<table class="stable">
    <tr><th>Team</th><th>Driver</th><th>Experience</th><th>Hospital</th></tr>
    {SP.preview.drivers.map((driver) => <tr class={driverStatusClass(driver)}>
      <td>{driver.driver.id.teamID}</td>
      <td>{driver.driver.displayName}</td>
      <td>{experienceText(driver.experience)}</td>
      <td>{driver.remainingInjury}</td>
    </tr>)}
  </table>);
}

function createResults(SP, props) {
    SP.setSPresultRace(SP.preview.race);
    SP.setSPresultList([]);
    SP.setSPresultTeam(null);
    SP.setSPresultDriver(null);
    oldResults = false;
}

function runRacePanel(SP, props, leagueID) {
  if (isVoid(SP.preview)) {
      if(loadingPreview) {
        return "LoadingPreview in progress";
      } else {
        loadingPreview = true;
        loadPreview(SP, props);
        return "sending loadPreview request";
      }
  }

  return (<div>
    <div class="vcd">
        <div class="genTitle">
            Next Race is
            {SP.preview.race.displayName}@{SP.preview.race.trackName}(x{SP.preview.race.multiplier})

            {imageButton(() => createResults(SP, props), flagButton, 'Enter Results')}
        </div>
    </div>
    <div class="vpad" />
    {driverStatusTable(SP, props)}
  </div>);
}

function loadPreview(SP, props) {
  props.axios.get(URLH+'preview/'+SP.league.id
  ).then((response) => receivePreview(SP, response)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("error in loadPreview");
    } else {
      props.setters.setBanner("no preview response!");
    }
  });
}


function loadTeams(SP, props) {
  props.axios.get(URLH+'teams'
  ).then((response) => receiveTeamList(SP, response)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("error in loadTeam");
    } else {
      props.setters.setBanner("no loadTeam response!");
    }
  });
}

function sameTeam(nut, bolt) {
  if(nut === bolt) { return true; }
  if(nut === null || bolt === null || nut === undefined | bolt === undefined) {return false;}
  return (nut.id.leagueID === bolt.id.leagueID && nut.id.teamID === bolt.id.teamID);
}

function filterTeamsByLeague(teams, league) {
  if (league === undefined || league === null || teams === undefined || teams === null) return [];
  return teams.filter((team) => team.id.leagueID === league.id);
}

function showEditTeamButton(SP) {
  if(isVoid(SP.team) || SP.team.id.leagueID !== SP.league.id) {
    return;
  }

  return (imageButton(() =>startEditingTeam(SP), pencil, 'edit'));
}

function selectTeam(SP, team) {
  SP.setSPteam(team);
  cancelEdit(SP);
}

function listTeams(SP, props, sel, f, ori, cancel) {
  if (isVoid(SP.teams)) {
    if(loadingTeams) {
      return "LoadingTeams in progress";
    } else {
      loadingTeams = true;
      loadTeams(SP, props);
      return "sending loadTeams request";
    }
  }
  return displayPills(
    filterTeamsByLeague(SP.teams, SP.league),
    sel, f, getTeamText, sameTeam, SP, ori, cancel
  );
}

function maybeListTeams(SP, props, sel, f, ori, cancel) {
  if(!oldResults || props.admin) {
    return listTeams(SP, props, sel, f, ori, cancel);
  }
}

function createTeamPanel(SP, props) {
  return (<div>
    <div>Short Name: <input type="text" onChange={(e)=>SP.setSPnewTeamID(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>SP.setSPnewTeamDisplay(e.target.value)}/></div>
    <div>
      {imageButton(() => createTeam(SP, props),check,'add')}
      {imageButton(() => cancelAdd(SP), cancel, 'cancel')}
    </div>
  </div>);
}

function loadDrivers(SP, props) {
  props.axios.get(URLH+'drivers').then((response) => receiveDriverList(SP, response)
  ).catch((error) => {
    if(error.response) {
       props.setters.setBanner("error in loadDrivers");
    } else {
       props.setters.setBanner("no loadDrivers response!");
    }
  });
}

function createDriver(SP, props) {
  props.axios.get(URLH+'new/driver/'+SP.league.id+'/'+SP.team.id.teamID+
    '?display='+SP.newDriverDisplay+
    '&season='+SP.newDriverBirth
  ).then((response) => handleNewDriver(SP, response.data)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no createDriver response!"+SP.newDriverDisplay);
      }
  });
  SP.setAddingDriver(false);
  SP.setSPdrivers(null);
}

function isTeamInLeagueSelected(SP, props) {
  if(SP.team === undefined || SP.team === null) {
    return false;
  }
  return SP.team.id.leagueID === SP.league.id;
}

function editDriverButton(SP, props) {
  if(isVoid(SP.driver) || isVoid(SP.team) ||
     SP.driver.id.teamID !== SP.team.id.teamID ||
     SP.driver.id.leagueID !== SP.league.id
  ) {
    return;
  }
  return (imageButton(() => startEditingDriver(SP, props), pencil, 'edit'));
}

function updateDriver(SP, props) {
  props.axios.get(URLH+'update/driver/'+SP.league.id+'/'+SP.driver.id.teamID+'/'+
    SP.driver.id.driverNumber+
    "?display="+SP.newDriverDisplay+
    "&birth="+SP.newDriverBirth
  ).then((response) => handleDriverUpdate(SP, response.data)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no updateDriver response! "+SP.newDriverDisplay);
    }
  });
  SP.setEditingDriver(false);
  SP.setSPdrivers(null);
}

function addDriverPanel(SP, props) {
  if(SP.addingDriver) {
    return (<div>
      <div class="selTitle">Adding Driver</div>
      <div>Name: <input type="text" onChange={(e)=>SP.setSPnewDriverDisplay(e.target.value)}/></div>
      <div>Start Season: <input type="number" onChange={(e)=>SP.setSPnewDriverBirth(e.target.value)} /></div>
      <div>
        {imageButton(() => createDriver(SP, props), check, 'ok')}
        {imageButton(() => cancelAll(SP), cancel, 'cancel')}
      </div>
    </div>);
  } else if (SP.editingDriver) {
    return (<div>
        <div class="selTitle">Editing Driver</div>
        <div>Number: {SP.driver.id.driverNumber}</div>
        <div>Name: <input type="text" value={SP.newDriverDisplay}
                          onChange={(e)=>SP.setSPnewDriverDisplay(e.target.value)}/></div>
        <div>Start Season:
            <input type="number" value={SP.newDriverBirth}
                                 onChange={(e)=>SP.setSPnewDriverBirth(e.target.value)} />
        </div>
        <div>
           {imageButton(() => updateDriver(SP, props), check, 'update')}
           {imageButton(() => cancelAll(SP, props), cancel, 'cancel')}
        </div>
      </div>);
  } else if (isTeamInLeagueSelected(SP, props)) {
    return (<div>
      {imageButton(() => startAddingDriver(SP, props), addButton, 'add')}
      {editDriverButton(SP, props)}
    </div>);
  } else {
    return;
  }
}

function driverCompare(nut, bolt) {
  return nut.id.driverNumber - bolt.id.driverNumber;
}

function filterDriversByLeagueAndTeam(drivers, league, team) {
  if (league === undefined || league === null ||
      team === undefined || team === null ||
      drivers === undefined || drivers === null) {
    return [];
  }

  return drivers.filter(((driver) => driver.id.leagueID === league.id &&
                                     driver.id.teamID === team.id.teamID &&
                                     team.id.leagueID === league.id
  )).sort(driverCompare);
}

function selectDriverRow(SP, driver) {
  cancelAll(SP);
  SP.setSPdriver(driver);
}

function driverClass(SP, driver) {
  if(sameDriver(driver, SP.driver)) {
    return "selected-row";
  } else if (driver.id.driverNumber%2 === 0) {
    return "even-row";
  } else {
    return "odd-row";
  }
}

function driverCellClass(driver, sel) {
  if(sameDriver(driver, sel)) {
    return "selected-cell-text";
  } else {
    return "normal-cell-text";
  }
}

function driverRow(SP, driver) {
  return (<tr class={driverClass(SP, driver)} onClick={()=>selectDriverRow(SP, driver)}>
    <td class={driverCellClass(driver, SP.driver)}>{driver.id.driverNumber}</td>
    <td class={driverCellClass(driver, SP.driver)}>{driver.displayName}</td>
    <td class={driverCellClass(driver, SP.driver)}>{driver.birthday}</td>
  </tr>);
}

function driverRows(SP) {
  if(SP.drivers === null || SP.drivers === undefined) {
    return;
  }

  return filterDriversByLeagueAndTeam(
    SP.drivers, SP.league, SP.team).map((driver) => driverRow(SP, driver)
  );
}

function driverTable(SP, props) {
  return (<div>
      <table class="stable">
        <tr><th>ID</th><th>Name</th><th>Since</th></tr>
        {driverRows(SP)}
      </table>
      {addDriverPanel(SP, props)}
  </div>);
}

function listDrivers(SP, props) {
  if (isVoid(SP.drivers)) {
    if(loadingDrivers) {
      return "LoadingDrivers in progress";
    } else {
      loadingDrivers = true;
      loadDrivers(SP, props);
      return "sending loadDrivers request";
    }
  }
  return driverTable(SP, props);
}

function updateTeam(SP, props) {
  props.axios.get(URLH+'update/team/'+SP.team.id.leagueID+'/'+SP.team.id.teamID+
      '?display='+SP.newTeamDisplay
    ).then((response) => handleTeamUpdate(SP, response.data)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no updateTeam response!"+SP.newTeamDisplay);
      }
    });
    SP.setAddingTeam(false);
    SP.setSPteams(null);
}

function reallyDeleteTeam(SP, props) {
  props.axios.get(URLH+'delete/team/'+SP.league.id+'/'+SP.team.id.teamID
  ).then((response) => handleTeamDeleted(SP, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no deleteTeam response! "+SP.newTeamDisplay);
    }
  });
  SP.setAddingTeam(false);
  SP.setSPteams(null);
}

function deleteTeam(SP, props) {
  if(window.confirm("Delete Team "+SP.team.id.teamID)) {
    reallyDeleteTeam(SP, props);
  }
}

function deleteTeamButton(SP, props) {
  if(SP, props.admin) {
    return (<div class="flex-pack">
      {imageButton(() => deleteTeam(SP, props), del, 'delete')}
    </div>);
  }
}

function showEditTeamPanel(SP, props) {
  return (<div>
    <div>Short Name: {SP.team.id.teamID}</div>
    <div>Long Name:
      <input type="text" value={SP.newTeamDisplay}
             onChange={(e)=>SP.setSPnewTeamDisplay(e.target.value)} />
    </div>
    <div class="flex-space">
      <div class="flex-pack">
        {imageButton(() => updateTeam(SP, props), check, 'ok')}
        {imageButton(() => cancelEdit(SP), cancel, 'cancel')}
      </div>
      {deleteTeamButton(SP, props)}
    </div>
  </div>);
}

function teamFunction(SP, props) {
  if (SP.addingTeam) {
    return createTeamPanel(SP, props);
  } else if (SP.editingTeam) {
    return showEditTeamPanel(SP, props);
  } else if (isVoid(SP.team)) {
    return;
  } else {
    return listDrivers(SP, props);
  }
}

function teamTitle(SP, props) {
  if(SP.team === null || SP.team === undefined) {
    return;
  } else {
    return (<div class="selTitle">{SP.team.displayName}</div>);
  }
}

function makeTeamPanel(SP, props) {
  return (<div>
    <div class="vcd">
      {listTeams(SP, props, SP.team, (team) => selectTeam(SP, team), 0, true)}
      {imageButton(() => startAddingTeam(SP), addButton, 'add')}
      {showEditTeamButton(SP, props)}
    </div>
    {teamTitle(SP, props)}
    {teamFunction(SP, props)}
  </div>);
}

function topTab(SP, props) {
  switch (SP.tab) {
    case TAB_NONE:
    return;
    case TAB_SCHEDULE:
    return makeSchedulePanel(SP, props);
    case TAB_STANDINGS:
    return makeStandingsPanel(SP, props);
    case TAB_TEAMS:
    return makeTeamPanel(SP, props);
    case TAB_RUN:
    return runRacePanel(SP, props);
    default:
    return;
  }
}

function LeagueFunction(SP, props) {
  if (SP.league === null) { return (<div>no league selected</div> )}
  return (<div>
      <div class="selTitle"><span>{SP.league.display}</span></div>
      <div class="leagueFunction">
          <button class={isActive(SP.tab, TAB_TEAMS)} onClick={() => selectTeams(SP, props)}>Teams</button>
          <button class={isActive(SP.tab, TAB_SCHEDULE)} onClick={() => selectSchedule(SP, props)}>Schedule</button>
          <button class={isActive(SP.tab, TAB_STANDINGS)} onClick={() => selectStandings(SP, props)}>Standings</button>
          <button class={isActive(SP.tab, TAB_RUN)} onClick={() => selectNextRace(SP, props)}>Next Race</button>
      </div>
      <div>{topTab(SP, props)}</div>
  </div>);
};

function showLeagueAdder(SP, props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Adding New League</span></div>
    <div>Short Name: <input type="text" onChange={(e)=>SP.setSPnewLeagueS(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>SP.setSPnewLeagueL(e.target.value)}/></div>
    {imageButton(() => createLeague(SP, props), check, 'ok')}
    {imageButton(() => cancelAdd(SP), cancel, 'cancel')}
  </div>);
}

function showEditLeagueButton(SP, props) {
  if(isVoid(SP.league) || !props.admin) {
    return;
  }

  return (imageButton(() => startEditingLeague(SP, props), pencil, 'edit'));
}

function showLeagueAddButton(SP, props) {
  if(SP, props.admin) {
    return imageButton(() => startAddingLeague(SP, props), addButton, 'add');
  }
}

function showLeagueSelector(SP, props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span><span>{settingsButton(props)}</span></div>
    <div class="vcd">
      { listLeagues(SP, props) }
      { showLeagueAddButton(SP, props) }
      { showEditLeagueButton(SP, props)}
    </div>
    {LeagueFunction(SP, props)}
  </div>);
}

function editRaceButton(SP, props) {
  if (isVoid(SP.race) ||
      SP.race.id.leagueID !== SP.league.id ||
      SP.race.id.seasonNumber !== SP.season.id.seasonNumber) {
    return;
  } else {
    return (imageButton(() => startEditingRace(SP, props), pencil, 'edit'));
  }
}

function editResultsButton(SP, props) {
  if(
       isVoid(SP.race) ||
       SP.race.id.leagueID !== SP.league.id ||
       SP.race.id.seasonNumber !== SP.season.id.seasonNumber
   ) {
     return;
   } else {
     return (imageButton(() => startEditingResults(SP, props), flagButton, 'results'));
   }
}

function showRaceSelector(SP, props) {
  if(isVoid(SP.league) || isVoid(SP.season) ||
     SP.season.id.leagueID !== SP.league.id) {
    return;
  }

  return (<div class="Pass-top">
    <div class="selTitle"><span>{SP.league.id} {SP.season.displayName} Schedule</span></div>
    <div>
      {listRaces(SP, props)}
      <div>
        {imageButton(() => startAddingRace(SP, props), addButton, 'add')}
        {editRaceButton(SP, props)}
        {editResultsButton(SP, props)}
      </div>
    </div>
  </div>);
}

function updateLeague(SP, props) {
  props.axios.get(URLH+'update/league/'+SP.league.id+
    '?display='+SP.newLeagueL
  ).then((response) => reloadAll(SP, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("Error: "+error.response.data);
    } else {
      props.setters.setBanner("no updateLeagues response!");
    }
  });
  cancelEdit(SP);
  SP.league.display = SP.newLeagueL;
}

function reallyDeleteLeague(SP, props) {
  props.axios.get(URLH+'delete/league/'+SP.league.id
  ).then((response) => reloadAll(SP, props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no deleteLeagues response!");
      }
  });
  cancelEdit(SP);
}

function deleteLeague(SP, props) {
  if(window.confirm("Delete League "+SP.league.id)) {
     reallyDeleteLeague(SP, props);
  }
}

function deleteLeagueButton(SP, props) {
  if(SP, props.admin) {
    return (<div class="flex-pack">
      {imageButton(() => deleteLeague(SP, props), del, 'delete')}
    </div>);
  }
}

function selectResultTeam(SP, sel) {
  SP.setSPresultTeam(sel);
  SP.setSPresultDriver(null);
}

function showLeagueEditor(SP, props) {
  return (<div class="Pass-top">
      <div class="Pass-leagues"><span>Editing League {SP.league.id} ({SP.league.display})</span></div>
      <div>Short Name: {SP.league.id}</div>
      <div>Long Name: <input type="text" value={SP.newLeagueL}
                             onChange={(e)=>SP.setSPnewLeagueL(e.target.value)}/>
      </div>
      <div class="flex-space">
        <div class="flex-pack">
          {imageButton(() => updateLeague(SP, props), check, 'ok')}
          {imageButton(() => cancelEdit(SP), cancel, 'cancel')}
        </div>
        {deleteLeagueButton(SP, props)}
      </div>
  </div>);
}

function listResultDrivers(SP, props) {
  if(!isVoid(SP.resultTeam) && SP.resultTeam.id.leagueID === SP.league.id) {
    return (<span class="yellow-box">
      {displayPills(
        filterDriversByLeagueAndTeam(SP.drivers, SP.league, SP.resultTeam),
        SP.resultDriver, SP.setSPresultDriver,
        (driver) => driver.displayName, sameDriver, SP, VERTICAL, false
      )}
    </span>);
  }
}

function unselectResult(SP) {
  SP.setSPresultTeam(null);
  SP.setSPresultDriver(null);
  SP.setSPinjuryPending(false);
  SP.setSPinjuryDuration(-1);
}

function pushResult(SP, props, raceComplete, racesMissed) {
  if (racesMissed === -1) {
    alert("Must select Injury Duration First");
    return;
  }
  SP.resultList.push({
    finished: raceComplete,
    injuryDuration: racesMissed,
    teamID: SP.resultTeam.id.teamID,
    driverName: SP.resultDriver.displayName,
    driverNumber: SP.resultDriver.id.driverNumber,
    id: {
      place: 1+SP.resultList.length,
      leagueID: SP.league.id,
      seasonNumber: SP.resultRace.id.seasonNumber,
      raceNumber: SP.resultRace.id.raceNumber
    }
  });
  unselectResult(SP);
}

function getInjuryText(num) {

  if(num === 0) {
    return "no Injury"
  }
  if(num === 1) {
  }
  if(num > 200) {
    return "dead";
  }
  if(num > 60) {
    return "retired";
  }
  return num+" races missed";
}

const injuryNums = [0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 18, 27, 99, 999]
function injuryPills(SP, props) {
  return displayPills(injuryNums, SP.injuryDuration, SP.setSPinjuryDuration,
                      getInjuryText, (x, y) => x == y, props, VERTICAL, false
  );
}

function resultConfirmationButtons(SP, props) {
  if(!isVoid(SP.resultDriver) && !SP.injuryPending) {
    return (<span class="yellow-box">
      <div>{imageButton(() => pushResult(SP, props, true, 0), check, 'enter')}</div>
      <div>{imageButton(() => startEditingInjury(SP, props), ambo, 'injury')}</div>
      <div>{imageButton(() => unselectResult(SP), cancel, 'cancel')}</div>
    </span>);
  } else if (SP.injuryPending) {
    return (<span class="pink-box">
      <span>{imageButton(() => pushResult(SP, props, false, SP.injuryDuration), noflag, 'nofinish')}</span>
      <span>{imageButton(() => pushResult(SP, props, true, SP.injuryDuration), flagButton, 'finished')}</span>
      <span>{imageButton(() => unselectResult(SP), cancel, 'cancel')}</span>
      <div>
         {injuryPills(SP, props)}
      </div>
    </span>);
  }
}

function backResult(SP, props) {
  if(isVoid(SP.resultTeam)) {
    SP.resultList.pop();
    SP.setSPresultList(SP.resultList.slice()); //to provoke refresh
  } else {
    SP.setSPresultTeam(null);
    SP.setSPresultTeam(null);
  }
}

function stopEditingResults(SP, props) {
  SP.setSPresultRace(null);
  SP.setSPpreview(null);
}

function sendResult(SP, props) {
  props.axios.post(URLH+"replace/results/"
    +SP.resultRace.id.leagueID+'/'
    +SP.resultRace.id.seasonNumber+'/'
    +SP.resultRace.id.raceNumber,
    SP.resultList
  ).then((response) => stopEditingResults(SP, props)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function resultButtons(SP, props) {
  if(oldResults && !props.admin) {
    return (<div>
      {imageButton(()=>cancelResults(SP, props), cancel, 'cancel')}
    </div>);
  }
  return (<div>
    {imageButton(()=>backResult(SP, props), back, 'back')}
    {imageButton(()=>cancelResults(SP, props), cancel, 'cancel')}
    {imageButton(()=>sendResult(SP, props), check, 'ok')}
  </div>);
}

function showResultEditor(SP, props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues">Editing Results for League {SP.league.id}</div>
    <div class="selTitle">
      Race {SP.resultRace.id.seasonNumber}.{SP.resultRace.id.raceNumber}
      ({SP.resultRace.displayName} @ {SP.resultRace.trackName})
    </div>
    <div class="flex-pack">
      <span>{resultTable(SP, props)}</span>
      <span class="yellow-box">
        {maybeListTeams(SP, props, SP.resultTeam, (team) => selectResultTeam(SP, team), VERTICAL, false)}
      </span>
      {listResultDrivers(SP, props)}
      {resultConfirmationButtons(SP, props)}
    </div>
    {resultButtons(SP, props)}
  </div>);
}

//TODO replace with gfx
function YN(bool) {
  if(bool) {
    return 'yes';
  } else {
    return 'no';
  }
}

function blank0(num) {
  if(num === 0) {
    return '';
  } else {
    return num;
  }
}

function resultRow(SP, props, row) {
  return (<tr>
    <td>{row.id.place}</td>
    <td>{row.teamID}</td>
    <td>{row.driverName}</td>
    <td>{YN(row.finished)}</td>
    <td>{blank0(row.injuryDuration)}</td>
  </tr>);
}

function resultRows(SP, props) {
  if (!isVoid(SP.resultList)) {
    return SP.resultList.map((row) => resultRow(SP, props, row))
  }
}

function resultTable(SP, props) {
  return (<div>
    <table class="stable">
      <tr><th>Place</th><th>Team</th><th>Driver</th><th>Finished</th><th>Injury</th></tr>
      {resultRows(SP, props)}
    </table>
  </div>);
}

export default function PassPanel(props) {
  const [tab, setTab] = useState(TAB_NONE);
  const [league, setSPleague] = useState(null);
  const [leagues, setSPleagues] = useState(null);
  const [newLeagueS, setSPnewLeagueS] = useState(null);
  const [newLeagueL, setSPnewLeagueL] = useState(null);
  const [season, setSPseason] = useState(null);
  const [seasons, setSPseasons] = useState(null);
  const [newSeasonDisplay, setSPnewSeasonDisplay] = useState(null);
  const [race, setSPrace] = useState(null);
  const [races, setSPraces] = useState(null);
  const [newRaceDisplay, setSPnewRaceDisplay] = useState(null);
  const [newRaceTrack, setSPnewRaceTrack] = useState(null);
  const [newRaceMult, setSPnewRaceMult] = useState(null);
  const [team, setSPteam] = useState(null);
  const [teams, setSPteams] = useState(null);
  const [newTeamDisplay, setSPnewTeamDisplay] = useState(null);
  const [newTeamID, setSPnewTeamID] = useState(null);
  const [driver, setSPdriver] = useState(null);
  const [drivers, setSPdrivers] = useState(null);
  const [newDriverBirth, setSPnewDriverBirth] = useState(null);
  const [newDriverDisplay, setSPnewDriverDisplay] = useState(null);
  const [resultRace, setSPresultRace] = useState(null);
  const [resultTeam, setSPresultTeam] = useState(null);
  const [resultDriver, setSPresultDriver] = useState(null);
  const [resultList, setSPresultList] = useState(null);
  const [injuryPending, setSPinjuryPending] = useState(false);
  const [injuryDuration, setSPinjuryDuration] = useState(-1);
  const [resultCompleted, setSPresultCompleted] = useState(null);
  const [preview, setSPpreview] = useState(null);
  const [standingsType, setSPstandingsType] = useState('team');
  const [standingsScope, setSPstandingsScope] = useState('all');
  const [standings, setSPstandings] = useState(null);

  const [editingLeague, setEditingLeague] = useState(false);
  const [editingRace, setEditingRace] = useState(false);
  const [editingSeason, setEditingSeason] = useState(false);
  const [editingDriver, setEditingDriver] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);

  const [addingLeague, setAddingLeague] = useState(false);
  const [addingSeason, setAddingSeason] = useState(false);
  const [addingRace, setAddingRace] = useState(false);
  const [addingTeam, setAddingTeam] = useState(false);
  const [addingDriver, setAddingDriver] = useState(false);

  var SP = {
    tab: tab, setTab: setTab,
    league: league,
    leagues: leagues,
    newLeagueS: newLeagueS,
    newLeagueL: newLeagueL,
    season: season,
    seasons: seasons,
    newSeasonDisplay: newSeasonDisplay,
    race: race,
    races: races,
    newRaceDisplay: newRaceDisplay,
    newRaceTrack: newRaceTrack,
    newRaceMult: newRaceMult,
    team: team,
    teams: teams,
    newTeamDisplay: newTeamDisplay,
    newTeamID: newTeamID,
    driver: driver,
    drivers: drivers,
    newDriverBirth: newDriverBirth,
    newDriverDisplay: newDriverDisplay,
    resultRace: resultRace,
    resultTeam: resultTeam,
    resultDriver: resultDriver,
    resultList: resultList,
    injuryPending: injuryPending,
    injuryDuration: injuryDuration,
    resultCompleted: resultCompleted,
    preview: preview,
    standingsType: standingsType,
    standingsScope: standingsScope,
    standings: standings,

    editingLeague: editingLeague,
    editingRace: editingRace,
    editingSeason: editingSeason,
    editingDriver: editingDriver,
    editingTeam: editingTeam,

    addingLeague: addingLeague,
    addingSeason: addingSeason,
    addingRace: addingRace,
    addingTeam: addingTeam,
    addingDriver: addingDriver,

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
    setSPinjuryPending: setSPinjuryPending,
    setSPinjuryDuration: setSPinjuryDuration,
    setSPresultCompleted: setSPresultCompleted,
    setSPpreview: setSPpreview,
    setSPstandingsType: setSPstandingsType,
    setSPstandingsScope: setSPstandingsScope,
    setSPstandings: setSPstandings,

    setEditingLeague: setEditingLeague,
    setEditingRace: setEditingRace,
    setEditingSeason: setEditingSeason,
    setEditingDriver: setEditingDriver,
    setEditingTeam: setEditingTeam,

    setAddingLeague: setAddingLeague,
    setAddingSeason: setAddingSeason,
    setAddingRace: setAddingRace,
    setAddingTeam: setAddingTeam,
    setAddingDriver: setAddingDriver,
  }

  if (addingLeague) {
    return showLeagueAdder(SP, props);
  } else if (editingLeague) {
    return showLeagueEditor(SP, props);
  } else if (!isVoid(SP.resultRace)) {
    return showResultEditor(SP, props);
  } else {
    return showLeagueSelector(SP, props);
  }
}