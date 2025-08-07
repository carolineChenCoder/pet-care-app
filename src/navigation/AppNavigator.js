
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import SymptomCheckerScreen from '../screens/SymptomCheckerScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import FirstAidGuideScreen from '../screens/FirstAidGuideScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Symptom Checker" component={SymptomCheckerScreen} />
        <Tab.Screen name="Pet Profile" component={PetProfileScreen} />
        <Tab.Screen name="First-Aid Guide" component={FirstAidGuideScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
