

### **Project Overview**

1. **Initialize the Expo Project**
2. **Set Up Camera Functionality**
3. **Integrate AWS Rekognition for Facial Recognition**
4. **Authenticate Staff Against Stored Data**
5. **Build the User Interface**
6. **Handle Security and Permissions**
7. **Test the Application**

Let's dive into each step in detail.

---

## 1. Initialize the Expo Project

First, ensure you have **Node.js** and **Expo CLI** installed on your machine.

### **Install Expo CLI**

If you haven't installed Expo CLI yet, run:

```bash
npm install -g expo-cli
```

### **Create a New Expo Project**

Initialize a new Expo project named `AauaFacialRecognition`:

```bash
expo init AauaFacialRecognition
```

Choose the **blank** template when prompted.

### **Navigate to the Project Directory**

```bash
cd AauaFacialRecognition
```

---

## 2. Set Up Camera Functionality

We'll use `expo-camera` to access the device's camera.

### **Install Dependencies**

```bash
expo install expo-camera
expo install expo-permissions
expo install axios
```

- **expo-camera**: Access the device camera.
- **expo-permissions**: Handle camera permissions.
- **axios**: Make HTTP requests to AWS Rekognition.

### **Configure Camera Permissions**

Modify `app.json` to include camera permissions:

```json
{
  "expo": {
    ...
    "permissions": ["CAMERA"],
    ...
  }
}
```

### **Create the Camera Component**

Create a new file `CameraScreen.js` in the `screens` directory.

```javascript
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
```

### **Explanation**

- **Permissions**: Request camera permissions on component mount.
- **Camera Setup**: Use the front camera for facial recognition.
- **Capture Image**: Capture the image and convert it to Base64.
- **Authenticate**: Send the image to a backend server for authentication (to be set up later).
- **Loading Indicator**: Show a loading indicator while processing.

---

## 3. Integrate AWS Rekognition for Facial Recognition

**Note:** Facial recognition involves sensitive data. Ensure you comply with all relevant privacy laws and guidelines.

### **Set Up AWS Rekognition**

1. **Create an AWS Account**: If you don't have one, [sign up here](https://aws.amazon.com/).

2. **Create IAM User**:
   - Go to the **IAM** console.
   - Create a new user with **Programmatic access**.
   - Attach the **AmazonRekognitionFullAccess** policy (for development purposes). **_For production, follow the principle of least privilege._**

3. **Set Up S3 Bucket**:
   - Create an S3 bucket to store staff photos.
   - Upload images of AAUA staff. Each image should be named uniquely (e.g., using staff IDs).

4. **Store AWS Credentials Securely**:
   - Never hardcode AWS credentials in the app.
   - Use a backend server to handle AWS interactions securely.

### **Create a Backend Server**

For security reasons, the Expo app should not directly interact with AWS Rekognition. Instead, set up a backend server (e.g., using **Node.js** and **Express**) that handles AWS Rekognition requests.

#### **Backend Setup Overview**

1. **Initialize the Backend Project**

   ```bash
   mkdir aaua-backend
   cd aaua-backend
   npm init -y
   npm install express aws-sdk body-parser cors
   ```

