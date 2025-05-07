const { docClient, tableNames } = require('../utils/dynamoConnection');
const { 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand, 
  QueryCommand 
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Create a new item
const createItem = async (itemData) => {
  try {
    const timestamp = new Date().toISOString();
    const item = {
      id: uuidv4(),
      ...itemData,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: tableNames.items,
      Item: item
    }));

    return item;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

// Get all items
const getAllItems = async () => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: tableNames.items
    }));
    
    return result.Items || [];
  } catch (error) {
    console.error('Error getting all items:', error);
    throw error;
  }
};

// Get a single item by ID
const getItemById = async (id) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: tableNames.items,
      Key: { id }
    }));
    
    return result.Item;
  } catch (error) {
    console.error('Error getting item by ID:', error);
    throw error;
  }
};

// Search items by name (case-insensitive)
const searchItemsByName = async (itemName) => {
  try {
    // DynamoDB doesn't support case-insensitive search directly,
    // so we'll scan all items and filter in memory
    const result = await docClient.send(new ScanCommand({
      TableName: tableNames.items
    }));
    
    const items = result.Items || [];
    const searchTerm = itemName.toLowerCase();
    
    return items.filter(item => {
      return item.itemName && item.itemName.toLowerCase().includes(searchTerm);
    });
  } catch (error) {
    console.error('Error searching items by name:', error);
    throw error;
  }
};

// Update an item
const updateItem = async (id, updateData) => {
  try {
    // First, check if item exists
    const existingItem = await getItemById(id);
    if (!existingItem) {
      throw new Error('Item not found');
    }
    
    // Prepare update expression
    const timestamp = new Date().toISOString();
    updateData.updatedAt = timestamp;
    
    // Build update expression dynamically
    let updateExpression = 'SET';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.keys(updateData).forEach((key, index) => {
      updateExpression += ` #${key} = :${key}${index < Object.keys(updateData).length - 1 ? ',' : ''}`;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateData[key];
    });
    
    const result = await docClient.send(new UpdateCommand({
      TableName: tableNames.items,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));
    
    return result.Attributes;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// Delete an item
const deleteItem = async (id) => {
  try {
    // First, check if item exists
    const existingItem = await getItemById(id);
    if (!existingItem) {
      throw new Error('Item not found');
    }
    
    await docClient.send(new DeleteCommand({
      TableName: tableNames.items,
      Key: { id }
    }));
    
    return existingItem;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  searchItemsByName,
  updateItem,
  deleteItem
};