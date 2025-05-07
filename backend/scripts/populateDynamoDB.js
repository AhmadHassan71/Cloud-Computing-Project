const { docClient, tableNames } = require('../utils/dynamoConnection');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { uploadFileToS3 } = require('../utils/s3Utils');
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
async function populateSampleItems() {
  try {
    console.log('Starting to populate Items table with sample data...');
    console.log(`Using DynamoDB table: ${tableNames.items}`);
    
    // Path to public images folder
    const imagesDir = path.join(__dirname, '../public/images');
    console.log(`Looking for images in: ${imagesDir}`);
    
    // Verify the directory exists
    if (!fs.existsSync(imagesDir)) {
      console.error(`Images directory does not exist: ${imagesDir}`);
    } else {
      console.log(`Images directory exists: ${imagesDir}`);
    }
    
    for (const item of sampleItems) {
      const timestamp = new Date().toISOString();
      
      // Generate a unique ID for the item
      const id = uuidv4();
      
      // Try to upload the image to S3 if not in simulation mode
      let itemImage = item.imageName;
      let isS3Image = false;
      
      if (process.env.SIMULATE_DYNAMO !== 'true') {
        try {
          // Look for the image file in the public/images directory
          const imagePath = path.join(imagesDir, item.imageName);
          
          if (fs.existsSync(imagePath)) {
            console.log(`Found image: ${imagePath}`);
            // Determine content type based on file extension
            const ext = path.extname(item.imageName).toLowerCase();
            let contentType = 'image/jpeg'; // default
            
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.gif') contentType = 'image/gif';
            if (ext === '.svg') contentType = 'image/svg+xml';
            
            // Upload to S3
            itemImage = await uploadFileToS3(imagePath, contentType);
            isS3Image = true;
            console.log(`Uploaded image to S3: ${itemImage}`);
          } else {
            console.log(`Image not found: ${imagePath}, using filename as placeholder`);
          }
        } catch (err) {
          console.error(`Error uploading image for ${item.itemName}:`, err);
        }
      }
      
      // Create the item in DynamoDB
      const newItem = {
        id,
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        itemPrice: item.itemPrice,
        itemQty: item.itemQty,
        itemDescription: item.itemDescription,
        itemImage: itemImage,
        isS3Image: isS3Image,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      try {
        console.log(`Attempting to add item to DynamoDB: ${item.itemName}`);
        
        await docClient.send(new PutCommand({
          TableName: tableNames.items,
          Item: newItem
        }));
        
        console.log(`Successfully added item: ${item.itemName}`);
      } catch (err) {
        console.error(`Error adding item ${item.itemName}:`, err);
      }
    }
    
    console.log('Finished populating Items table with sample data!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
}

// Execute the function
populateSampleItems()
  .then(() => console.log('Sample data population script completed'))
  .catch(err => console.error('Error running sample data script:', err));