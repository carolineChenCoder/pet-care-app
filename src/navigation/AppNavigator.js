
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import SymptomCheckerScreen from '../screens/SymptomCheckerScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import HealthReportScreen from '../screens/HealthReportScreen';
import FirstAidGuideScreen from '../screens/FirstAidGuideScreen';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Symptom Checker" component={SymptomCheckerScreen} />
            <Tab.Screen name="Pet Profile" component={PetProfileScreen} />
            <Tab.Screen name="Health Report" component={HealthReportScreen} />
            <Tab.Screen name="First-Aid Guide" component={FirstAidGuideScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default AppNavigator;
