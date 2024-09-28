// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CameraScreen from "./screens/CameraScreen";
import AuthSuccess from "./screens/AuthSuccess";
import AuthFailure from "./screens/AuthFailure";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Camera">
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuthSuccess"
          component={AuthSuccess}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuthFailure"
          component={AuthFailure}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
