import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, useColorScheme, Text, View } from 'react-native';

import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import LanguageSelector from './src/components/LanguageSelector';
import ThemeSelector from './src/components/ThemeSelector';
import PetProfileScreen from './src/screens/PetProfileScreen';
import SymptomCheckerScreen from './src/screens/SymptomCheckerScreen';
import HealthReportScreen from './src/screens/HealthReportScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <LanguageSelector />
          <ThemeSelector />
        </View>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.secondary,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopWidth: 0,
              elevation: 10,
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: -2 },
              height: 85,
              paddingBottom: 10,
              paddingTop: 10,
            },
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}>
          <Tab.Screen 
            name="Profile" 
            component={PetProfileScreen}
            options={{
              title: t('headerProfile'),
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? colors.primary : colors.secondary,
                  fontSize: 12,
                  fontWeight: focused ? 'bold' : 'normal'
                }}>
                  {t('navProfile')}
                </Text>
              ),
            }}
          />
          <Tab.Screen 
            name="Symptoms" 
            component={SymptomCheckerScreen}
            options={{
              title: t('headerSymptoms'),
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? colors.primary : colors.secondary,
                  fontSize: 12,
                  fontWeight: focused ? 'bold' : 'normal'
                }}>
                  {t('navSymptoms')}
                </Text>
              ),
            }}
          />
          <Tab.Screen 
            name="HealthReport" 
            component={HealthReportScreen}
            options={{
              title: t('headerHealthReport'),
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? colors.primary : colors.secondary,
                  fontSize: 12,
                  fontWeight: focused ? 'bold' : 'normal'
                }}>
                  {t('navHealthReport')}
                </Text>
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
