// AllOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AllOrders.css';
import config from '../../config';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    // Fetch all orders from the backend when the component mounts
    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply filters and sorting whenever orders, search term, or filters change
    applyFiltersAndSort();
  }, [orders, searchTerm, statusFilter, sortOption]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${config.apiUrl}${config.endpoints.orders.all}`);
      
      // Add additional information to orders for display purposes
      const enhancedOrders = response.data.orders.map(order => ({
        ...order,
        // If createdAt doesn't exist, add a mock date for testing
        createdAt: order.createdAt || new Date().toISOString(),
        // Add a status field if it doesn't exist (for demo)
        status: order.status || 'pending'
      }));
      
      setOrders(enhancedOrders);
      setFilteredOrders(enhancedOrders);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch orders. Please try again.');
      setIsLoading(false);
      console.error('Error fetching orders:', error.message);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => {
        // Search by order ID
        if (order.id.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Search by item names
        if (order.items && order.items.some(item => 
          item.itemName && item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        )) return true;
        
        return false;
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch(sortOption) {
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price-asc':
          return a.totalPrice - b.totalPrice;
        case 'price-desc':
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });
    
    setFilteredOrders(result);
  };

  const handleDeleteButtonClick = (orderId) => {
    setOrderToDelete(orderId);
    setShowConfirmModal(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      // Send a DELETE request to delete the order
      await axios.delete(`${config.apiUrl}${config.endpoints.orders.delete}/${orderToDelete}`);
      
      // Remove the deleted order from the state
      setOrders(orders.filter(order => order.id !== orderToDelete));
      
      // Close the modal
      setShowConfirmModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      // Show error in the UI
      setError('Failed to delete order. Please try again.');
      
      // Close the modal
      setShowConfirmModal(false);
      setOrderToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const renderOrderItems = (items) => {
    if (!items || items.length === 0) {
      return <p>No items in this order</p>;
    }

    return (
      <div className="order-items">
        {items.map((item, index) => (
          <div className="order-item" key={index}>
            <div className="order-item-image">
              {item.itemImage ? (
                <img 
                  src={item.itemImage} 
                  alt={item.itemName} 
                  onError={(e) => { e.target.src = '/images/default.png'; }}
                />
              ) : (
                <img src="/images/default.png" alt="Default food" />
              )}
            </div>
            <div className="order-item-details">
              <h4 className="order-item-name">{item.itemName || 'Unknown Item'}</h4>
              <p className="order-item-price">${item.itemPrice ? item.itemPrice.toFixed(2) : '0.00'}</p>
            </div>
            {item.quantity && (
              <div className="order-quantity">x{item.quantity}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="all-orders-container">
      {/* Confirmation Modal */}
      <div className={`confirmation-modal ${showConfirmModal ? 'visible' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Confirm Deletion</h3>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete this order?</p>
            <p>This action cannot be undone.</p>
          </div>
          <div className="modal-actions">
            <button className="confirm-btn" onClick={handleDeleteOrder}>Delete</button>
            <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
      
      {/* Page Header */}
      <div className="orders-header">
        <div className="header-content">
          <div>
            <h1>Order History</h1>
            <p>View and manage your past orders</p>
          </div>
          <div className="header-actions">
            <Link to="/orderform" className="create-order-link">
              Create New Order
            </Link>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="orders-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="status-filter">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="sort-options">
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
          </select>
        </div>
      </div>
      
      {/* Search results status */}
      {searchTerm && (
        <div className="order-search-status">
          Showing {filteredOrders.length} orders matching "{searchTerm}"
        </div>
      )}
      
      {/* Content area */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <h3>No Orders Found</h3>
          {searchTerm || statusFilter !== 'all' ? (
            <>
              <p>No orders match your current filters.</p>
              <button onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>Clear Filters</button>
            </>
          ) : (
            <>
              <p>You haven't placed any orders yet.</p>
              <Link to="/orderform">Create Your First Order</Link>
            </>
          )}
        </div>
      ) : (
        <div className="order-cards-container">
          {filteredOrders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id.substring(order.id.length - 8)}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-card-body">
                {renderOrderItems(order.items)}
                
                <div className="order-totals">
                  <div className="order-total-row">
                    <span>Subtotal:</span>
                    <span>${order.totalPrice ? (order.totalPrice / 1.1).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="order-total-row">
                    <span>Tax (10%):</span>
                    <span>${order.totalPrice ? (order.totalPrice * 0.1 / 1.1).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="order-final-total">
                    <span>Total:</span>
                    <span>${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-card-actions">
                <Link 
                  to={`/payment/${order.id}`} 
                  className="order-action-btn view-invoice-btn"
                >
                  View Details
                </Link>
                <button 
                  className="order-action-btn cancel-order-btn"
                  onClick={() => handleDeleteButtonClick(order.id)}
                >
                  Delete Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;