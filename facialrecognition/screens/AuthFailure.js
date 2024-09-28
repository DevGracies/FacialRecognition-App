// screens/AuthFailure.js

import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const AuthFailure = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Authentication Failed!</Text>
      <Button title="Try Again" onPress={() => navigation.navigate("Camera")} />
    </View>
  );
};

export default AuthFailure;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe0e0",
  },
  text: {
    fontSize: 24,
    color: "red",
    marginBottom: 20,
  },
});
