import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { EventEmitter } from 'events';
import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  PermissionsAndroid,
  Image,
  TouchableOpacity,
} from 'react-native';
import { User, UserTypeFlags } from './common/User';
import { StoredData } from './App';
import ComponentButton from './ComponentButton';
import happyFaceB64 from './ScreenPlayerSetup-HappyFace';
import { DeviceContextInstance } from './ManagerBluetooth';

// require'd because this doesn't have any @types/ and I'm trying to keep this project free ot errors
const ReactNativeImagePicker = require('react-native-image-picker'); // https://github.com/react-native-image-picker/react-native-image-picker#options

export class SensorReading {
  tm: number;
  value: number;

  constructor(val:number) {
    this.value = val;
    this.tm = new Date().getTime();
  }
}

export enum TrainerMode {
  Unknown = '',
  Erg = 'Erg',
  Sim = 'Sim',
  Resistance = 'Resistance',
}

export class TrainerSensorReading extends SensorReading {
  lastSlope:number;
  lastResistance:number;
  lastErg:number;
  lastMode:TrainerMode;
  constructor(val:number) {
    super(val);
    this.lastSlope = 0;
    this.lastResistance = 0;
    this.lastErg = 0;
    this.lastMode = TrainerMode.Unknown;
  }
}

export interface DataHistorySample {
  tm:number;
  hrm:number;
  power:number;
  speed:number;
}

export class PlayerSetup extends EventEmitter {
  playerData:StoredData;

  static PLAYER_DATA_KEY = "PlayerSetup::playerData";

  private _user:User;
  private _locked:boolean;
  private _history:DataHistorySample[];

  constructor(playerData:StoredData) {
    super();
    console.log("instantiated with player data ", playerData);
    this.playerData = playerData;
    this._locked = false;
    this._user = new User(this.playerData.name, 80, this.playerData.handicap, UserTypeFlags.Local);
    this._history = [];
  }

  setPlayerDataLock(locked:boolean) {
    this._locked = locked;
  }

  setPlayerData(name:string, handicap:number, imageBase64:string, force:boolean):Promise<any> {
    if(this._locked) {
      return Promise.resolve();
    }

    const before = JSON.stringify(this.playerData);
    this.playerData = {
      ...this.playerData,
      name,
      handicap: handicap,
      rawPictureBase64: imageBase64,
    }
    const after = JSON.stringify(this.playerData);

    if(after !== before || force) {
      this._user = new User(this.playerData.name, 80, this.playerData.handicap, UserTypeFlags.Local);
      return AsyncStorage.setItem(PlayerSetup.PLAYER_DATA_KEY, JSON.stringify(this.playerData)).then(() => {
        this.emit('playerDataChange', this.playerData);
      })
    } else {
      return Promise.resolve();
    }
  }

  updateLocalUserHistory(tmNow:number) {
    this._history.push({
      tm: new Date().getTime(),
      hrm: this._user.getLastHrm(tmNow),
      power: this._user.getLastPower(),
      speed: this._user.getSpeed(),
    })
  }
  getLocalUserHistory(tmSinceWhen:number):DataHistorySample[] {
    return this._history.filter((hist) => hist.tm > tmSinceWhen);
  }

  getLocalUser():User {
    return this._user;
  }
}

const defaultPlayerData:StoredData = {
  name:"A cool name!",
  handicap:125,
  rawPictureBase64:happyFaceB64,
}

export const PlayerSetupInstance = React.createContext<PlayerSetup>(new PlayerSetup(defaultPlayerData));

interface ImagePickerResponseObject {
  //https://github.com/react-native-image-picker/react-native-image-picker#the-response-object
  didCancel: boolean;
  errorCode: any;
  errorMessage: string;
  base64:string;
  uri:string;
  width:number;
  height:number;
  fileSize:number;
  type:string; // mime type
  fileName:string;
}
interface ImagePickerOptions {
  mediaType?:"photo"|"video";
  maxWidth?:number;
  maxHeight?:number;
  videoQuality?:"low"|"high";
  durationLimit:number;
  quality:number;
  includeBase64:boolean;
  saveToPhotos:boolean;
}

const ComponentPlayerSetup = (props:{onDone:()=>void}) => {



  const ctx = useContext(PlayerSetupInstance);
  const deviceCtx = useContext(DeviceContextInstance);
  
  useEffect(() => {
    if(ctx && deviceCtx) {
      deviceCtx.setPlayerSetup(ctx);
    }
  }, [ctx, deviceCtx]);

  const defaultImage = {
    base64: ctx.playerData.rawPictureBase64,
    type: "image/jpeg",
  }

  let [name, setName] = useState<string>(ctx.playerData.name);
  let [handicap, setHandicap] = useState<string>('' + ctx.playerData.handicap);
  let [picture, setPicture] = useState<ImagePickerResponseObject|null>(defaultImage as any);

  const inputStyle = {
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1
  }
  const textStyle = {
    paddingTop: 10,
  }
  const imageStyle = {
    width: 128,
    height: 128,
  }

  const done = () => {
    // let's store this crap
    const flHandicap = parseFloat(handicap);
    if(isFinite(flHandicap) && flHandicap > 25 && picture && picture?.base64) {
      console.log(name, handicap, picture);
      ctx.setPlayerData(name, flHandicap, picture.base64, true).then(() => {
        props.onDone();
      })
    }
  }

  const pickImage = () => {

    const opts:ImagePickerOptions = {
      mediaType:"photo",
      maxWidth: 128,
      maxHeight: 128,
      videoQuality: "low",
      durationLimit: 0,
      quality: 0.75,
      includeBase64: true,
      saveToPhotos: false,
    }

    PermissionsAndroid.check('android.permission.CAMERA').then((havePermission) => {
      if(havePermission) {
        ReactNativeImagePicker.launchCamera(opts, (rsp:ImagePickerResponseObject) => {
          setPicture(rsp);
        })
      } else {
        ReactNativeImagePicker.launchImageLibrary(opts, (rsp:ImagePickerResponseObject) => {
          setPicture(rsp);
        })
      }
    });
  }

  let imageSource;
  if(picture) {
    imageSource = {
      uri: `data:${picture.type};base64,${picture.base64}`,
    }
  }

  return (
    <ScrollView style={{maxWidth: 360, marginLeft: 'auto', marginRight: 'auto'}}>
      <Text>Player Setup: Tell us about yourself.  No signup required.</Text>

      <Text style={textStyle}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={inputStyle} />

      <Text style={textStyle}>Handicap/FTP</Text>
      <TextInput keyboardType="numeric" value={handicap} onChangeText={setHandicap} style={inputStyle} />
      
      <TouchableOpacity onPress={pickImage}>
        <Text style={textStyle}>Touch here to select your image.</Text>
        {picture && (<Image style={imageStyle} source={imageSource}></Image>)
        }
      </TouchableOpacity>

      <ComponentButton title="Save Player Data" onPress={done} onLongPress={()=>{}}></ComponentButton>
    </ScrollView>
  );
};

export default ComponentPlayerSetup;
