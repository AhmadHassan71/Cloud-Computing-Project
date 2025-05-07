const itemDynamo = require("../models/itemDynamo");
const pdfCreator = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
const moment = require("moment");
const { getPresignedUrl, deleteFileFromS3 } = require('../utils/s3Utils');

//Add/Create item router controller
const addItem = async (req, res) => {
    try{
        const { itemName, itemCategory, itemPrice, itemQty, itemDescription } = req.body;

        // Check if file exists in the request
        if (!req.file) {
            return res.status(400).send({
                status: false,
                message: 'No file uploaded.'
            });
        }

        const itemImage = req.file.filename; // Extract the S3 key from the uploaded file

        const newItemData = {
            itemName: itemName,
            itemCategory: itemCategory,
            itemPrice: parseFloat(itemPrice),
            itemQty: parseInt(itemQty),
            itemDescription: itemDescription,
            itemImage: itemImage, // This is now the S3 key
            isS3Image: true // Flag to indicate this is stored in S3
        }

        const newItem = await itemDynamo.createItem(newItemData);

        return res.status(200).send({
            status: true,
            message: "✨ :: Data saved successfully!",
            item: newItem
        })

    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}

//get all item router controller
const getAllItems = async (req, res) => {
    try{
        const allItems = await itemDynamo.getAllItems();

        // Generate presigned URLs for all S3 images
        const itemsWithUrls = await Promise.all(allItems.map(async (item) => {
            if (item.isS3Image && item.itemImage) {
                try {
                    // Generate a presigned URL for the S3 object
                    const imageUrl = await getPresignedUrl(item.itemImage);
                    return {
                        ...item,
                        imageUrl // Add the presigned URL to the item object
                    };
                } catch (error) {
                    console.error(`Error generating presigned URL for item ${item.id}:`, error);
                    return {
                        ...item,
                        imageUrl: null // Set to null if there's an error
                    };
                }
            }
            return item;
        }));

        return res.status(200).send({
            status: true,
            message: "✨ :: All items are fetched!",
            AllItems: itemsWithUrls,
        })
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message,
        })
    }
}

//get one-specified item router controller
const getOneItem = async (req, res) => {
    try{
        const itemID = req.params.id;
        const item = await itemDynamo.getItemById(itemID);

        if (!item) {
            return res.status(404).send({
                status: false,
                message: "Item not found"
            });
        }

        // Generate presigned URL for the item image if it's stored in S3
        if (item.isS3Image && item.itemImage) {
            try {
                const imageUrl = await getPresignedUrl(item.itemImage);
                item.imageUrl = imageUrl;
            } catch (error) {
                console.error(`Error generating presigned URL for item ${item.id}:`, error);
                item.imageUrl = null;
            }
        }

        return res.status(200).send({
            status: true,
            message: "✨ :: Item Fetched!",
            Item: item,
        })
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message,
        })  
    }
}

