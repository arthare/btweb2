import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import EventEmitter from "events";
import { NavigateFunction } from "react-router-dom";
import { apiGet, secureApiGet } from "./tourjs-client-shared/api-get";
import { TourJsAccount, TourJsAlias } from "./tourjs-shared/signin-types";



export class AppAuthContextType extends EventEmitter {

  _myAccount:TourJsAccount|null = null;
  _idSelectedAlias = -1;

  constructor() {
    super();
    console.log("constructing AppAuthContextType");
  }
  gate(auth0:Auth0ContextInterface<Auth0User>, fnUseState, fnUseEffect, fnNavigate:NavigateFunction):[TourJsAccount, (acct:TourJsAccount)=>void] {

    let [authState, setAuthState] = fnUseState(this._myAccount);

    fnUseEffect(() => {
      const doIt = async () => {
        if(auth0) {
          if(auth0.isLoading) {
            // nothing to do
          } else {
            if(auth0.isAuthenticated) {
              if(!this._myAccount) {
                const tourJsUser = await secureApiGet('user-account', auth0, {sub:auth0.user.sub, nickname: auth0.user.nickname || auth0.user.email});
                this._myAccount = tourJsUser;
                this._idSelectedAlias = -1;

                setAuthState(tourJsUser);
              } else {
                setAuthState(this._myAccount);
              }
              
            } else {
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
    const tourJsUser:TourJsAccount = await secureApiGet('user-account', auth0, {sub:auth0.user.sub, nickname: auth0.user.nickname || auth0.user.email});
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
  setSelectedAlias(alias:TourJsAlias|null) {
    if(!alias) {
      this._idSelectedAlias = -1;
    } else {
      console.log("they have picked alias = ", alias);
      this._idSelectedAlias = alias.id;
    }
    this.emit('aliasChange');
  }
  get selectedAliasId() {
    return this._idSelectedAlias;
  }
}