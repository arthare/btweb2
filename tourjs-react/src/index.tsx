import React from "react";
import ReactDOM from "react-dom";
import AppLogin from "./AppLogin";
import { Auth0Context, Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppMenu from "./AppMenu";
import AppTestHacks from './AppTestHacks';
import Helmet from 'react-helmet';
import AppRace from "./AppRace";
import ContextLoaders from './index-contextLoaders';
import AppStaticResults from "./AppStaticResults";

let origin = window.location.origin;
if(!origin.includes('dev.')) {
  origin = 'https://tourjs.ca';
}

ReactDOM.render(<>
    <ContextLoaders>
      <Auth0Provider domain="dev-enlwsasz.us.auth0.com" clientId="sVfg9SlUyknsFxwh74CDlseT0aL7iWS8" redirectUri={origin}>
        <Helmet>
          <script src="https://kit.fontawesome.com/d8b18df8ff.js" crossOrigin={"anonymous" as any}></script>
        </Helmet>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AppLogin />} />
              <Route path="/" element={<AppMenu />} />
              <Route path="/test-hacks" element={<AppTestHacks />} />
              <Route path="/race/:gameId" element={<AppRace />} />
              <Route path="/results/:resultKey" element={<AppStaticResults />} />
            </Routes>
        </BrowserRouter>
      </Auth0Provider>
    </ContextLoaders>
  </>
  ,
  document.getElementById("root")
);