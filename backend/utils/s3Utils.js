const { s3Client, bucketName } = require('./s3Connection');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Determine if we're running in simulation mode
const isSimulationMode = process.env.SIMULATE_DYNAMO === 'true';

// Upload a file to S3 from a local path
const uploadFileToS3 = async (filePath, contentType) => {
  try {
    if (isSimulationMode) {
      // In simulation mode, just return a fake S3 key without uploading
      const fileName = `simulated-${uuidv4()}-${path.basename(filePath)}`;
      console.log(`Simulated S3 upload: ${fileName}`);
      return fileName;
    }
    
    const fileContent = fs.readFileSync(filePath);
    const fileName = `${uuidv4()}-${path.basename(filePath)}`;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType || 'application/octet-stream'
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    return fileName;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Upload a file to S3 from a buffer
const uploadBufferToS3 = async (buffer, originalFilename, contentType) => {
  try {
    if (isSimulationMode) {
      // In simulation mode, just return a fake S3 key without uploading
      const fileName = `simulated-${uuidv4()}-${originalFilename}`;
      console.log(`Simulated S3 buffer upload: ${fileName}`);
      return fileName;
    }
    
    const fileName = `${uuidv4()}-${originalFilename}`;
    
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream'
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    
    return fileName;
  } catch (error) {
    console.error('Error uploading buffer to S3:', error);
    throw error;
  }
};

// Get a presigned URL for an S3 object (valid for a limited time)
const getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    if (isSimulationMode) {
      // In simulation mode, return a fake URL that uses a local image
      // Try to find a matching file in the frontend uploads folder as a fallback
      const imageFileName = key.split('-').pop(); // Get the original image name
      return `/uploads/${key}`;
    }
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Delete an object from S3
const deleteFileFromS3 = async (key) => {
  try {
    if (isSimulationMode) {
      console.log(`Simulated S3 delete: ${key}`);
      return true;
    }
    
    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

module.exports = {
  uploadFileToS3,
  uploadBufferToS3,
  getPresignedUrl,
  deleteFileFromS3
};