const { S3Client } = require('@aws-sdk/client-s3');
const { getCredentials, getRegion } = require('./awsConfig');
require('dotenv').config();

// Determine if we're running in simulation mode
const isSimulationMode = process.env.SIMULATE_DYNAMO === 'true';

// Create an S3 client
const s3Client = isSimulationMode
  ? {
      // Mock S3 client for simulation mode
      send: async (command) => {
        console.log(`Simulated S3 command: ${command.constructor.name}`);
        return {};
      }
    }
  : new S3Client({
      region: getRegion(),
      credentials: getCredentials()
    });

// S3 bucket name for storing images
const bucketName = process.env.S3_BUCKET_NAME || 'mern-crud-images';

module.exports = {
  s3Client,
  bucketName
};