import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import EventEmitter from "events";
import { NavigateFunction } from "react-router-dom";
import { apiGet, secureApiGet } from "./tourjs-client-lib/api-get";
import { TourJsAccount, TourJsAlias } from "./tourjs-api-lib/signin-types";



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
      console.log("got a useEffect about ", auth0.isLoading, auth0.isAuthenticated);
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
              setTimeout(async () => {
                console.log("going to try for access token");
                let at;
                try {
                  console.log("getting access token silently");
                  at = await auth0.getAccessTokenSilently();
                  console.log("got access token silently");
                } catch(e:any) {
                  console.log("access token silent failure: ", e);
                  at = await auth0.loginWithPopup();
                  console.log("popup result");
                }
                
                console.log("access token acquire ", at);
                if(!at) {
                  console.log("gonna refresh!");
                  auth0.loginWithRedirect();
                }
                
              }, 500);

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
    } else {
      // your selection is still valid, but since we're refreshing, it might have changed in stats or picture or something
      console.log("your selected alias is still valid, with stats ", selectionStillValid);
      this.emit('aliasChange');
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