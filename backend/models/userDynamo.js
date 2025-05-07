const { docClient, tableNames } = require('../utils/dynamoConnection');
const { 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand 
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Create a new user
const createUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const timestamp = new Date().toISOString();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const user = {
      id: uuidv4(),
      email: userData.email,
      password: hashedPassword,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: tableNames.users,
      Item: user
    }));

    return { ...user, password: undefined }; // Return user without password
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by email (for login)
const getUserByEmail = async (email) => {
  try {
    // DynamoDB doesn't support direct query on non-key attributes without GSI
    // So we'll scan and filter in memory
    const result = await docClient.send(new ScanCommand({
      TableName: tableNames.users,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }));
    
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: tableNames.users,
      Key: { id }
    }));
    
    if (result.Item) {
      // Don't return the password
      const { password, ...userWithoutPassword } = result.Item;
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Validate user credentials
const validateUserCredentials = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return { valid: false, message: 'Invalid credentials, Email is not match!' };
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { valid: false, message: 'Invalid credentials, Password is not match!' };
    }
    
    return { valid: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('Error validating user credentials:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  validateUserCredentials
};