2. **Create the Server**

   ```javascript
   // index.js

   const express = require('express');
   const AWS = require('aws-sdk');
   const bodyParser = require('body-parser');
   const cors = require('cors');

   const app = express();
   app.use(bodyParser.json({ limit: '10mb' }));
   app.use(cors());

   // Configure AWS
   AWS.config.update({
     accessKeyId: 'YOUR_AWS_ACCESS_KEY',
     secretAccessKey: 'YOUR_AWS_SECRET_KEY',
     region: 'YOUR_AWS_REGION',
   });

   const rekognition = new AWS.Rekognition();

   // Endpoint to authenticate staff
   app.post('/authenticate', async (req, res) => {
     const { image } = req.body; // Base64 image

     // Convert base64 to Buffer
     const buffer = Buffer.from(image, 'base64');

     const params = {
       Image: {
         Bytes: buffer,
       },
       CollectionId: 'AauaStaffCollection', // Pre-created collection
       FaceMatchThreshold: 90,
       MaxFaces: 1,
     };

     try {
       const data = await rekognition.searchFacesByImage(params).promise();

       if (data.FaceMatches && data.FaceMatches.length > 0) {
         const matchedFace = data.FaceMatches[0];
         const staffId = matchedFace.Face.ExternalImageId; // Assuming ExternalImageId is set as staff ID

         // You can further verify staff details from your database using staffId
         res.json({ isAuthenticated: true, staffId });
       } else {
         res.json({ isAuthenticated: false });
       }
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Internal Server Error' });
     }
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

3. **Create a Rekognition Collection**

   Before using Rekognition, create a collection to store and manage staff faces.

   ```javascript
   // createCollection.js

   const AWS = require('aws-sdk');

   AWS.config.update({
     accessKeyId: 'YOUR_AWS_ACCESS_KEY',
     secretAccessKey: 'YOUR_AWS_SECRET_KEY',
     region: 'YOUR_AWS_REGION',
   });

   const rekognition = new AWS.Rekognition();

   const createCollection = async () => {
     const params = {
       CollectionId: 'AauaStaffCollection',
     };

     try {
       const data = await rekognition.createCollection(params).promise();
       console.log('Collection created:', data);
     } catch (error) {
       if (error.code === 'ResourceAlreadyExistsException') {
         console.log('Collection already exists.');
       } else {
         console.error(error);
       }
     }
   };

   createCollection();
   ```

   Run this script once to create the collection:

   ```bash
   node createCollection.js
   ```

4. **Index Staff Faces**

   For each staff member, upload their face to the Rekognition collection.

   ```javascript
   // indexFaces.js

   const AWS = require('aws-sdk');
   const fs = require('fs');

   AWS.config.update({
     accessKeyId: 'YOUR_AWS_ACCESS_KEY',
     secretAccessKey: 'YOUR_AWS_SECRET_KEY',
     region: 'YOUR_AWS_REGION',
   });

   const rekognition = new AWS.Rekognition();

   const indexFaces = async (imagePath, staffId) => {
     const imageBytes = fs.readFileSync(imagePath);

     const params = {
       Image: {
         Bytes: imageBytes,
       },
       CollectionId: 'AauaStaffCollection',
       ExternalImageId: staffId, // Use staff ID or unique identifier
       DetectionAttributes: ['DEFAULT'],
     };

     try {
       const data = await rekognition.indexFaces(params).promise();
       console.log('Face indexed:', data);
     } catch (error) {
       console.error(error);
     }
   };

   // Example usage
   indexFaces('path/to/staff1.jpg', 'staff1');
   indexFaces('path/to/staff2.jpg', 'staff2');
   // Repeat for all staff
   ```

   Run this script for each staff member to add their face to the collection.

5. **Start the Backend Server**

   ```bash
   node index.js
   ```

   Ensure your server is running and accessible (consider deploying it on platforms like **Heroku**, **AWS Elastic Beanstalk**, **DigitalOcean**, etc.).

### **Security Considerations**

- **Never expose AWS credentials on the client side.**
- **Use environment variables** to store sensitive information on the backend.
- **Implement authentication and authorization** on your backend to prevent unauthorized access.

---

## 4. Authenticate Staff Against Stored Data

With the backend server handling AWS Rekognition, the Expo app will send the captured image to the backend for authentication.

### **Update the Backend Server**

Ensure your backend server's `/authenticate` endpoint searches the Rekognition collection and returns the authentication result.

The earlier `index.js` already handles this.

---

## 5. Build the User Interface

Create screens to display authentication results: success or failure.

### **Create Success and Failure Screens**

1. **AuthSuccess.js**

   ```javascript
   // screens/AuthSuccess.js

   import React from 'react';
   import { View, Text, StyleSheet, Button } from 'react-native';

   const AuthSuccess = ({ navigation }) => {
     return (
       <View style={styles.container}>
         <Text style={styles.text}>Welcome, AAUA Staff!</Text>
         <Button title="Go Back" onPress={() => navigation.navigate('Camera')} />
       </View>
     );
   };

   export default AuthSuccess;

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#e0ffe0',
     },
     text: {
       fontSize: 24,
       color: 'green',
       marginBottom: 20,
     },
   });
   ```

2. **AuthFailure.js**

   ```javascript
   // screens/AuthFailure.js

   import React from 'react';
   import { View, Text, StyleSheet, Button } from 'react-native';

   const AuthFailure = ({ navigation }) => {
     return (
       <View style={styles.container}>
         <Text style={styles.text}>Authentication Failed!</Text>
         <Button title="Try Again" onPress={() => navigation.navigate('Camera')} />
       </View>
     );
   };

   export default AuthFailure;

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#ffe0e0',
     },
     text: {
       fontSize: 24,
       color: 'red',
       marginBottom: 20,
     },
   });
   ```

### **Set Up Navigation**

We'll use `@react-navigation` to navigate between screens.

1. **Install Navigation Dependencies**

   ```bash
   npm install @react-navigation/native
   expo install react-native-screens react-native-safe-area-context
   npm install @react-navigation/stack
   ```

2. **Configure Navigation**

   Update `App.js`:

   ```javascript
   // App.js

   import React from 'react';
   import { NavigationContainer } from '@react-navigation/native';
   import { createStackNavigator } from '@react-navigation/stack';
   import CameraScreen from './screens/CameraScreen';
   import AuthSuccess from './screens/AuthSuccess';
   import AuthFailure from './screens/AuthFailure';

   const Stack = createStackNavigator();

   export default function App() {
     return (
       <NavigationContainer>
         <Stack.Navigator initialRouteName="Camera">
           <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
           <Stack.Screen name="AuthSuccess" component={AuthSuccess} options={{ headerShown: false }} />
           <Stack.Screen name="AuthFailure" component={AuthFailure} options={{ headerShown: false }} />
         </Stack.Navigator>
       </NavigationContainer>
     );
   }
   ```

---

## 6. Handle Security and Permissions

### **Secure Backend Endpoints**

Ensure your backend endpoints are secured to prevent unauthorized access. Implement authentication mechanisms like API keys, JWT tokens, etc.

### **Secure Data Transmission**

- **Use HTTPS**: Ensure your backend server uses HTTPS to encrypt data in transit.
- **Validate Inputs**: Always validate and sanitize inputs on the backend to prevent injection attacks.

### **Manage AWS Credentials Securely**

Use environment variables to store AWS credentials on the backend.

1. **Install dotenv**

   ```bash
   npm install dotenv
   ```

2. **Update `index.js`**

   ```javascript
   require('dotenv').config();
   // Then use process.env.AWS_ACCESS_KEY_ID etc.
   AWS.config.update({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION,
   });
   ```

3. **Create a `.env` File**

   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   ```

