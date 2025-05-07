const { docClient, tableNames } = require('../utils/dynamoConnection');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Define sample items for a coffee shop business
const sampleItems = [
  {
    itemName: "Espresso",
    itemCategory: "Hot Beverages",
    itemPrice: 3.99,
    itemQty: 100,
    itemDescription: "Rich and intense single shot of pure coffee. Our signature espresso is made with freshly ground premium coffee beans.",
    imageName: "espresso.jpg"
  },
  {
    itemName: "Cappuccino",
    itemCategory: "Hot Beverages",
    itemPrice: 4.99,
    itemQty: 80,
    itemDescription: "Classic Italian coffee drink with equal parts espresso, steamed milk, and milk foam. Perfect balance of flavor and texture.",
    imageName: "cappuccino.jpg"
  },
  {
    itemName: "Latte",
    itemCategory: "Hot Beverages",
    itemPrice: 5.49,
    itemQty: 75,
    itemDescription: "Smooth and creamy coffee with more steamed milk than a cappuccino. Available with flavor shots for a personalized touch.",
    imageName: "latte.jpg"
  },
  {
    itemName: "Americano",
    itemCategory: "Hot Beverages",
    itemPrice: 3.49,
    itemQty: 90,
    itemDescription: "Espresso diluted with hot water for a milder coffee experience. Strong but not as intense as an espresso.",
    imageName: "americano.jpg"
  },
  {
    itemName: "Iced Coffee",
    itemCategory: "Cold Beverages",
    itemPrice: 4.29,
    itemQty: 65,
    itemDescription: "Chilled coffee served over ice. Refreshing and perfect for warm days. Can be customized with various syrups.",
    imageName: "iced-coffee.jpg"
  },
  {
    itemName: "Caramel Frappuccino",
    itemCategory: "Cold Beverages",
    itemPrice: 5.99,
    itemQty: 50,
    itemDescription: "Blended coffee drink with ice, milk, caramel syrup, topped with whipped cream and caramel drizzle.",
    imageName: "caramel-frappuccino.jpg"
  },
  {
    itemName: "Chai Tea Latte",
    itemCategory: "Hot Beverages",
    itemPrice: 4.79,
    itemQty: 60,
    itemDescription: "Spiced black tea mixed with steamed milk for a warm, comforting beverage with exotic flavors.",
    imageName: "chai-tea-latte.jpg"
  },
  {
    itemName: "Chocolate Croissant",
    itemCategory: "Pastries",
    itemPrice: 3.29,
    itemQty: 40,
    itemDescription: "Buttery, flaky croissant filled with rich chocolate. Baked fresh daily for maximum freshness.",
    imageName: "chocolate-croissant.jpg"
  },
  {
    itemName: "Blueberry Muffin",
    itemCategory: "Pastries",
    itemPrice: 2.99,
    itemQty: 45,
    itemDescription: "Moist muffin loaded with juicy blueberries. A perfect companion to your morning coffee.",
    imageName: "blueberry-muffin.jpg"
  },
  {
    itemName: "Cinnamon Roll",
    itemCategory: "Pastries",
    itemPrice: 3.49,
    itemQty: 35,
    itemDescription: "Sweet pastry roll with layers of cinnamon and topped with cream cheese frosting. Freshly baked every morning.",
    imageName: "cinnamon-roll.jpg"
  },
  {
    itemName: "Caesar Salad",
    itemCategory: "Food",
    itemPrice: 8.99,
    itemQty: 25,
    itemDescription: "Fresh romaine lettuce, croutons, parmesan cheese, and grilled chicken with our house caesar dressing.",
    imageName: "caesar-salad.jpg"
  },
  {
    itemName: "Turkey Sandwich",
    itemCategory: "Food",
    itemPrice: 9.49,
    itemQty: 30,
    itemDescription: "Sliced turkey breast with lettuce, tomato, and mayo on your choice of bread. Served with a side of chips.",
    imageName: "turkey-sandwich.jpg"
  },
  {
    itemName: "Coffee Bean Bag - Dark Roast",
    itemCategory: "Retail",
    itemPrice: 14.99,
    itemQty: 20,
    itemDescription: "250g bag of our premium dark roast coffee beans. Intense flavor with chocolate and nutty notes.",
    imageName: "coffee-beans-dark.jpg"
  },
  {
    itemName: "Ceramic Coffee Mug",
    itemCategory: "Retail",
    itemPrice: 12.99,
    itemQty: 15,
    itemDescription: "High-quality ceramic mug with our coffee shop logo. Microwave and dishwasher safe.",
    imageName: "ceramic-mug.jpg"
  },
  {
    itemName: "Reusable Coffee Cup",
    itemCategory: "Retail",
    itemPrice: 19.99,
    itemQty: 25,
    itemDescription: "Eco-friendly reusable travel cup. Double-walled for insulation. Comes with a secure lid.",
    imageName: "reusable-cup.jpg"
  }
];

// Function to populate the DynamoDB Items table with sample data
const populateSampleItems = async () => {
  try {
    console.log('Starting to populate Items table with sample data...');
    
    // Add local testing credentials directly in the script for DynamoDB
    // Note: This is for local testing only - never expose credentials in production code
    const credentials = {
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    };

    // Create a DynamoDB document client with local credentials
    const localDocClient = {
      send: async (command) => {
        if (command instanceof PutCommand) {
          console.log(`Successfully simulated adding item to DynamoDB: ${command.input.Item.itemName}`);
          return { Item: command.input.Item };
        }
      }
    };

    // Use either the configured client or the local simulation client
    const dbClient = process.env.SIMULATE_DYNAMO === 'true' ? localDocClient : docClient;
    
    for (const item of sampleItems) {
      const timestamp = new Date().toISOString();
      
      // Generate a unique ID for the item
      const id = uuidv4();
      
      // Skip S3 upload and use the image name directly
      const itemImage = item.imageName;
      
      // Create the item in DynamoDB
      const newItem = {
        id,
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        itemPrice: item.itemPrice,
        itemQty: item.itemQty,
        itemDescription: item.itemDescription,
        itemImage: itemImage,
        isS3Image: false, // Set to false since we're not using S3 in this test run
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      try {
        await dbClient.send(new PutCommand({
          TableName: tableNames.items,
          Item: newItem
        }));
        
        console.log(`Added item: ${item.itemName}`);
      } catch (err) {
        console.error(`Error adding item ${item.itemName}:`, err.message);
      }
    }
    
    console.log('Finished populating Items table with sample data!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
};

// Execute the function
populateSampleItems()
  .then(() => console.log('Sample data population script completed'))
  .catch(err => console.error('Error running sample data script:', err));