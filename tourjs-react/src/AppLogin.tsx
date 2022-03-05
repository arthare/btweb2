import React, { useEffect } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppUserContextType } from './AppUserContext';

export const AppUserContextInstance = React.createContext<AppUserContextType>(new AppUserContextType());

function App() {
  
  return (
    <div className="App">
      Deprecated login screen?
    </div>
  );
}

export default App;