4. **Add `.env` to `.gitignore`**

   ```
   # .gitignore
   node_modules/
   .env
   ```

---

## 7. Test the Application

### **Run the Backend Server**

Ensure your backend server is running and accessible.

```bash
node index.js
```

### **Run the Expo App**

Start the Expo development server:

```bash
expo start
```

- Use a physical device or emulator to test the app.
- Ensure the device has internet access to communicate with the backend server.

### **Testing Steps**

1. **Launch the App**: Open the Expo app on your device and load the project.
2. **Camera Access**: Grant camera permissions when prompted.
3. **Capture Image**: Position your face within the camera frame and tap the **Capture** button.
4. **Processing**: Wait for the app to process the image.
5. **Result**: Based on the facial recognition result, you should see either the **AuthSuccess** or **AuthFailure** screen.

---

## **Complete Project Structure**

```
AauaFacialRecognition/
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── screens/
│   ├── AuthFailure.js
│   ├── AuthSuccess.js
│   └── CameraScreen.js
└── assets/
    └── ...
```

---

## **Additional Considerations**

1. **Staff Database**: Integrate a database (e.g., **MongoDB**, **PostgreSQL**) to manage staff details and link with Rekognition using `staffId`.
2. **Scalability**: For large organizations, ensure your backend can handle multiple concurrent requests.
3. **Error Handling**: Implement comprehensive error handling on both frontend and backend.
4. **Performance Optimization**: Optimize image sizes before sending to the backend to reduce latency.
5. **User Feedback**: Provide clear feedback to users during each step (e.g., capturing, processing, success/failure).

