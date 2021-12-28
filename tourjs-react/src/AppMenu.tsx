import React, { useEffect } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";

function App() {
  const auth0 = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {

  }, []);

  return (
    <div className="App">
      It's the menu, {auth0.user?.email}!

      <button onClick={()=>navigate('/test-hacks')}>Test Hacks</button>
    </div>
  );
}

export default App;
