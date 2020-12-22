import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
} from 'react-native';
import { StoredData } from './App';
import ComponentButton from './ComponentButton';
import happyFaceB64 from './ScreenPlayerSetup-HappyFace';

// require'd because this doesn't have any @types/ and I'm trying to keep this project free ot errors
const ReactNativeImagePicker = require('react-native-image-picker'); // https://github.com/react-native-image-picker/react-native-image-picker#options

export class PlayerSetup {
  playerData:StoredData;

  constructor(playerData:StoredData) {
    this.playerData = playerData;
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

const ScreenPlayerSetup = () => {

  const ctx = useContext(PlayerSetupInstance);
  let [name, setName] = useState<string>(ctx.playerData.name);
  let [handicap, setHandicap] = useState<string>('' + ctx.playerData.handicap);
  let [picture, setPicture] = useState<ImagePickerResponseObject|null>(null);

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
    <ScrollView>
      <Text>Player Setup: Tell us about yourself.  No signup required.</Text>

      <Text style={textStyle}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={inputStyle} />

      <Text style={textStyle}>Handicap/FTP</Text>
      <TextInput value={handicap} onChangeText={setHandicap} style={inputStyle} />
      
      <Text style={textStyle}>Note: Your ride data will be locked to this image.  So make it good.</Text>
      {picture && (<Image style={imageStyle} source={imageSource}></Image>)
      }
      <ComponentButton title="Select Image" onPress={pickImage}></ComponentButton>

      <ComponentButton title="Save Player Data" onPress={done}></ComponentButton>
    </ScrollView>
  );
};

export default ScreenPlayerSetup;
