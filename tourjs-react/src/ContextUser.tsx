import { Auth0ContextInterface, useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { Auth0Client } from "@auth0/auth0-spa-js";
import { NavigateFunction } from "react-router-dom";
import { apiGet } from "./tourjs-client-shared/api-get";
import { TourJsAccount } from "./tourjs-shared/signin-types";



export class AppUserContextType {

  constructor() {

  }
  gate(fnUseAuth0:()=>Auth0ContextInterface<Auth0User>, fnUseState, fnUseEffect, fnNavigate:NavigateFunction):TourJsAccount[] {

    const auth0 = fnUseAuth0();
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
              const tourJsUser = await apiGet('user-account', {sub:auth0.user.sub});
              setAuthState(tourJsUser);
            } else {
              console.log("you are not authenticated");
              auth0.loginWithRedirect();
            }
          }
        }
      }
      doIt();
    }, [auth0.isLoading, auth0.isAuthenticated])

    return [authState];
  }
}