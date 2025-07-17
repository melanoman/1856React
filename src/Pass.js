import React from 'react';
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
import gear from './icon/settings.svg';
import gear_admin from './icon/settings_admin.svg';

const URLH = 'http://10.0.0.143:32109/sp/';

const TAB_NONE = 0;  // MUST MATCH APP.JS
const TAB_TEAMS = 1;
const TAB_STANDINGS = 2;
const TAB_SCHEDULE = 3;
const TAB_RUN = 4;
const VERTICAL = 8;
const HORIZONTAL = 9;

var admin = false;
var gear_icon = gear;

var loadingLeagues = false;
var loadingRaces = false;
var loadingSeasons = false;
var loadingTeams = false;
var loadingDrivers = false;
var loadingPreview = false;
var addingLeague = false;
var addingSeason = false;
var addingRace = false;
var addingTeam = false;
var addingDriver = false;
var editingLeague = false;
var editingRace = false;
var editingSeason = false;
var editingDriver = false;
var editingTeam = false;
var oldResults = false;

function cancelResults(props) {
  props.setters.setSPresultRace(null);
}

function imageButton(f, cl, alt) {
  return (<button onClick={f} class="naked-button" alt={alt}>
    <img alt={alt} src={cl} class="click-icon" />
  </button>);
}

function isVoid(nut) {
  return nut === undefined || nut === null;
}

function reloadAll(props) {
  props.setters.setSPleagues(null);
  props.setters.setSPraces(null);
  props.setters.setSPdrivers(null);
  props.setters.setSPseasons(null);
  props.setters.setSPteams(null);
  props.setters.setSPleague(null);
  props.setters.setSPrace(null);
  props.setters.setSPdriver(null);
  props.setters.setSPseason(null);
  props.setters.setSPteam(null);
  props.setters.setSPpreview(null);
}

function startEditingInjury(props) {
  props.setters.setSPinjuryPending(true);
  props.setters.setSPinjuryDuration(-1);
}

function startEditingRace(props) {
  cancelAll(props);
  editingRace = true;
  props.setters.setSPnewRaceDisplay(props.SPrace.displayName);
  props.setters.setSPnewRaceMult(props.SPrace.multiplier);
  props.setters.setSPnewRaceTrack(props.SPrace.trackName);
  provoke(props);
}

function receiveResults(props, race, results) {
  props.setters.setSPresultRace(race);
  props.setters.setSPresultList(results);
  props.setters.setSPresultDriver(null);
  props.setters.setSPresultTeam(null);
}

