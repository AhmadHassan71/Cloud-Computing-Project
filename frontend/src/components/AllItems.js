import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AllItems.css";

// Import config
import config from '../config';

// Import shared components
import Card from './shared/Card';
import Button from './shared/Button';
import FormInput from './shared/FormInput';
import Spinner from './shared/Spinner';
import Modal from './shared/Modal';
import Badge from './shared/Badge';

const AllItems = () => {
  const [allItems, setAllItems] = useState([]);
  const [allOriginalItems, setAllOriginalItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  // Fetch all items when component mounts
  useEffect(() => {
    fetchAllItems();
  }, []);

  // Extract unique categories
  useEffect(() => {
    if (allOriginalItems.length > 0) {
      const uniqueCategories = [...new Set(allOriginalItems.map(item => item.itemCategory))];
      setCategories(uniqueCategories);
    }
  }, [allOriginalItems]);

  const fetchAllItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${config.apiUrl}${config.endpoints.items.base}`);
      setAllItems(response.data.AllItems);
      setAllOriginalItems(response.data.AllItems);
      console.log(response.data.message);
    } catch (err) {
      setError("Failed to fetch items. Please try again later.");
      console.error("Error fetching items:", err.message);
      toast.error("Failed to fetch items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteItemId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.delete(`${config.apiUrl}${config.endpoints.items.delete}/${deleteItemId}`);
      toast.success(response.data.message);
      
      // Update the items list without reloading the page
      setAllItems(allItems.filter(item => item.id !== deleteItemId));
      setAllOriginalItems(allOriginalItems.filter(item => item.id !== deleteItemId));
      
      setDeleteModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete item. Please try again.");
      console.error("Error deleting item:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === "") {
      // Apply only category filter when search is empty
      applyFilters("", categoryFilter);
    } else {
      // Apply both search and category filters
      applyFilters(value, categoryFilter);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setCategoryFilter(category);
    applyFilters(searchTerm, category);
  };

  const applyFilters = async (search, category) => {
    if (search) {
      try {
        const response = await axios.get(`${config.apiUrl}${config.endpoints.items.search}`, {
          params: { itemName: search }
        });
        
        let filteredItems = response.data.searchedItem;
        
        // Apply category filter to search results if needed
        if (category !== "all") {
          filteredItems = filteredItems.filter(item => item.itemCategory === category);
        }
        
        setAllItems(filteredItems);
      } catch (err) {
        console.error("Error searching items:", err.message);
        toast.error("Error searching items. Please try again.");
      }
    } else {
      // Only apply category filter
      let filteredItems = [...allOriginalItems];
      
      if (category !== "all") {
        filteredItems = filteredItems.filter(item => item.itemCategory === category);
      }
      
      setAllItems(filteredItems);
    }
  };

  const renderItemCard = (item, index) => {
    return (
      <div className="item-card-wrapper" key={item.id || item.id}>
        <Card className="item-card">
          <div className="item-image-container">
            <img 
              src={item.imageUrl || `../uploads/${item.itemImage}`} 
              alt={item.itemName}
              className="item-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../images/default.png";
              }}
            />
            <Badge type="primary" className="item-price">${item.itemPrice.toFixed(2)}</Badge>
          </div>
          
          <div className="item-details">
            <h3 className="item-name">{item.itemName}</h3>
            <Badge type="secondary" size="small" className="item-category">{item.itemCategory}</Badge>
            
            <div className="item-quantity">
              <span className="quantity-label">Quantity:</span>
              <span className="quantity-value">{item.itemQty}</span>
            </div>
            
            <p className="item-description">{item.itemDescription}</p>
            
            <div className="item-actions">
              <Link to={`/updateform/${item.id || item.id}`}>
                <Button variant="secondary" size="small">Edit</Button>
              </Link>
              <Button 
                variant="danger" 
                size="small" 
                onClick={() => handleDelete(item.id || item.id)}
              >
                Delete
              </Button>
              <Link to={`/payment/${item.id || item.id}`}>
                <Button variant="primary" size="small">Order</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="all-items-container">
      <Card className="header-card">
        <div className="header-content">
          <div className="page-title">
            <h1>Menu Items</h1>
            <p>Manage your coffee shop menu items</p>
          </div>
          
          <div className="header-actions">
            <Link to="/createform">
              <Button variant="primary">
                Add New Item
              </Button>
            </Link>
          </div>
        </div>
      </Card>
      
      <div className="filters-container">
        <Card className="filters-card">
          <div className="filters-content">
            <div className="search-box">
              <FormInput
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                icon={<i className="fas fa-search"></i>}
              />
            </div>
            
            <div className="category-filter">
              <select 
                className="category-select"
                value={categoryFilter}
                onChange={handleCategoryChange}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="spinner-container">
          <Spinner size="large" text="Loading menu items..." />
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button variant="primary" onClick={fetchAllItems}>
            Try Again
          </Button>
        </div>
      ) : allItems.length === 0 ? (
        <div className="no-items-container">
          <Card className="no-items-card">
            <div className="no-items-content">
              <h3>No Items Found</h3>
              <p>There are no items matching your search criteria.</p>
              {searchTerm || categoryFilter !== "all" ? (
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setAllItems(allOriginalItems);
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Link to="/createform">
                  <Button variant="primary">
                    Add First Item
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="items-grid">
          {allItems.map((item, index) => renderItemCard(item, index))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="small"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AllItems;
