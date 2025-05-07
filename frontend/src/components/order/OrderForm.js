// OrderForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './OrderForm.css';
import config from '../../config';

const OrderForm = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch items from backend when the component mounts
    fetchItems();
  }, []);

  // Extract unique categories
  useEffect(() => {
    if (items.length > 0) {
      const uniqueCategories = [...new Set(items.map(item => item.itemCategory))];
      setCategories(uniqueCategories);
    }
  }, [items]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${config.apiUrl}${config.endpoints.items.base}`);
      setItems(response.data.AllItems);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to fetch items. Please try again later.");
      setIsLoading(false);
      console.error('Error fetching items:', error);
    }
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    // Find the item
    const item = items.find(item => (item.id || item.id) === itemId);
    
    // Validate that quantity doesn't exceed available inventory
    if (quantity > item.itemQty) {
      alert(`Sorry, only ${item.itemQty} ${item.itemName} available in stock.`);
      return;
    }

    if (quantity <= 0) {
      // Remove the item if quantity is 0 or negative
      const newSelectedItems = { ...selectedItems };
      delete newSelectedItems[itemId];
      setSelectedItems(newSelectedItems);
    } else {
      // Update the quantity for the item
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: {
          ...item,
          quantity: quantity
        }
      }));
    }
  };

  // Calculate the total price whenever selectedItems changes
  useEffect(() => {
    let newTotal = 0;
    Object.values(selectedItems).forEach(item => {
      newTotal += item.itemPrice * item.quantity;
    });
    setTotalPrice(newTotal);
  }, [selectedItems]);

  const handleAddToOrder = (item) => {
    const itemId = item.id || item.id;
    
    if (selectedItems[itemId]) {
      // Item is already in the order, increment quantity
      handleItemQuantityChange(itemId, selectedItems[itemId].quantity + 1);
    } else {
      // Add item to the order with quantity 1
      setSelectedItems(prev => ({
        ...prev,
        [itemId]: {
          ...item,
          quantity: 1
        }
      }));
    }
  };

  const handleRemoveFromOrder = (itemId) => {
    const newSelectedItems = { ...selectedItems };
    delete newSelectedItems[itemId];
    setSelectedItems(newSelectedItems);
  };

  const createOrder = async () => {
    if (Object.keys(selectedItems).length === 0) {
      setError("Please select at least one item before placing an order.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Prepare order items array
    const orderItems = Object.entries(selectedItems).map(([itemId, quantity]) => ({
      itemId,
      quantity,
      // Find the corresponding item to include its details
      ...items.find(item => item.id === itemId)
    }));
    
    try {
      // Create order request
      const response = await axios.post(`${config.apiUrl}${config.endpoints.orders.create}`, {
        itemIds: Object.keys(selectedItems),
        orderItems: orderItems
      });
      
      setIsLoading(false);
      
      // Show a better notification than an alert
      const orderConfirmation = document.getElementById('order-confirmation');
      orderConfirmation.classList.add('visible');
      
      // Navigate to payment page after a brief delay
      setTimeout(() => {
        navigate(`/payment/${response.data.order.id}`);
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      setError("Failed to create order. Please try again.");
      console.error('Error creating order:', error);
    }
  };

  const filteredItems = items.filter(item => {
    // Filter by category if not "all"
    const categoryMatch = categoryFilter === "all" || item.itemCategory === categoryFilter;
    
    // Filter by search term
    const searchMatch = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const getItemQuantityInOrder = (itemId) => {
    return selectedItems[itemId]?.quantity || 0;
  };

  // Helper function to render item cards
  const renderItemCard = (item) => {
    const itemId = item.id || item.id;
    const itemImage = item.imageUrl || item.itemImage;
    const isItemInOrder = selectedItems[itemId];
    
    return (
      <div className="menu-item-card" key={itemId}>
        <div className="menu-item-image">
          {itemImage ? (
            <img 
              src={itemImage} 
              alt={item.itemName} 
              onError={(e) => { e.target.src = '/images/default.png'; }}
            />
          ) : (
            <div className="no-image">No image available</div>
          )}
          <div className="item-price">${item.itemPrice.toFixed(2)}</div>
        </div>
        
        <div className="menu-item-details">
          <h3>{item.itemName}</h3>
          <span className="category-badge">{item.itemCategory}</span>
          <p className="item-description">{item.itemDescription}</p>
          
          <div className="item-stock-info">
            <span className={`stock-indicator ${item.itemQty > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {item.itemQty > 0 ? `In Stock: ${item.itemQty}` : 'Out of Stock'}
            </span>
          </div>
        </div>
        
        <div className="menu-item-actions">
          {!isItemInOrder ? (
            <button 
              className="add-to-order-btn"
              onClick={() => handleAddToOrder(item)}
              disabled={item.itemQty <= 0}
            >
              Add to Order
            </button>
          ) : (
            <div className="quantity-control">
              <button 
                className="quantity-btn"
                onClick={() => handleItemQuantityChange(itemId, getItemQuantityInOrder(itemId) - 1)}
              >
                -
              </button>
              <span className="quantity-display">{getItemQuantityInOrder(itemId)}</span>
              <button 
                className="quantity-btn"
                onClick={() => handleItemQuantityChange(itemId, getItemQuantityInOrder(itemId) + 1)}
                disabled={getItemQuantityInOrder(itemId) >= item.itemQty}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="order-form-container">
      <div id="order-confirmation" className="order-confirmation">
        <div className="confirmation-content">
          <div className="check-icon">✓</div>
          <h3>Order Created Successfully!</h3>
          <p>Redirecting to payment...</p>
        </div>
      </div>
      
      <div className="order-header">
        <div className="header-content">
          <div>
            <h1>Create New Order</h1>
            <p>Select items from our menu to create your order</p>
          </div>
          <div className="header-actions">
            <Link to="/allItems" className="back-link">
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
      
      <div className="order-main-container">
        <div className="menu-section">
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="category-filter">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="category-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchItems}>Try Again</button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="no-items-message">
              <p>No items match your search criteria.</p>
              <button onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
              }}>Clear Filters</button>
            </div>
          ) : (
            <div className="menu-items-grid">
              {filteredItems.map(item => renderItemCard(item))}
            </div>
          )}
        </div>
        
        <div className="order-summary">
          <div className="summary-header">
            <h2>Order Summary</h2>
            {Object.keys(selectedItems).length === 0 ? (
              <p className="empty-order-message">Your order is empty. Add items from the menu.</p>
            ) : null}
          </div>
          
          {Object.keys(selectedItems).length > 0 && (
            <>
              <div className="selected-items-list">
                {Object.values(selectedItems).map(item => (
                  <div className="selected-item" key={item.id || item.id}>
                    <div className="selected-item-info">
                      <h4>{item.itemName}</h4>
                      <p>${item.itemPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="selected-item-total">
                      ${(item.itemPrice * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveFromOrder(item.id || item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="subtotal">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="tax">
                  <span>Tax (10%):</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                <div className="total">
                  <span>Total:</span>
                  <span>${(totalPrice * 1.1).toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                className="create-order-btn"
                onClick={createOrder}
                disabled={isLoading || Object.keys(selectedItems).length === 0}
              >
                {isLoading ? "Creating Order..." : "Create Order"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