function loadResults(props) {
  props.axios.get(URLH+'results/'
      +props.SPrace.id.leagueID+'/'
      +props.SPrace.id.seasonNumber+'/'
      +props.SPrace.id.raceNumber
  ).then((response) => receiveResults(props, props.SPrace, response.data)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function startEditingResults(props) {
  cancelAll(props);
  oldResults = true;
  loadResults(props);
}

function startEditingLeague(props) {
  cancelAll(props);
  editingLeague = true;
  props.setters.setSPnewLeagueL(props.SPleague.display);
  provoke(props);
}

function startEditingSeason(props) {
  cancelAll(props);
  props.setters.setSPnewSeasonDisplay(props.SPseason.displayName);
  props.setters.setSPrace(null);
  editingSeason = true;
  provoke(props);
}

function startEditingTeam(props) {
  cancelAll(props);
  editingTeam = true;
  props.setters.setSPnewTeamDisplay(props.SPteam.displayName);
  provoke(props);
}

function startEditingDriver(props) {
  cancelAll(props);
  editingDriver = true;
  props.setters.setSPnewDriverDisplay(props.SPdriver.displayName);
  props.setters.setSPnewDriverBirth(props.SPdriver.birthday);
  props.setters.setSPnewDriverLate(props.SPdriver.lateBirth);
  provoke(props);
}

function cancelAll(props) {
  cancelAdd(props);
  cancelEdit(props);
}
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
  props.setters.setSPswitch(TAB_TEAMS);
  provoke(props);
}

function selectStandings(props) {
  props.setters.setSPswitch(TAB_STANDINGS);
  provoke(props);
}

function selectSchedule(props) {
  props.setters.setSPswitch(TAB_SCHEDULE);
  provoke(props);
}

function selectNextRace(props) {
  props.setters.setSPswitch(TAB_RUN);
  provoke(props);
}

function clearLeagueSelection(props) {
  props.setters.setSPleague(null);
  props.setters.setSPpreview(null);
}

function cancelAdd(props) {
  addingSeason = false;
  addingLeague = false;
  addingRace = false;
  addingTeam = false;
  addingDriver = false;
  provoke(props);
}

function cancelEdit(props) {
  editingLeague = false;
  editingRace = false;
  editingSeason = false;
  editingTeam = false;
  editingDriver = false;
  props.setters.setSPinjuryPending(false);
  props.setters.setSPinjuryDuration(-1);
  props.setters.setSPpreview(null);
  props.setters.setSPresultRace(null);
  provoke(props);
}

function applySetSel(set, sel, props, cancel) {
  if (cancel) {
    cancelAll(props);
  }
  set(sel);
}

function displayPill(pill, sel, setSel, getText, eq, props, ori, cancel) {
  if(ori === VERTICAL) {
    return (<div>
      {displayPillButton(pill, sel, setSel, getText, eq, props)}
    </div>);
  }
  return displayPillButton(pill, sel, setSel, getText, eq, props, cancel);
}

function displayPillButton(pill, sel, setSel, getText, eq, props, cancel) {
  if(eq(pill, sel)) {
    return <button class="thich" onClick={() => applySetSel(setSel, pill, props, cancel)}>{getText(pill)}</button>;
  } else {
    return <button class="which" onClick={() => applySetSel(setSel, pill, props, cancel)}>{getText(pill)}</button>;
  }
}

function displayPills(pills, sel, setSel, getText, eq, props, ori, cancel) {
  return pills.map((pill) => displayPill(pill, sel, setSel, getText, eq, props, ori, cancel));
}

function handleNewClone(props) {
  reloadAll(props);
}

function handleCreated(props, sel) {
  props.setters.setSPleague(sel);
  props.setters.setSPleagues(null);
  props.setters.setSPpreview(null);
  props.setters.setSPresultRace(null);
}

function handleNewSeason(sel, props) {
  props.setters.setSPseason(sel);
  props.setters.setSPseasons(null);
}

function handleSeasonUpdate(sel, props) {
  props.setters.setSPseason(sel);
  props.setters.setSPseasons(null);
}

function handleNewRace(sel, props) {
  props.setters.setSPrace(sel);
  props.setters.setSPraces(null);
  provoke(props);
}

function handleRaceUpdate(sel, props) {
  props.setters.setSPrace(sel);
  props.setters.setSPraces(null);
  provoke(props);
  cancelAll(props);
}

function handleNewTeam(sel, props) {
  props.setters.setSPteam(sel);
  props.setters.setSPteams(null);
}

function handleTeamUpdate(sel, props) {
  props.setters.setSPteam(sel);
  props.setters.setSPteams(null);
  cancelAll(props);
}

function handleTeamDeleted(props) {
  props.setters.setSPteams(null);
  props.setters.setSPteam(null);
  cancelAll(props);
}

function handleNewDriver(sel, props) {
  props.setters.setSPdriver(sel);
  props.setters.setSPdrivers(null);
}

function handleDriverUpdate(sel, props) {
  props.setters.setSPdriver(sel);
  props.setters.setSPdrivers(null);
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

function receiveTeamList(props, response) {
  props.setters.setSPteams(response.data);
  loadingTeams = false;
}

function receivePreview(props, response) {
  props.setters.setSPpreview(response.data);
  props.setters.setSPresultRace(null);
  loadingPreview = false;
}

function receiveDriverList(props, response) {
  props.setters.setSPdrivers(response.data);
  loadingDrivers = false;
}

function startAddingLeague(props) {
  cancelAll(props);
  addingLeague = true;
  clearLeagueSelection(props);
  provoke(props);
}

function startAddingSeason(props) {
  cancelAll(props);
  addingSeason = true;
  props.setters.setSPseason(null);
  props.setters.setSPrace(null);
  provoke(props);
}

function startAddingRace(props) {
  cancelAll(props);
  addingRace = true;
  props.setters.setSPrace(null);
  props.setters.setSPnewRaceMult(1);
  provoke(props);
}

function startAddingTeam(props) {
  cancelAll(props);
  addingTeam = true;
  props.setters.setSPteam(null);
  provoke(props);
}

function startAddingDriver(props) {
  cancelAll(props);
  addingDriver = true;
  props.setters.setSPdriver(null);
  provoke(props);
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

function loadLeagues(props) {
  props.axios.get(URLH+'leagues'
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

function sameLeague(nut, bolt) {
  if(nut === bolt) { return true; }
  if(isVoid(nut) || isVoid(bolt)) {return false;}
  return nut.id === bolt.id;
}

function setLeague(league, props) {
  clearLeagueSelection(props);
  props.setters.setSPleague(league);
}

function listLeagues(props) {
  if (props.SPleagues === undefined || props.SPleagues === null) {
    if (loadingLeagues) {
      return "Loading in progress";
    } else {
      loadingLeagues = true;
      loadLeagues(props);
      return;
    }
  }
  return displayPills(props.SPleagues, props.SPleague, (league) => setLeague(league, props),
                      getLeagueText, sameLeague, props, HORIZONTAL, true);
}


function seasonCompare(nut, bolt) {
  return nut.id.seasonNumber - bolt.id.seasonNumber;
}

function filterSeasonByLeague(seasons, league) {
  if (isVoid(seasons) || isVoid(league)) return [];
  return seasons.filter((season) => league.id === season.id.leagueID).sort(seasonCompare);
}

function loadSeasons(props) {
  props.axios.get(URLH+'seasons'
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
  if(isVoid(nut) || isVoid(bolt)) {return false;}
  return (nut.id.leagueID === bolt.id.leagueID && nut.id.seasonNumber === bolt.id.seasonNumber);
}

function loadRaces(props) {
  props.axios.get(URLH+'races'
  ).then((response) => receiveRaceList(props, response)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("error in loadRaces");
      } else {
        props.setters.setBanner("no loadRaces response!");
      }
  });
}

function raceClass(race, props) {
  if(sameRace(race, props.SPrace)) {
    return "selected-row";
  } else if (race.id.raceNumber%2 === 0) {
    return "even-row";
  } else {
    return "odd-row";
  }
}

function raceText(race, props) {
  if(sameRace(race, props.SPrace)) {
    return "selected-cell-text";
  } else {
    return "normal-cell-text";
  }
}

function selectRaceRow(props, race) {
  cancelAll(props);
  props.setters.setSPrace(race);
}

function raceRow(race, props) {
  return (<tr class={raceClass(race, props)} onClick={() => selectRaceRow(props, race)} >
    <td class={raceText(race, props)} >{race.id.raceNumber}</td>
    <td class={raceText(race, props)} >{race.displayName}</td>
    <td class={raceText(race, props)} >{race.trackName}</td>
    <td class={raceText(race, props)} >{race.multiplier}</td>
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

function raceTable(props) {
  return (<div><table class="stable">
    <tr><th>#</th><th>Race</th><th>Track</th><th>Bonus</th></tr>
    {filterRacesByLeagueAndSeason(props.SPraces, props.SPleague, props.SPseason).map((race) => raceRow(race, props))}
  </table></div>);
}

function listRaces(props) {
  if (isVoid(props.SPraces)) {
    if(loadingRaces) {
      return "LoadingRaces in progress";
    } else {
      loadingRaces = true;
      loadRaces(props);
      return "sending loadRaces request";
    }
  }
  return raceTable(props);
}

function listSeasons(props) {
  if (isVoid(props.SPseasons)) {
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
    props.SPseason, props.setters.setSPseason, getSeasonText, sameSeason, props, HORIZONTAL, true
  );
}

function createLeague(props) {
  props.axios.get(URLH+'new/league/'+props.SPnewLeagueS+'?display='+props.SPnewLeagueL
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
  props.axios.get(URLH+'new/season/'+props.SPleague.id+'?display='+props.SPnewSeasonDisplay
  ).then((response) => handleNewSeason(response.data, props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no createSeason response!"+props.SPnewLeagueS);
      }
    });
    provoke(props);
    addingSeason = false;
}

function updateSeason(props) {
  props.setters.setSPseasons(null);
  props.axios.get(URLH+'update/season/'+props.SPleague.id+'/'+props.SPseason.id.seasonNumber+
    '?display='+props.SPnewSeasonDisplay
  ).then((response) => handleSeasonUpdate(response.data, props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no updateSeason response!"+props.SPnewLeagueS);
      }
    });
    provoke(props);
    editingSeason = false;
}

function createRace(props) {
  props.axios.get(URLH+'new/race/'+props.SPleague.id+'/'+props.SPseason.id.seasonNumber+
     '?display='+props.SPnewRaceDisplay+
     '&multiplier='+props.SPnewRaceMult+
     '&track='+props.SPnewRaceTrack
  ).then((response) => handleNewRace(response.data, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createRace response! "+props.SPnewRaceDisplay);
    }
  });
  provoke(props);
  addingRace = false;
  props.setters.setSPraces(null);
}

function updateRace(props) {
  props.axios.get(URLH+'update/race/'+props.SPleague.id+'/'+props.SPrace.id.seasonNumber+'/'+props.SPrace.id.raceNumber+
     '?display='+props.SPnewRaceDisplay+
     '&multiplier='+props.SPnewRaceMult+
     '&track='+props.SPnewRaceTrack
  ).then((response) => handleRaceUpdate(response.data, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no updateRace response! "+props.SPnewRaceDisplay);
    }
  });
  provoke(props);
  addingRace = false;
  props.setters.setSPraces(null);
}

function createTeam(props) {
  props.axios.get(URLH+'new/team/'+props.SPleague.id+'/'+props.SPnewTeamID+
    '?display='+props.SPnewTeamDisplay
  ).then((response) => handleNewTeam(response.data, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no createTeam response!"+props.SPnewTeamDisplay);
    }
  });
  provoke(props);
  addingTeam = false;
  props.setters.setSPteams(null);
}

function displayScheduleDetail(props) {
  if(addingSeason) {
    return (<div>
      <div class="selTitle"><span>Adding New Season</span></div>
      <div>displayName:<input type="text" onChange={(e)=>props.setters.setSPnewSeasonDisplay(e.target.value)} /></div>
      <div>
        {imageButton(() => createSeason(props), check, 'ok')}
        {imageButton(() => cancelAdd(props), cancel, 'cancel')}
      </div>
    </div>);
  } else if (editingSeason) {
    return (<div>
          <div class="selTitle"><span>Editing Season {props.SPseason.displayName}</span></div>
          <div>displayName:<input type="text" onChange={(e)=>props.setters.setSPnewSeasonDisplay(e.target.value)} /></div>
          <div>
            {imageButton(() => updateSeason(props), check, 'ok')}
            {imageButton(() => cancelAll(props), cancel, 'cancel')}
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
      <div>Short Name:<input type="text" onChange={(e)=>props.setters.setSPnewRaceDisplay(e.target.value)} /></div>
      <div>Track Name:<input type="text" onChange={(e)=>props.setters.setSPnewRaceTrack(e.target.value)} /></div>
      <div>Muliplier:<input type="number" value={props.SPnewRaceMult}
                            onChange={(e)=>props.setters.setSPnewRaceMult(e.target.value)} /></div>
      <div>
        {imageButton(() => createRace(props), check, 'add')}
        {imageButton(() => cancelAdd(props), cancel, 'cancel')}
      </div>
    </div>);
  } else if(editingRace) {
    return (<div>
      <div>{showRaceSelector(props)}</div>
      <div class="selTitle"><span>Editing Race Number {props.SPrace.id.raceNumber}</span></div>
      <div>Short Name:<input type="text" value={props.SPnewRaceDisplay}
                             onChange={(e)=>props.setters.setSPnewRaceDisplay(e.target.value)} /></div>
      <div>Track Name:<input type="text" value={props.SPnewRaceTrack}
                             onChange={(e)=>props.setters.setSPnewRaceTrack(e.target.value)} /></div>
      <div>Muliplier:<input type="number" value={props.SPnewRaceMult}
                            onChange={(e)=>props.setters.setSPnewRaceMult(e.target.value)} /></div>
      <div>
        {imageButton(() => updateRace(props), check, 'update')}
        {imageButton(() => cancelAll(props), cancel, 'cancel')}
      </div>
    </div>);
  } else {
    return <div>{showRaceSelector(props)}</div>
  }
}

function showEditSeasonButton(props) {
  if(isVoid(props.SPseason) || props.SPseason.id.leagueID !== props.SPleague.id) {
    return;
  }

  return (imageButton(() =>startEditingSeason(props), pencil, 'edit'));
}

function reallyCloneSchedule(props, from) {
  props.axios.get(URLH+"clone/schedule/"+from+"/"+props.SPleague.id
  ).then((response) => handleNewClone(props)).catch((error) => {
        if(error.response) {
          props.setters.setBanner(error.response.status + ":" + error.response.data);
        } else {
          props.setters.setBanner("no cloneSchedule response!"+props.SPnewTeamDisplay);
        }
  });
  provoke(props);
  props.setters.setSPseasons(null);
}

function cloneSchedule(props) {
  var from = window.prompt("Clone from: ");
  if(window.confirm("Clone from "+from)) {
    reallyCloneSchedule(props, from);
  }
}

function showCloneScheduleButton(props) {
  if(!admin) {
      return;
  }

  return imageButton(() => cloneSchedule(props), clone, 'clone');
}

function makeSchedulePanel(props) {
  return (<div>
    <div class="vcd">
      <div>{listSeasons(props)}</div>
      <div>{imageButton(() => startAddingSeason(props), addButton, 'add')}</div>
      {showEditSeasonButton(props)}
      {showCloneScheduleButton(props)}
    </div>
    {displayScheduleDetail(props)}
  </div>);
}

function thunk(x) {
  x.f();
}

const DRIVER_TYPE = '0';
const TEAM_TYPE = '1';

const SEASON_SCOPE = '0';
const ALLTIME_SCOPE = '1';

function setStandingsType(props, value) {
  props.setters.setSPstandingsType(value);
  props.setters.setSPstandings(null);
}

function setStandingsScope(props, value) {
  props.setters.setSPstandingsScope(value);
  props.setters.setSPstandings(null);
}

function match(x, y) {
  return x===y;
}

function makeStandingsPanel(props) {
  return(<div>
    <div class="vcd">
      <div>
        <div><input type="radio" name="standings_type" value={DRIVER_TYPE}
                    checked={match(DRIVER_TYPE, props.SPstandingsType)}
                    onChange={(e) => setStandingsType(props, e.target.value)} />
           Driver
        </div>
        <div><input type="radio" name="standings_type" value={TEAM_TYPE}
                    checked={match(TEAM_TYPE, props.SPstandingsType)}
                    onChange={(e) => setStandingsType(props, e.target.value)} />
           Team
        </div>
      </div>
      <div>
        <div><input type="radio" name="standings_scope" value={SEASON_SCOPE}
                    checked={match(SEASON_SCOPE, props.SPstandingsScope)}
                    onChange={(e) => setStandingsScope(props, e.target.value)} />
          Season
        </div>
        <div><input type="radio" name="standings_scope" value={ALLTIME_SCOPE}
                    checked={match(ALLTIME_SCOPE, props.SPstandingsScope)}
                    onChange={(e) => setStandingsScope(props, e.target.value)} />
          All Time
        </div>
      </div>
    </div>
    <div>Table Goes Here</div>
  </div>);
}

function getTeamText(team) {
  return team.id.teamID;
}

function startEnteringResults(props) {
  props.setters.setSPresultRace(props.SPpreview.race);
  loadDrivers(props);
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

function driverStatusTable(props) {
  return (<table class="stable">
    <tr><th>Team</th><th>Driver</th><th>Experience</th><th>Hospital</th></tr>
    {props.SPpreview.drivers.map((driver) => <tr class={driverStatusClass(driver)}>
      <td>{driver.driver.id.teamID}</td>
      <td>{driver.driver.displayName}</td>
      <td>{experienceText(driver.experience)}</td>
      <td>{driver.remainingInjury}</td>
    </tr>)}
  </table>);
}

function createResults(props) {
    props.setters.setSPresultRace(props.SPpreview.race);
    props.setters.setSPresultList([]);
    props.setters.setSPresultTeam(null);
    props.setters.setSPresultDriver(null);
    oldResults = false;
}

function runRacePanel(props, leagueID) {
  if (isVoid(props.SPpreview)) {
      if(loadingPreview) {
        return "LoadingPreview in progress";
      } else {
        loadingPreview = true;
        loadPreview(props);
        return "sending loadPreview request";
      }
  }

  return (<div>
    <div class="vcd">
        <div class="genTitle">Next Race is {props.SPpreview.race.displayName} @ {props.SPpreview.race.trackName}
            {imageButton(() => createResults(props), flagButton, 'Enter Results')}
        </div>
    </div>
    <div class="vpad" />
    {driverStatusTable(props)}
  </div>);
}

function loadPreview(props) {
  props.axios.get(URLH+'preview/'+props.SPleague.id
  ).then((response) => receivePreview(props, response)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("error in loadPreview");
    } else {
      props.setters.setBanner("no preview response!");
    }
  });
}


function loadTeams(props) {
  props.axios.get(URLH+'teams'
  ).then((response) => receiveTeamList(props, response)).catch((error) => {
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

function showEditTeamButton(props) {
  if(isVoid(props.SPteam) || props.SPteam.id.leagueID !== props.SPleague.id) {
    return;
  }

  return (imageButton(() =>startEditingTeam(props), pencil, 'edit'));
}

function selectTeam(props, team) {
  props.setters.setSPteam(team);
  cancelEdit(props);
}

function listTeams(props, sel, f, ori, cancel) {
  if (isVoid(props.SPteams)) {
    if(loadingTeams) {
      return "LoadingTeams in progress";
    } else {
      loadingTeams = true;
      loadTeams(props);
      return "sending loadTeams request";
    }
  }
  return displayPills(
    filterTeamsByLeague(props.SPteams, props.SPleague),
    sel, f, getTeamText, sameTeam, props, ori, cancel
  );
}

function maybeListTeams(props, sel, f, ori, cancel) {
  if(!oldResults || admin) {
    return listTeams(props, sel, f, ori, cancel);
  }
}

function createTeamPanel(props) {
  return (<div>
    <div>Short Name: <input type="text" onChange={(e)=>props.setters.setSPnewTeamID(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>props.setters.setSPnewTeamDisplay(e.target.value)}/></div>
    <div>
      {imageButton(() => createTeam(props),check,'add')}
      {imageButton(() => cancelAdd(props), cancel, 'cancel')}
    </div>
  </div>);
}

function loadDrivers(props) {
  props.axios.get(URLH+'drivers').then((response) => receiveDriverList(props, response)
  ).catch((error) => {
    if(error.response) {
       props.setters.setBanner("error in loadDrivers");
    } else {
       props.setters.setBanner("no loadDrivers response!");
    }
  });
}

function createDriver(props) {
  props.axios.get(URLH+'new/driver/'+props.SPleague.id+'/'+props.SPteam.id.teamID+
    '?display='+props.SPnewDriverDisplay+
    '&late='+props.SPnewDriverLate+
    '&season='+props.SPnewDriverBirth
  ).then((response) => handleNewDriver(response.data, props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no createDriver response!"+props.SPnewDriverDisplay);
      }
  });
  provoke(props);
  addingDriver = false;
  props.setters.setSPdrivers(null);
}

function isTeamInLeagueSelected(props) {
  if(props.SPteam === undefined || props.SPteam === null) {
    return false;
  }
  return props.SPteam.id.leagueID === props.SPleague.id;
}

function editDriverButton(props) {
  if(isVoid(props.SPdriver) || isVoid(props.SPteam) ||
     props.SPdriver.id.teamID !== props.SPteam.id.teamID ||
     props.SPdriver.id.leagueID !== props.SPleague.id
  ) {
    return;
  }
  return (imageButton(() => startEditingDriver(props), pencil, 'edit'));
}

function updateDriver(props) {
  props.axios.get(URLH+'update/driver/'+props.SPleague.id+'/'+props.SPdriver.id.teamID+'/'+
    props.SPdriver.id.driverNumber+
    "?display="+props.SPnewDriverDisplay+
    "&birth="+props.SPnewDriverBirth+
    "&late="+props.SPnewDriverLate
  ).then((response) => handleDriverUpdate(response.data, props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no updateDriver response! "+props.SPnewDriverDisplay);
    }
  });
  provoke(props);
  editingDriver = false;
  props.setters.setSPdrivers(null);
}

function addDriverPanel(props) {
  if(addingDriver) {
    return (<div>
      <div class="selTitle">Adding Driver</div>
      <div>Name: <input type="text" onChange={(e)=>props.setters.setSPnewDriverDisplay(e.target.value)}/></div>
      <div>Start Season: <input type="number" onChange={(e)=>props.setters.setSPnewDriverBirth(e.target.value)} /></div>
      <div>Start after race five?:
          <input type="checkbox" onChange={(e) => props.setters.setSPnewDriverLate(e.target.checked)} />
      </div>
      <div>
        {imageButton(() => createDriver(props), check, 'ok')}
        {imageButton(() => cancelAll(props), cancel, 'cancel')}
      </div>
    </div>);
  } else if (editingDriver) {
    return (<div>
        <div class="selTitle">Editing Driver</div>
        <div>Number: {props.SPdriver.id.driverNumber}</div>
        <div>Name: <input type="text" value={props.SPnewDriverDisplay}
                          onChange={(e)=>props.setters.setSPnewDriverDisplay(e.target.value)}/></div>
        <div>Start Season:
            <input type="number" value={props.SPnewDriverBirth}
                                 onChange={(e)=>props.setters.setSPnewDriverBirth(e.target.value)} />
        </div>
        <div>Start after race five?:
            <input type="checkbox" checked={props.SPnewDriverLate}
                                   onChange={(e) => props.setters.setSPnewDriverLate(e.target.checked)} />
        </div>
        <div>
           {imageButton(() => updateDriver(props), check, 'update')}
           {imageButton(() => cancelAll(props), cancel, 'cancel')}
        </div>
      </div>);
  } else if (isTeamInLeagueSelected(props)) {
    return (<div>
      {imageButton(() => startAddingDriver(props), addButton, 'add')}
      {editDriverButton(props)}
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

function selectDriverRow(props, driver) {
  cancelAll(props);
  props.setters.setSPdriver(driver);
}

function driverClass(driver, props) {
  if(sameDriver(driver, props.SPdriver)) {
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

function point5(nut) {
  return nut ? ".5" : "";
}

function driverRow(props, driver) {
  return (<tr class={driverClass(driver, props)} onClick={()=>selectDriverRow(props, driver)}>
    <td class={driverCellClass(driver, props.SPdriver)}>{driver.id.driverNumber}</td>
    <td class={driverCellClass(driver, props.SPdriver)}>{driver.displayName}</td>
    <td class={driverCellClass(driver, props.SPdriver)}>{driver.birthday}{point5(driver.lateBirth)}</td>
  </tr>);
}

function driverRows(props) {
  if(props.SPdrivers === null || props.SPdrivers === undefined) {
    return;
  }

  return filterDriversByLeagueAndTeam(
    props.SPdrivers, props.SPleague, props.SPteam).map((driver) => driverRow(props, driver)
  );
}

function driverTable(props) {
  return (<div>
      <table class="stable">
        <tr><th>ID</th><th>Name</th><th>Since</th></tr>
        {driverRows(props)}
      </table>
      {addDriverPanel(props)}
  </div>);
}

function listDrivers(props) {
  if (isVoid(props.SPdrivers)) {
    if(loadingDrivers) {
      return "LoadingDrivers in progress";
    } else {
      loadingDrivers = true;
      loadDrivers(props);
      return "sending loadDrivers request";
    }
  }
  return driverTable(props);
}

function updateTeam(props) {
  props.axios.get(URLH+'update/team/'+props.SPteam.id.leagueID+'/'+props.SPteam.id.teamID+
      '?display='+props.SPnewTeamDisplay
    ).then((response) => handleTeamUpdate(response.data, props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner(error.response.status + ":" + error.response.data);
      } else {
        props.setters.setBanner("no updateTeam response!"+props.SPnewTeamDisplay);
      }
    });
    provoke(props);
    addingTeam = false;
    props.setters.setSPteams(null);
}

function reallyDeleteTeam(props) {
  props.axios.get(URLH+'delete/team/'+props.SPleague.id+'/'+props.SPteam.id.teamID
  ).then((response) => handleTeamDeleted(props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner(error.response.status + ":" + error.response.data);
    } else {
      props.setters.setBanner("no deleteTeam response! "+props.SPnewTeamDisplay);
    }
  });
  provoke(props);
  addingTeam = false;
  props.setters.setSPteams(null);
}

function deleteTeam(props) {
  if(window.confirm("Delete Team "+props.SPteam.id.teamID)) {
    reallyDeleteTeam(props);
  }
}

function deleteTeamButton(props) {
  if(admin) {
    return (<div class="flex-pack">
      {imageButton(() => deleteTeam(props), del, 'delete')}
    </div>);
  }
}

function showEditTeamPanel(props) {
  return (<div>
    <div>Short Name: {props.SPteam.id.teamID}</div>
    <div>Long Name:
      <input type="text" value={props.SPnewTeamDisplay}
             onChange={(e)=>props.setters.setSPnewTeamDisplay(e.target.value)} />
    </div>
    <div class="flex-space">
      <div class="flex-pack">
        {imageButton(() => updateTeam(props), check, 'ok')}
        {imageButton(() => cancelEdit(props), cancel, 'cancel')}
      </div>
      {deleteTeamButton(props)}
    </div>
  </div>);
}

function teamFunction(props) {
  if (addingTeam) {
    return createTeamPanel(props);
  } else if (editingTeam) {
    return showEditTeamPanel(props);
  } else if (isVoid(props.SPteam)) {
    return;
  } else {
    return listDrivers(props);
  }
}

function teamTitle(props) {
  if(props.SPteam === null || props.SPteam === undefined) {
    return;
  } else {
    return (<div class="selTitle">{props.SPteam.displayName}</div>);
  }
}

function makeTeamPanel(props) {
  return (<div>
    <div class="vcd">
      {listTeams(props, props.SPteam, (team) => selectTeam(props, team), 0, true)}
      {imageButton(() => startAddingTeam(props), addButton, 'add')}
      {showEditTeamButton(props)}
    </div>
    {teamTitle(props)}
    {teamFunction(props)}
  </div>);
}

function topTab(props) {
  switch (props.SPswitch) {
    case TAB_NONE:
    return;
    case TAB_SCHEDULE:
    return makeSchedulePanel(props);
    case TAB_STANDINGS:
    return makeStandingsPanel(props);
    case TAB_TEAMS:
    return makeTeamPanel(props);
    case TAB_RUN:
    return runRacePanel(props);
    default:
    return;
  }
}

function LeagueFunction(props) {
  if (props.SPleague === null) { return (<div>no league selected</div> )}
  return (<div>
      <div class="selTitle"><span>{props.SPleague.display}</span></div>
      <div class="leagueFunction">
          <button class={isActive(props.SPswitch, TAB_TEAMS)} onClick={() => selectTeams(props)}>Teams</button>
          <button class={isActive(props.SPswitch, TAB_SCHEDULE)} onClick={() => selectSchedule(props)}>Schedule</button>
          <button class={isActive(props.SPswitch, TAB_STANDINGS)} onClick={() => selectStandings(props)}>Standings</button>
          <button class={isActive(props.SPswitch, TAB_RUN)} onClick={() => selectNextRace(props)}>Next Race</button>
      </div>
      <div>{topTab(props)}</div>
  </div>);
};

function showLeagueAdder(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Adding New League</span></div>
    <div>Short Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueS(e.target.value)}/></div>
    <div>Long Name: <input type="text" onChange={(e)=>props.setters.setSPnewLeagueL(e.target.value)}/></div>
    {imageButton(() => createLeague(props), check, 'ok')}
    {imageButton(() => cancelAdd(props), cancel, 'cancel')}
  </div>);
}

function showEditLeagueButton(props) {
  if(isVoid(props.SPleague)) {
    return;
  }

  return (imageButton(() => startEditingLeague(props), pencil, 'edit'));
}

function tryAdmin(props) {
  if (admin) {
    admin = false;
    gear_icon = gear;
  } else if (window.prompt("Admin password:") === "hardcode") {
    admin = true;
    gear_icon = gear_admin;
  } //TODO move this to server and make editable
  provoke(props);
}

function settingsButton(props) {
  return (imageButton(() => tryAdmin(props), gear_icon, 'admin'));
}

function showLeagueSelector(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues"><span>Season Pass Leagues</span><span>{settingsButton(props)}</span></div>
    <div class="vcd">
      { listLeagues(props) }
      { imageButton(() => startAddingLeague(props), addButton, 'add') }
      { showEditLeagueButton(props)}
    </div>
    {LeagueFunction(props)}
  </div>);
}

function editRaceButton(props) {
  if (isVoid(props.SPrace) ||
      props.SPrace.id.leagueID !== props.SPleague.id ||
      props.SPrace.id.seasonNumber !== props.SPseason.id.seasonNumber) {
    return;
  } else {
    return (imageButton(() => startEditingRace(props), pencil, 'edit'));
  }
}

function editResultsButton(props) {
  if(
       isVoid(props.SPrace) ||
       props.SPrace.id.leagueID !== props.SPleague.id ||
       props.SPrace.id.seasonNumber !== props.SPseason.id.seasonNumber
   ) {
     return;
   } else {
     return (imageButton(() => startEditingResults(props), flagButton, 'results'));
   }
}

function showRaceSelector(props) {
  if(isVoid(props.SPleague) || isVoid(props.SPseason) ||
     props.SPseason.id.leagueID !== props.SPleague.id) {
    return;
  }

  return (<div class="Pass-top">
    <div class="selTitle"><span>{props.SPleague.id} {props.SPseason.displayName} Schedule</span></div>
    <div>
      {listRaces(props)}
      <div>
        {imageButton(() => startAddingRace(props), addButton, 'add')}
        {editRaceButton(props)}
        {editResultsButton(props)}
      </div>
    </div>
  </div>);
}

function updateLeague(props) {
  props.axios.get(URLH+'update/league/'+props.SPleague.id+
    '?display='+props.SPnewLeagueL
  ).then((response) => reloadAll(props)).catch((error) => {
    if(error.response) {
      props.setters.setBanner("Error: "+error.response.data);
    } else {
      props.setters.setBanner("no deleteLeagues response!");
    }
  });
  cancelEdit(props);
  props.SPleague.display = props.SPnewLeagueL;
}

function reallyDeleteLeague(props) {
  props.axios.get(URLH+'delete/league/'+props.SPleague.id
  ).then((response) => reloadAll(props)).catch((error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no deleteLeagues response!");
      }
  });
  cancelEdit(props);
}

function deleteLeague(props) {
  if(window.confirm("Delete League "+props.SPleague.id)) {
     reallyDeleteLeague(props);
  }
}

function deleteLeagueButton(props) {
  if(admin) {
    return (<div class="flex-pack">
      {imageButton(() => deleteLeague(props), del, 'delete')}
    </div>);
  }
}

function selectResultTeam(sel, props) {
  props.setters.setSPresultTeam(sel);
  props.setters.setSPresultDriver(null);
}

function showLeagueEditor(props) {
  return (<div class="Pass-top">
      <div class="Pass-leagues"><span>Editing League {props.SPleague.id} ({props.SPleague.display})</span></div>
      <div>Short Name: {props.SPleague.id}</div>
      <div>Long Name: <input type="text" value={props.SPnewLeagueL}
                             onChange={(e)=>props.setters.setSPnewLeagueL(e.target.value)}/>
      </div>
      <div class="flex-space">
        <div class="flex-pack">
          {imageButton(() => updateLeague(props), check, 'ok')}
          {imageButton(() => cancelEdit(props), cancel, 'cancel')}
        </div>
        {deleteLeagueButton(props)}
      </div>
  </div>);
}

function listResultDrivers(props) {
  if(!isVoid(props.SPresultTeam) && props.SPresultTeam.id.leagueID === props.SPleague.id) {
    return (<span class="yellow-box">
      {displayPills(
        filterDriversByLeagueAndTeam(props.SPdrivers, props.SPleague, props.SPresultTeam),
        props.SPresultDriver, props.setters.setSPresultDriver,
        (driver) => driver.displayName, sameDriver, props, VERTICAL, false
      )}
    </span>);
  }
}

function unselectResult(props) {
  props.setters.setSPresultTeam(null);
  props.setters.setSPresultDriver(null);
  props.setters.setSPinjuryPending(false);
  props.setters.setSPinjuryDuration(-1);
}

function pushResult(props, raceComplete, racesMissed) {
  if (racesMissed === -1) {
    alert("Must select Injury Duration First");
    return;
  }
  props.SPresultList.push({
    finished: raceComplete,
    injuryDuration: racesMissed,
    teamID: props.SPresultTeam.id.teamID,
    driverName: props.SPresultDriver.displayName,
    driverNumber: props.SPresultDriver.id.driverNumber,
    id: {
      place: 1+props.SPresultList.length,
      leagueID: props.SPleague.id,
      seasonNumber: props.SPresultRace.id.seasonNumber,
      raceNumber: props.SPresultRace.id.raceNumber
    }
  });
  unselectResult(props);
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
function injuryPills(props) {
  return displayPills(injuryNums, props.SPinjuryDuration, props.setters.setSPinjuryDuration,
                      getInjuryText, (x, y) => x == y, props, VERTICAL, false
  );
}

function resultConfirmationButtons(props) {
  if(!isVoid(props.SPresultDriver) && !props.SPinjuryPending) {
    return (<span class="yellow-box">
      <div>{imageButton(() => pushResult(props, true, 0), check, 'enter')}</div>
      <div>{imageButton(() => startEditingInjury(props), ambo, 'injury')}</div>
      <div>{imageButton(() => unselectResult(props), cancel, 'cancel')}</div>
    </span>);
  } else if (props.SPinjuryPending) {
    return (<span class="pink-box">
      <span>{imageButton(() => pushResult(props, false, props.SPinjuryDuration), noflag, 'nofinish')}</span>
      <span>{imageButton(() => pushResult(props, true, props.SPinjuryDuration), flagButton, 'finished')}</span>
      <span>{imageButton(() => unselectResult(props), cancel, 'cancel')}</span>
      <div>
         {injuryPills(props)}
      </div>
    </span>);
  }
}

function backResult(props) {
  props.SPresultList.pop();
  provoke(props);
}

function stopEditingResults(props) {
  props.setters.setSPresultRace(null);
  props.setters.setSPpreview(null);
}

function sendResult(props) {
  props.axios.post(URLH+"replace/results/"
    +props.SPresultRace.id.leagueID+'/'
    +props.SPresultRace.id.seasonNumber+'/'
    +props.SPresultRace.id.raceNumber,
    props.SPresultList
  ).then((response) => stopEditingResults(props)).catch(
    (error) => {
      if(error.response) {
        props.setters.setBanner("errro");
      } else {
        props.setters.setBanner("no sendResult response!");
      }
    }
  );
}

function resultButtons(props) {
  if(oldResults && !admin) {
    return (<div>
      {imageButton(()=>cancelResults(props), cancel, 'cancel')}
    </div>);
  }
  return (<div>
    {imageButton(()=>backResult(props), back, 'back')}
    {imageButton(()=>cancelResults(props), cancel, 'cancel')}
    {imageButton(()=>sendResult(props), check, 'ok')}
  </div>);
}

function showResultEditor(props) {
  return (<div class="Pass-top">
    <div class="Pass-leagues">Editing Results for League {props.SPleague.id}</div>
    <div class="selTitle">
      Race {props.SPresultRace.id.seasonNumber}.{props.SPresultRace.id.raceNumber}
      ({props.SPresultRace.displayName} @ {props.SPresultRace.trackName})
    </div>
    <div class="flex-pack">
      <span>{resultTable(props)}</span>
      <span class="yellow-box">
        {maybeListTeams(props, props.SPresultTeam, (team) => selectResultTeam(team, props), VERTICAL, false)}
      </span>
      {listResultDrivers(props)}
      {resultConfirmationButtons(props)}
    </div>
    {resultButtons(props)}
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

function resultRow(props, row) {
  return (<tr>
    <td>{row.id.place}</td>
    <td>{row.teamID}</td>
    <td>{row.driverName}</td>
    <td>{YN(row.finished)}</td>
    <td>{blank0(row.injuryDuration)}</td>
  </tr>);
}

function resultRows(props) {
  if (!isVoid(props.SPresultList)) {
    return props.SPresultList.map((row) => resultRow(props, row))
  }
}

function resultTable(props) {
  return (<div>
    <table class="stable">
      <tr><th>Place</th><th>Team</th><th>Driver</th><th>Finished</th><th>Injury</th></tr>
      {resultRows(props)}
    </table>
  </div>);
}

export default function PassPanel(props) {
  if (addingLeague) {
    return showLeagueAdder(props);
  } else if (editingLeague) {
    return showLeagueEditor(props);
  } else if (!isVoid(props.SPresultRace)) {
    return showResultEditor(props);
  } else {
    return showLeagueSelector(props);
  }
}