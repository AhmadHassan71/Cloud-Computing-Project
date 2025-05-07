const { docClient, tableNames } = require('../utils/dynamoConnection');
const { 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand 
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const ItemDynamo = require('./itemDynamo');

// Create a new order
const createOrder = async (orderData) => {
  try {
    const { itemIds } = orderData;
    let totalPrice = 0;
    let orderItems = [];

    // Fetch items and calculate total price
    if (itemIds && itemIds.length > 0) {
      for (const itemId of itemIds) {
        const item = await ItemDynamo.getItemById(itemId);
        if (item) {
          totalPrice += parseFloat(item.itemPrice || 0);
          orderItems.push(item);
        }
      }
    }

    const timestamp = new Date().toISOString();
    const order = {
      id: uuidv4(),
      items: orderItems,
      itemIds: itemIds || [],
      totalPrice,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: tableNames.orders,
      Item: order
    }));

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get all orders
const getAllOrders = async () => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: tableNames.orders
    }));
    
    return result.Items || [];
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

// Get a single order by ID
const getOrderById = async (id) => {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: tableNames.orders,
      Key: { id }
    }));
    
    return result.Item;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
};

// Update an order
const updateOrder = async (id, updateData) => {
  try {
    // First, check if order exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
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
      TableName: tableNames.orders,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));
    
    return result.Attributes;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

// Delete an order
const deleteOrder = async (id) => {
  try {
    // First, check if order exists
    const existingOrder = await getOrderById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }
    
    await docClient.send(new DeleteCommand({
      TableName: tableNames.orders,
      Key: { id }
    }));
    
    return existingOrder;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};