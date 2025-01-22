import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import InterpreterScreen from './screens/InterpreterScreen';
import ListenerScreen from './screens/ListenerScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Interpreter" component={InterpreterScreen} />
        <Stack.Screen name="Listener" component={ListenerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
