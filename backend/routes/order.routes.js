// orderRoutes.js
const express = require('express');
const OrderRouter = express.Router();
const orderController = require('../controller/order.controller');

OrderRouter.post('/ordercreate', orderController.createOrder); // Create a new order
OrderRouter.get('/', orderController.getAllOrders); // Get all orders
OrderRouter.get('/:orderId', orderController.getOrderById); // Get a single order by ID
OrderRouter.put('/:orderId', orderController.updateOrder); // Update an order by ID
OrderRouter.delete('/deleteorder/:orderId', orderController.deleteOrder); // Delete an order by ID

module.exports = OrderRouter;
