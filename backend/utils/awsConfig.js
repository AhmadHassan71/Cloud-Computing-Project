// AWS Authentication Configuration
// This file configures AWS authentication for the application

const getCredentials = () => {
  // Check for environment variables first (most secure option)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('Using AWS credentials from environment variables');
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }

  // Check for AWS profile if environment variables not set
  if (process.env.AWS_PROFILE) {
    console.log(`Using credentials from AWS profile: ${process.env.AWS_PROFILE}`);
    // When using a profile, we don't need to explicitly set credentials
    // AWS SDK will load them from the credentials file
    return {};
  }

  // For local development/testing only - never use in production
  if (process.env.NODE_ENV === 'development' && process.env.LOCAL_TESTING === 'true') {
    console.log('Using development testing credentials');
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }

  // If no credentials are found, log a warning and return empty object
  // This will allow EC2 instances with IAM roles to still work
  console.warn('No explicit AWS credentials found. Using default credentials provider chain.');
  return {};
};

module.exports = {
  getCredentials,
  getRegion: () => process.env.AWS_REGION || 'us-east-1'
};