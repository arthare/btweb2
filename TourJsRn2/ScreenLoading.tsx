import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

const ScreenLoading = () => {

  return (
    <>
      <Text>Loading...</Text>
    </>
  );
};

export default ScreenLoading;
