import { Auth0ContextInterface, User as Auth0User } from "@auth0/auth0-react";
import { useContext, useEffect, useState } from "react";
import { AppAuthContextInstance, AppPlayerContextInstance } from "../index-contextLoaders";
import { AppAuthContextType } from "../ContextAuth";
import { AppPlayerContextType, UserSetupParameters } from "../ContextPlayer";
import { secureApiPost } from "../tourjs-client-shared/api-get";
import { TourJsAccount, TourJsAlias } from "../tourjs-shared/signin-types";
import UserProfileMini from "./UserProfileMini";
import './VerticalAlign.scss';

enum UserProfileState {
  LoggingIn,
  NoAliases,
  NoAliasSelected,
  AliasSelected,
}

export default function VerticalAlign(props:{children:any, className:string}) {
  return <div className={`${props.className} VerticalAlign__Container`}>
    <div className="VerticalAlign__Gap"></div>
    <div className="VerticalAlign__Content">{props.children}</div>
    <div className="VerticalAlign__Gap"></div>
  </div>
}