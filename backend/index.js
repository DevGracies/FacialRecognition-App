// index.js

const express = require("express");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());

// Configure AWS
require("dotenv").config();
// Then use process.env.AWS_ACCESS_KEY_ID etc.
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();

// Endpoint to authenticate staff
app.post("/authenticate", async (req, res) => {
  const { image } = req.body; // Base64 image

  // Convert base64 to Buffer
  const buffer = Buffer.from(image, "base64");

  const params = {
    Image: {
      Bytes: buffer,
    },
    CollectionId: "AauaStaffCollection", // Pre-created collection
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
