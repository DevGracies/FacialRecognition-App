// createCollection.js

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "YOUR_AWS_ACCESS_KEY",
  secretAccessKey: "YOUR_AWS_SECRET_KEY",
  region: "YOUR_AWS_REGION",
});

const rekognition = new AWS.Rekognition();

const createCollection = async () => {
  const params = {
    CollectionId: "AauaStaffCollection",
  };

  try {
    const data = await rekognition.createCollection(params).promise();
    console.log("Collection created:", data);
  } catch (error) {
    if (error.code === "ResourceAlreadyExistsException") {
      console.log("Collection already exists.");
    } else {
      console.error(error);
    }
  }
};

createCollection();
