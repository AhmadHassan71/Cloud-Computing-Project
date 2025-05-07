const express = require("express");
const ItemRouter = express.Router();

const {
    addItem,
    getAllItems,
    getOneItem,
    updateitem,
    deleteItem,
    deleteImageFromS3,
    searchItem,
    generateInvoice,
} = require("../controller/item.controller");

// const authMiddleware = require("../middlewares/authMiddleware");

const AllRoutes = (s3UploadMiddleware) => {
    ItemRouter.post('/create', s3UploadMiddleware("itemImage"), addItem);
    ItemRouter.get('/items', getAllItems);
    ItemRouter.get('/item/:id', getOneItem);
    ItemRouter.get('/searchItem', searchItem);
    ItemRouter.patch('/itemUpdate/:id', s3UploadMiddleware("itemImage"), updateitem);
    ItemRouter.delete('/deleteItem/:id', deleteItem);
    ItemRouter.delete('/deleteImage/:imageKey', deleteImageFromS3);
    ItemRouter.get('/generate-invoice', generateInvoice);

    return ItemRouter;
}

module.exports = AllRoutes;