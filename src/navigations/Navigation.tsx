import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../services/store/store';
import Home from '../screens/Home/Home';
import Login from '../screens/Login/Login';

const Stack = createStackNavigator();

const Navigation = () => {
  // Reads token from Redux (auto-rehydrated from AsyncStorage by redux-persist)
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // Logged in
          <Stack.Screen name="Home" component={Home} />
        ) : (
          // Not logged in
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;