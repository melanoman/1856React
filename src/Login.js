import React from 'react';
import "./Login.css";

function processLogin(setters, resp) {
  if(resp.data.accountName === '') {
    setters.setUser(null);
    setters.setBanner('Login Failed');
    setters.setMainSwitch(-1);
  } else {
    setters.setUser(resp.data.displayName);
    setters.setBanner(null);
    setters.setMainSwitch(1);
  }
}

function doLogout(axios, setters) {
  setters.setUser(null);
  setters.setMainSwitch(-1);
  axios.get("http://10.0.0.143:32109/logout").catch((e) => setters.setBanner('Network Error'));
}

function accountPanel(axios, setters, user) {
  return (
    <div>
      <div>Account Name: {user}</div>
      <div>Display Name: <button onClick={() => setters.setBanner("Display Edit not implemented")}>edit</button></div>
      <div>Contact Info: <button onClick={() => setters.setBanner("Contact not implemented")}>edit</button></div>
      <button onClick={() => doLogout(axios, setters)}>logout</button>
    </div>
  );
}

function loginDisplay(user) {
  if(user === null) {
    return <li class="App-right">_guest_</li>;
  } else {
    return <li class="App-right">{user}</li>;
  }
}

function doLogin(axios, setters, login, pass) {
  axios.get("http://10.0.0.143:32109/login?user="+login+"&pass="+pass
  ).then((r) => processLogin(setters, r)
  ).catch((r) => setters.setBanner('Network Error'));
}

function doCreate(axios, setters, login, pass) {
  //TODO reject unsafe/datahack login names and passwords
  //TODO implement creation and give feedback, set user/main
  axios.get("http://10.0.0.143:32109/createAccount?user="+login+"&pass="+pass
  ).then((resp) => processLogin(setters, resp)
  ).catch((r) => setters.setBanner('Network Error'));
}

function loginPanel(axios, setters, login, pass) {
  return (
    <div>
      <div>Username: <input type="text" onChange={(e)=>setters.setLoginName(e.target.value)}/></div>
      <div>Password: <input type="password" onChange={(e)=>setters.setPassword(e.target.value)}/></div>
      <button onClick={() => doLogin(axios, setters, login, pass)}>Login</button>
      <button onClick={() => doCreate(axios, setters, login, pass)} class="button-margin">Create New Account</button>
    </div>
  );
}

export {
  loginDisplay,
  loginPanel,
  accountPanel
}