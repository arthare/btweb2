import React, { useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './AppLogin.scss';
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppUserContextInstance } from './AppLogin';
import UserProfileMini from './Components/UserProfileMini';
import { TourJsAlias } from './tourjs-shared/signin-types';
import { AppUserContextType } from './ContextUser';
import { secureApiPost } from './tourjs-client-shared/api-get';

function App() {
  const navigate = useNavigate();

  const authContext = useContext<AppUserContextType>(AppUserContextInstance);
  const auth0 = useAuth0();

  const [authState] = authContext.gate(auth0, useState, useEffect, navigate);
  const [selectedAliasId, setSelectedAliasId] = useState<number>(-1);

  useEffect(() => {
    if(authContext) {
      setSelectedAliasId(authContext.selectedAliasId);
    }
  }, [authContext]);


  const onChangeAlias = (alias:TourJsAlias) => {
    // we gotta tell the server about this change
    console.log("we should tell the server they want to change to ", alias);

    secureApiPost('alias', auth0, alias);
  }
  const onSelectAlias = (alias:TourJsAlias, index:number) => {
    authContext.setSelectedAlias(alias);
    setSelectedAliasId(alias.id);
  }
  return (
    <div className="App">
      <h3>Wheels With Friends</h3>
      {authState && (<>
        <p>Welcome <b>{authState.username}</b>!  You have {authState.aliases.length} rider profiles.</p>
        {authState.aliases.map((alias, ix) => {
          return <UserProfileMini alias={alias} fnOnUpdate={(alias:TourJsAlias) => onChangeAlias(alias)} selected={selectedAliasId === alias.id} fnOnSelect={()=>onSelectAlias(alias, ix)} />
        })}
      </>) || (
        <p>Logging in...</p>
      )}

    </div>
  );
}

export default App;
