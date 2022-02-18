import React from "react";
import ReactDOM from "react-dom";
import AppLogin from "./AppLogin";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppMenu from "./AppMenu";
import AppTestHacks from './AppTestHacks';

ReactDOM.render(
  <Auth0Provider domain="dev-enlwsasz.us.auth0.com" clientId="sVfg9SlUyknsFxwh74CDlseT0aL7iWS8" redirectUri={window.location.origin}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLogin />} />
        <Route path="/menu" element={<AppMenu />} />
        <Route path="/test-hacks" element={<AppTestHacks />} />
      </Routes>
    </BrowserRouter>
  </Auth0Provider>
  ,
  document.getElementById("root")
);