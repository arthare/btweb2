import React, { useEffect } from "react";
import { useState } from "react";
import { AppAuthContextType } from "./ContextAuth";
import { AppPlayerContextType } from "./ContextPlayer";

export const AppAuthContextInstance = React.createContext<AppAuthContextType>(null);
export const AppPlayerContextInstance = React.createContext<AppPlayerContextType>(null);

export default function ContextLoader(props:{children}) {
  
  let [authCtx, setAuthCtx] = useState(null);
  let [playerCtx, setPlayerCtx] = useState(null);

  useEffect(() => {
    setAuthCtx(new AppAuthContextType());
    setPlayerCtx(new AppPlayerContextType());
  }, []);

  return (
    <AppAuthContextInstance.Provider value={authCtx} >
      <AppPlayerContextInstance.Provider value={playerCtx} >
        {authCtx && playerCtx && props.children}
      </AppPlayerContextInstance.Provider>
    </AppAuthContextInstance.Provider>
  )
}