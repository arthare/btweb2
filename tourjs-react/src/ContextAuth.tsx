import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { NavigateFunction } from "react-router-dom";
import { apiGet, secureApiGet } from "./tourjs-client-shared/api-get";
import { TourJsAccount, TourJsAlias } from "./tourjs-shared/signin-types";



export class AppAuthContextType {

  _myAccount:TourJsAccount|null = null;
  _idSelectedAlias = -1;

  constructor() {

  }
  gate(auth0:Auth0ContextInterface<Auth0User>, fnUseState, fnUseEffect, fnNavigate:NavigateFunction):[TourJsAccount, (acct:TourJsAccount)=>void] {

    let [authState, setAuthState] = fnUseState(null);

    fnUseEffect(() => {
      const doIt = async () => {
        if(auth0) {
          if(auth0.isLoading) {
            // nothing to do
            console.log("auth0 loading");
          } else {
            console.log("auth0 done loading");
            if(auth0.isAuthenticated) {
              console.log("you are authenticated! ", auth0.user);
              if(!this._myAccount) {
                const tourJsUser = await secureApiGet('user-account', auth0, {sub:auth0.user.sub});
                this._myAccount = tourJsUser;
                this._idSelectedAlias = this._myAccount.aliases[0]?.id || -1;

                setAuthState(tourJsUser);
              } else {
                setAuthState(this._myAccount);
              }
              
            } else {
              console.log("you are not authenticated");
              auth0.loginWithRedirect();
            }
          }
        }
      }
      doIt();
    }, [auth0.isLoading, auth0.isAuthenticated])

    return [authState, setAuthState];
  }

  async refreshAliases(auth0:Auth0ContextInterface<Auth0User>, setAuthState:(TourJsAccount)=>void) {
    const tourJsUser:TourJsAccount = await secureApiGet('user-account', auth0, {sub:auth0.user.sub});
    setAuthState(tourJsUser);
    this._myAccount = tourJsUser;

    const selectionStillValid = tourJsUser.aliases.find((alias) => alias.id === this._idSelectedAlias);
    if(!selectionStillValid) {
      if(tourJsUser.aliases.length > 0) {
        this.setSelectedAlias(tourJsUser.aliases[0]);
      }
    }
  }

  getSelectedAlias():TourJsAlias|null {
    if(this._myAccount) {
      return this._myAccount.aliases.find((alias) => alias.id === this._idSelectedAlias);
    } else {
      return null;
    }
  }
  setSelectedAlias(alias:TourJsAlias) {
    this._idSelectedAlias = alias.id;
  }
  get selectedAliasId() {
    return this._idSelectedAlias;
  }
}