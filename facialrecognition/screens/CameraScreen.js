// screens/CameraScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      // Send the image to AWS Rekognition
      authenticateStaff(photo.base64);
    }
  };

  const authenticateStaff = async (base64Image) => {
    try {
      // Replace with your backend endpoint
      const response = await axios.post('https://your-backend.com/authenticate', {
        image: base64Image,
      });

      if (response.data.isAuthenticated) {
        navigation.navigate('AuthSuccess');
      } else {
        navigation.navigate('AuthFailure');
      }
    } catch (error) {
      console.error(error);
      navigation.navigate('AuthFailure');
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.front} ref={cameraRef}>
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={captureImage} disabled={isProcessing}>
            <Text style={styles.text}> Capture </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});
