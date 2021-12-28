import React, { useEffect } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";

function assertThrow(f:any, reason?:string) {
  if(!f) {
    debugger;
    throw new Error(reason || "assertThrow call");
  }
}

function App() {
  const auth0 = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    
    function attemptLogin() {
      assertThrow(!auth0.isAuthenticated && !auth0.isLoading)
      return auth0.loginWithRedirect();
    }

    // startup: check if we're logged in
    if(auth0.isLoading) {

    } else {
      // authorization is done loading

      if(auth0.isAuthenticated) {
        navigate('/menu');
      } else {
        attemptLogin();
      }
    }
  }, [auth0.isLoading]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>

    </div>
  );
}

export default App;
