import React, { useEffect } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppAuthContextType } from './ContextAuth';
import { AppPlayerContextType } from './ContextPlayer';

export const AppAuthContextInstance = React.createContext<AppAuthContextType>(new AppAuthContextType());
export const AppPlayerContextInstance = React.createContext<AppPlayerContextType>(new AppPlayerContextType());

function App() {
  
  return (
    <div className="App">
      Deprecated login screen?
    </div>
  );
}

export default App;
