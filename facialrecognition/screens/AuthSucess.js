// screens/AuthSuccess.js

import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const AuthSuccess = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, AAUA Staff!</Text>
      <Button title="Go Back" onPress={() => navigation.navigate("Camera")} />
    </View>
  );
};

export default AuthSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0ffe0",
  },
  text: {
    fontSize: 24,
    color: "green",
    marginBottom: 20,
  },
});
