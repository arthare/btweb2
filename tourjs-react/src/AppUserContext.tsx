import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { NavigateFunction } from "react-router-dom";
import { apiGet } from "./tourjs-client-shared/api-get";
import { TourJsAccount } from "./tourjs-shared/signin-types";


export class AppUserContextType {
  auth0:Auth0Client;

  constructor() {
    this.auth0 = new Auth0Client({
      domain:"dev-enlwsasz.us.auth0.com",
      client_id:"sVfg9SlUyknsFxwh74CDlseT0aL7iWS8",
      redirect_uri:window.location.origin,
    });
  }

  gate(fnUseState, fnUseEffect, fnNavigate:NavigateFunction):TourJsAccount[] {

    let [authState, setAuthState] = fnUseState(null);

    fnUseEffect(() => {
      const doIt = async (allowTryAgain:boolean) => {

        try {
          // this forces auth0 to actually sign in
          const token = await this.auth0.getTokenSilently()
          
        } catch(e) {
          debugger;
        }
        

        const isAuthed = await this.auth0.isAuthenticated();
        if(isAuthed) {
          console.log("we are authenticated");
          const user = await this.auth0.getUser();
          const tourJsUser = await apiGet('user-account', {sub:user.sub});
          console.log("got tourjs user ", tourJsUser);
          setAuthState(tourJsUser);
        } else {
          // maybe try again
          console.log("not authed ");
          fnNavigate('/login');
        }
        
      }
      doIt(true);
    }, []);

    return [authState];
  }
}