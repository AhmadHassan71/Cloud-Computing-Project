const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { getCredentials, getRegion } = require('./awsConfig');
require('dotenv').config();

// Determine if we're running in simulation mode
const isSimulationMode = process.env.SIMULATE_DYNAMO === 'true';

// Create a DynamoDB client
const dynamoClient = isSimulationMode 
  ? {
      // Mock DynamoDB client for simulation mode
      send: async (command) => {
        console.log(`Simulated DynamoDB command: ${command.constructor.name}`);
        return {};
      }
    } 
  : new DynamoDBClient({
      region: getRegion(),
      credentials: getCredentials()
    });

// Create a document client (makes it easier to work with items)
const docClient = isSimulationMode
  ? {
      // Mock document client for simulation mode
      send: async (command) => {
        console.log(`Simulated DynamoDB command: ${command.constructor.name}`);
        
        // For Get commands, return empty result
        if (command.constructor.name === 'GetCommand') {
          return { Item: null };
        }
        
        // For Scan commands, return empty items array
        if (command.constructor.name === 'ScanCommand') {
          return { Items: [] };
        }
        
        // For Query commands, return empty items array
        if (command.constructor.name === 'QueryCommand') {
          return { Items: [] };
        }
        
        // For Put commands, return success
        if (command.constructor.name === 'PutCommand') {
          return { Item: command.input.Item };
        }
        
        // Default empty response
        return {};
      }
    }
  : DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
    });

const tableNames = {
  items: process.env.DYNAMODB_ITEMS_TABLE || 'Items',
  orders: process.env.DYNAMODB_ORDERS_TABLE || 'Orders',
  users: process.env.DYNAMODB_USERS_TABLE || 'Users'
};

module.exports = {
  dynamoClient,
  docClient,
  tableNames
};