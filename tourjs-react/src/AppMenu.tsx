import React, { useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppUserContextInstance } from './AppLogin';

function App() {
  const navigate = useNavigate();

  const authContext = useContext(AppUserContextInstance);

  const [authState] = authContext.gate(useAuth0, useState, useEffect, navigate);

  useEffect(() => {

  }, []);

  return (
    <div className="App">
      <h3>Wheels With Friends</h3>
      {authState && (
        <p>Welcome <b>{authState.username}</b>!  You have {authState.aliases.length} rider profiles.</p>
      ) || (
        <p>Logging in...</p>
      )}

    </div>
  );
}

export default App;