// Function to generate and serve the PDF invoice
const generateInvoice = async (req, res) => {
    try {
        const htmlTemplate = fs.readFileSync(path.join(__dirname, '../template/invoice-template.html'), 'utf-8');
        
        const date = moment().format('YYYY MMMM DD');
        const timestamp = moment().format('YYYY_MMMM_DD_HH_mm_ss');
        const filename = 'Item_Management_' + timestamp + '_doc' + '.pdf';
      
        const items = await itemDynamo.getAllItems();

        let itemArray = [];

        items.forEach(i => {
            const totalPrice = i.itemQty * i.itemPrice; // Calculate total price for each item
            const it = {
                itemName: i.itemName,
                itemCategory: i.itemCategory,
                itemQty: i.itemQty,
                itemPrice: i.itemPrice,
                totalPrice: totalPrice // Include the total price in the item object
            }
            itemArray.push(it);
        })
        
        // Calculate the total amount by reducing the items array
        const grandTotal = itemArray.reduce((total, item) => total + item.totalPrice, 0);

        // Taking logo path
        const logoPath = path.join(__dirname, '../template/images/logo.png');
        // Load the logo image asynchronously
        const logoBuffer = await fs.promises.readFile(logoPath);
        // Encode the logo buffer to base64
        const logoBase64 = logoBuffer.toString('base64');

        const options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm',
            header: {
                height: '0mm',
            },
            footer: {
                height: '0mm',
            },
            zoomFactor: '1.0',
            type: 'buffer',
        };

        const document = {
            html: htmlTemplate,
            data: {
                itemArray,
                grandTotal,
                date,
                logoBuffer: logoBase64, // Pass the logo buffer to the HTML template
            },
            path: './docs/' + filename,
        };

        const pdfBuffer = await pdfCreator.create(document, options);

        // Get the server address from environment or use default
        const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost:5000';
        const filepath = `${serverAddress}/docs/${filename}`;

        // Send the file path in the response
        res.status(200).json({ filepath, filename });
    } catch (error) {
        console.error('Error generating PDF invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

//get - search particular item
const searchItem = async (req, res) => {
    try{
        const ItemName = req.query.itemName;
        const items = await itemDynamo.searchItemsByName(ItemName);

        // Generate presigned URLs for all S3 images
        const itemsWithUrls = await Promise.all(items.map(async (item) => {
            if (item.isS3Image && item.itemImage) {
                try {
                    // Generate a presigned URL for the S3 object
                    const imageUrl = await getPresignedUrl(item.itemImage);
                    return {
                        ...item,
                        imageUrl // Add the presigned URL to the item object
                    };
                } catch (error) {
                    console.error(`Error generating presigned URL for item ${item.id}:`, error);
                    return {
                        ...item,
                        imageUrl: null // Set to null if there's an error
                    };
                }
            }
            return item;
        }));

        return res.status(200).send({
            status: true,
            message: "✨ :: Project Searched and fetched!",
            searchedItem: itemsWithUrls
        })
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message
        });
    }
}

//Update item details router controller
const updateitem = async (req, res) => {
    try{
        const itemID = req.params.id;
        const { itemName, itemCategory, itemPrice, itemQty, itemDescription } = req.body; 

        // Get the existing item to check if we need to delete an old image
        const existingItem = await itemDynamo.getItemById(itemID);
        if (!existingItem) {
            return res.status(404).send({
                status: false,
                message: "Item not found"
            });
        }

        const itemData = {
            itemName: itemName,
            itemCategory: itemCategory,
            itemPrice: parseFloat(itemPrice),
            itemQty: parseInt(itemQty),
            itemDescription: itemDescription,
        }

        // Check if file exists in the request then only send image with itemData object
        if (req.file) {
            // If there's already an S3 image, delete it
            if (existingItem.isS3Image && existingItem.itemImage) {
                try {
                    await deleteFileFromS3(existingItem.itemImage);
                } catch (error) {
                    console.error('Error deleting old image from S3:', error);
                    // Continue even if delete fails
                }
            }

            itemData.itemImage = req.file.filename; // New S3 key
            itemData.isS3Image = true;
        }

        const updatedItem = await itemDynamo.updateItem(itemID, itemData);

        return res.status(200).send({
            status: true,
            message: "✨ :: Item Updated!",
            UpdateItemObj: updatedItem,
        })
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message,
        })  
    }
}

//Delete item router controller
const deleteItem = async (req, res) => {
    try{
        const itemID = req.params.id;
        
        // Get the item to delete its image from S3 if needed
        const item = await itemDynamo.getItemById(itemID);
        if (!item) {
            return res.status(404).send({
                status: false,
                message: "Item not found"
            });
        }
        
        // Delete image from S3 if it exists
        if (item.isS3Image && item.itemImage) {
            try {
                await deleteFileFromS3(item.itemImage);
            } catch (error) {
                console.error('Error deleting image from S3:', error);
                // Continue even if delete fails
            }
        }
        
        // Now delete the item from DynamoDB
        const deletedItem = await itemDynamo.deleteItem(itemID);

        return res.status(200).send({
            status: true,
            message: "✨ :: Item Deleted!",
        })
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message,
        })  
    }
}

//Delete image from S3 router controller
const deleteImageFromS3 = async (req, res) => {
    try{
        const imageKey = req.params.imageKey;
        
        // Delete the image from S3
        await deleteFileFromS3(imageKey);
        
        res.status(200).send({
            status: true,
            message: "✨ :: Image deleted successfully!"
        });
    }catch(err){
        return res.status(500).send({
            status: false,
            message: err.message,
        })  
    }
}

module.exports = {
    addItem,
    getAllItems,
    getOneItem,
    searchItem,
    updateitem,
    deleteItem,
    deleteImageFromS3,
    generateInvoice,
}