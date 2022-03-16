import { Auth0ContextInterface, User as Auth0User } from "@auth0/auth0-react";
import { useContext, useEffect, useState } from "react";
import { AppAuthContextInstance, AppPlayerContextInstance } from "../index-contextLoaders";
import { AppAuthContextType } from "../ContextAuth";
import { AppPlayerContextType, UserSetupParameters } from "../ContextPlayer";
import { secureApiPost } from "../tourjs-client-shared/api-get";
import { TourJsAccount, TourJsAlias } from "../tourjs-shared/signin-types";
import UserProfileMini from "./UserProfileMini";

export default function UserProfilePicker(props:{authState:TourJsAccount, auth0:Auth0ContextInterface<Auth0User>, fnOnChangeUser:()=>void, authContext:AppAuthContextType, playerContext:AppPlayerContextType}) { 

  const [selectedAliasId, setSelectedAliasId] = useState<number>(-1);
  const onChangeAlias = (alias:TourJsAlias) => {
    // we gotta tell the server about this change
    console.log("we should tell the server they want to change to ", alias);

    secureApiPost('alias', props.auth0, {user:props.auth0.user, alias});
    props.fnOnChangeUser();
  }
  const onSelectAlias = (alias:TourJsAlias, index:number) => {
    props.authContext.setSelectedAlias(alias);
    setSelectedAliasId(alias.id);

    const setupParams:UserSetupParameters = {
      name:alias.name,
      handicap:alias.handicap,
      imageBase64:alias.imageBase64 || null,
      bigImageMd5:null,
    }
    props.playerContext.addUser(setupParams);
  }

  const onAddNew = async () => {
    const name = prompt("Enter the name");
    if(name) {
      const handicap = prompt("Enter handicap/FTP (in watts)");
      if(handicap && ('' + parseInt(handicap)) === ('' + handicap)) {
        // valid number
        const newAlias = {
          name,
          handicap:parseInt(handicap),
          imageBase64:'',
          id:-1,
        }
        await secureApiPost('alias', props.auth0, {user:props.auth0.user, alias: newAlias});
        props.fnOnChangeUser();
        
      }
    }
    
  }

  useEffect(() => {
    if(props.authState && props.authContext && props.authState.aliases.length > 0) {
      // ok, we've got aliases.  let's just pick the first one
      onSelectAlias(props.authState.aliases[0], 0);
    }
  }, [props.authState, props.authContext])


  return (<>
    {props.authState && (<>
      <p>Welcome <b>{props.authState.username}</b>!  You have {props.authState.aliases.length} rider profiles.</p>
      {props.authState.aliases.map((alias, ix) => {
        return <UserProfileMini key={ix} alias={alias} fnOnUpdate={(alias:TourJsAlias) => onChangeAlias(alias)} selected={selectedAliasId === alias.id} fnOnSelect={() => onSelectAlias(alias, ix)} />
      })}
      
      <div className="UserProfilePicker__AddNew">
        <button className="UserProfilePicker__AddNew--Button" onClick={() => onAddNew()}>Add New</button>
      </div>
      
      </>) || (
        <p>Logging in...</p>
      )}
  </>)
}