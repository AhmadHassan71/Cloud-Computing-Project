// orderController.js
const OrderDynamo = require('../models/orderDynamo');

const orderController = {
  // Controller function for creating a new order
  async createOrder(req, res) {
    try {
      const { itemIds } = req.body;

      if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No items provided for the order'
        });
      }

      const order = await OrderDynamo.createOrder({ itemIds });

      res.status(201).json({
        success: true,
        order
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error : ' + error.message 
      });
    }
  },

  // Controller function for getting all orders
  async getAllOrders(req, res) {
    try {
      const orders = await OrderDynamo.getAllOrders();
      
      res.json({ 
        success: true, 
        orders 
      });

    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      });
    }
  },

  // Controller function for getting a single order by ID
  async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const order = await OrderDynamo.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Order not found' 
        });
      }
      
      res.json({ 
        success: true, 
        order 
      });
    } catch (error) {
      console.error('Error getting order by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      });
    }
  },

  // Controller function for updating an order by ID
  async updateOrder(req, res) {
    try {
      const { orderId } = req.params;
      const updateData = req.body;

      const updatedOrder = await OrderDynamo.updateOrder(orderId, updateData);

      res.json({ 
        success: true, 
        order: updatedOrder 
      });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      });
    }
  },

  // Controller function for deleting an order by ID
  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;

      await OrderDynamo.deleteOrder(orderId);

      res.json({ 
        success: true, 
        message: 'Order deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      });
    }
  },
};

module.exports = orderController;
