import React from 'react';
import "./Login.css";

function isEmpty(str) {
    return str === null || str === undefined || str.trim().length < 1;
}

function processLogin(setters, resp) {
  if(isEmpty(resp.data.accountName)) {
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

export function AccountPanel(props) {
  return (
    <div>
      <div>Account Name: {props.user}</div>
      <div>Display Name:
        <button onClick={() => props.setters.setBanner("Display Edit not implemented")}>edit</button>
      </div>
      <div>Contact Info:
        <button onClick={() => props.setters.setBanner("Contact not implemented")}>edit</button>
      </div>
      <button onClick={() => doLogout(props.axios, props.setters)}>logout</button>
    </div>
  );
}

export function loginDisplay(user) {
  if(isEmpty(user)) {
    return <li class="App-right">[NOT LOGGED IN]</li>;
  } else {
    return <li class="App-right">{user}</li>;
  }
}

function doLogin(axios, setters, login, pass) {
  if (isEmpty(login)) {
    setters.setBanner('Account name may not be blank');
    return;
  }
  axios.get("http://10.0.0.143:32109/login?user="+login+"&pass="+pass
  ).then((r) => processLogin(setters, r)
  ).catch((r) => setters.setBanner('Network Error'));
}

function doCreate(axios, setters, login, pass) {
  if (isEmpty(login)) {
    setters.setBanner('Account name may not be blank');
    return;
  }
  //TODO reject unsafe/datahack login names and passwords
  //TODO implement creation and give feedback, set user/main
  axios.get("http://10.0.0.143:32109/createAccount?user="+login+"&pass="+pass
  ).then((resp) => processLogin(setters, resp)
  ).catch((r) => setters.setBanner('Network Error'));
}

export function LoginPanel(props) {
  return (
    <div>
      <div>Username: <input type="text" onChange={(e)=>props.setters.setLoginName(e.target.value)}/></div>
      <div>Password: <input type="password" onChange={(e)=>props.setters.setPassword(e.target.value)}/></div>
      <button onClick={() => doLogin(props.axios, props.setters, props.login, props.pass)}>Login</button>
      <button onClick={() => doCreate(props.axios, props.setters, props.login, props.pass)}
              class="button-margin">Create New Account</button>
    </div>
  );
}