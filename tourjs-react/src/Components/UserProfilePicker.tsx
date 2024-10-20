import { Auth0ContextInterface, User as Auth0User } from "@auth0/auth0-react";
import { useContext, useEffect, useState } from "react";
import {
  AppAuthContextInstance,
  AppPlayerContextInstance,
} from "../index-contextLoaders";
import { AppAuthContextType } from "../ContextAuth";
import { AppPlayerContextType, UserSetupParameters } from "../ContextPlayer";
import { secureApiPost } from "../tourjs-client-lib/api-get";
import { TourJsAccount, TourJsAlias } from "../tourjs-api-lib/signin-types";
import UserProfileMini from "./UserProfileMini";
import "./UserProfilePicker.scss";

enum UserProfileState {
  LoggingIn,
  NoAliases,
  NoAliasSelected,
  AliasSelected,
}

export default function UserProfilePicker(props: {
  authState: TourJsAccount;
  auth0: Auth0ContextInterface<Auth0User>;
  fnOnChangeUser: () => void;
  authContext: AppAuthContextType;
  playerContext: AppPlayerContextType;
}) {
  const [selectedAliasId, setSelectedAliasId] = useState<number>(-1);
  const onChangeAlias = (alias: TourJsAlias) => {
    // we gotta tell the server about this change
    console.log("we should tell the server they want to change to ", alias);

    secureApiPost("alias", props.auth0, { user: props.auth0.user, alias });

    if (alias.id === props.authContext.selectedAliasId) {
      // they modified the alias that we currently have selected, so we should tell the playerContext about it
      const setupParams: UserSetupParameters = {
        name: alias.name,
        handicap: alias.handicap,
        imageBase64: alias.imageBase64 || null,
        bigImageMd5: null,
      };
      props.playerContext.addUser(setupParams);
    }
    props.fnOnChangeUser();
  };
  const onSelectAlias = (alias: TourJsAlias, index: number) => {
    props.authContext.setSelectedAlias(alias);
    setSelectedAliasId(alias.id);

    const setupParams: UserSetupParameters = {
      name: alias.name,
      handicap: alias.handicap,
      imageBase64: alias.imageBase64 || null,
      bigImageMd5: null,
    };
    props.playerContext.addUser(setupParams);
    props.fnOnChangeUser();
  };

  const onLogOut = () => {
    props.auth0.logout();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const onAddNew = async () => {
    const name = prompt("Enter the name");
    if (name) {
      const handicap = prompt("Enter handicap/FTP (in watts)");
      if (handicap && "" + parseInt(handicap) === "" + handicap) {
        // valid number
        const newAlias = {
          name,
          handicap: parseInt(handicap),
          imageBase64: "",
          id: -1,
        };
        await secureApiPost("alias", props.auth0, {
          user: props.auth0.user,
          alias: newAlias,
        });
        props.fnOnChangeUser();
      }
    }
  };

  useEffect(() => {
    if (
      props.authState &&
      props.authContext &&
      props.authState?.aliases.length > 0
    ) {
      // ok, we've got aliases.
      if (selectedAliasId < 0 && props.authContext.getSelectedAlias()) {
        console.log(
          "useEffect: user profile picker has ",
          props.authState.aliases,
          " to look at in state",
          UserProfileState[state],
        );
        const pickedAlias = props.authState.aliases.find(
          (al) => al.id === props.authContext.getSelectedAlias().id,
        );
        console.log("picked alias = ", pickedAlias);
        onSelectAlias(pickedAlias, -1);
      }
    }
  }, [props.authState, props.authContext, selectedAliasId]);

  let state: UserProfileState = UserProfileState.NoAliases;
  if (!props.authState) {
    state = UserProfileState.LoggingIn;
  } else if (props.authState?.aliases?.length > 0) {
    if (props.authContext.getSelectedAlias()) {
      state = UserProfileState.AliasSelected;
    } else {
      state = UserProfileState.NoAliasSelected;
    }
  }

  return (
    <div className="UserProfilePicker__Container user-profile-picker">
      <h2>User Setup</h2>
      {state === UserProfileState.LoggingIn && <p>Logging in...</p>}
      {state === UserProfileState.NoAliasSelected && (
        <>
          <p>
            Welcome <b>{props.authState.username}</b>! You have{" "}
            {props.authState.aliases.length} rider profiles. Pick one to ride
            today.{" "}
            <a href="#" onClick={() => onLogOut()}>
              Logout
            </a>
          </p>
          {props.authState.aliases.map((alias, ix) => {
            return (
              <UserProfileMini
                key={ix}
                alias={alias}
                fnOnUpdate={(alias: TourJsAlias) => onChangeAlias(alias)}
                selected={false}
                fnOnSelect={() => onSelectAlias(alias, ix)}
              />
            );
          })}

          <div className="UserProfilePicker__AddNew">
            <button
              className="UserProfilePicker__AddNew--Button"
              onClick={() => onAddNew()}
            >
              Add New
            </button>
          </div>
        </>
      )}
      {state === UserProfileState.NoAliases && (
        <>
          <p>
            Welcome <b>{props.authState.username}</b>! You need to set up a
            rider profile (name and handicap).
          </p>
          <div className="UserProfilePicker__AddNew">
            <button
              className="UserProfilePicker__AddNew--Button"
              onClick={() => onAddNew()}
            >
              Add New
            </button>
          </div>
        </>
      )}
      {state === UserProfileState.AliasSelected && (
        <>
          <p>
            You're going to ride with{" "}
            {props.authContext?.getSelectedAlias().name}
          </p>
          <UserProfileMini
            alias={props.authContext.getSelectedAlias()}
            fnOnUpdate={(alias: TourJsAlias) => onChangeAlias(alias)}
            selected={true}
            fnOnSelect={() => {}}
          />
          <button
            className="UserProfilePicture__Change"
            onClick={() => {
              props.authContext.setSelectedAlias(null);
              setSelectedAliasId(-1);
            }}
          >
            Change My Selected Profile
          </button>
        </>
      )}
    </div>
  );
}
