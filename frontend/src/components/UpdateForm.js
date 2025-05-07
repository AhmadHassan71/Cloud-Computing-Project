import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import './CreateForm.css';

// Import config
import config from '../config';

// Import shared components
import Card from './shared/Card';
import Button from './shared/Button';
import FormInput from './shared/FormInput';
import Alert from './shared/Alert';
import Spinner from './shared/Spinner';

const UpdateForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        itemName: '',
        itemCategory: '',
        itemPrice: '',
        itemQty: '',
        itemDescription: ''
    });
    
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    
    // Fetch item data when component mounts
    useEffect(() => {
        fetchItemData();
    }, [id]);
    
    const fetchItemData = async () => {
        setIsFetching(true);
        
        try {
            const response = await axios.get(`${config.apiUrl}/item/${id}`);
            const item = response.data.Item;
            
            setFormData({
                itemName: item.itemName,
                itemCategory: item.itemCategory,
                itemPrice: item.itemPrice,
                itemQty: item.itemQty,
                itemDescription: item.itemDescription
            });
            
            setUploadedFileName(item.itemImage);
            
            // If we have an image filename, set preview image URL
            if (item.itemImage) {
                try {
                    // Assuming images are stored in a way that they can be accessed through a URL
                    setPreviewImage(`../uploads/${item.itemImage}`);
                } catch (error) {
                    console.error("Error setting preview image:", error);
                }
            }
            
            console.log("✨ Item fetched successfully!");
        } catch (error) {
            setAlert({
                type: 'error',
                message: 'Failed to fetch item data. Please try again.'
            });
            console.error("Error fetching item:", error);
        } finally {
            setIsFetching(false);
        }
    };
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
        
        // Clear error for this field when user types
        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: ''
            });
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a preview URL for the selected image
            const imageUrl = URL.createObjectURL(file);
            setPreviewImage(imageUrl);
            
            // Clear any previous file error
            if (errors.itemImage) {
                setErrors({
                    ...errors,
                    itemImage: ''
                });
            }
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.itemName.trim()) {
            newErrors.itemName = 'Item name is required';
        }
        
        if (!formData.itemCategory.trim()) {
            newErrors.itemCategory = 'Item category is required';
        }
        
        if (!formData.itemPrice) {
            newErrors.itemPrice = 'Item price is required';
        } else if (parseFloat(formData.itemPrice) <= 0) {
            newErrors.itemPrice = 'Price must be greater than 0';
        }
        
        if (!formData.itemQty) {
            newErrors.itemQty = 'Item quantity is required';
        } else if (parseInt(formData.itemQty) < 0) {
            newErrors.itemQty = 'Quantity cannot be negative';
        }
        
        if (!formData.itemDescription.trim()) {
            newErrors.itemDescription = 'Item description is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setAlert({
                type: 'error',
                message: 'Please fix the errors in the form before submitting.'
            });
            return;
        }
        
        setIsLoading(true);
        setAlert(null);
        
        const submitFormData = new FormData();
        submitFormData.append('itemName', formData.itemName);
        submitFormData.append('itemCategory', formData.itemCategory);
        submitFormData.append('itemPrice', formData.itemPrice);
        submitFormData.append('itemQty', formData.itemQty);
        submitFormData.append('itemDescription', formData.itemDescription);
        
        // Only append file if a new one was selected
        if (fileInputRef.current.files[0]) {
            submitFormData.append('itemImage', fileInputRef.current.files[0]);
        }
        
        try {
            const response = await axios.patch(
                `${config.apiUrl}${config.endpoints.items.update}/${id}`, 
                submitFormData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            
            setAlert({
                type: 'success',
                message: 'Item updated successfully!'
            });
            
            // Navigate to items list after a short delay
            setTimeout(() => {
                navigate('/allItems');
            }, 1500);
            
        } catch (error) {
            console.error("Error updating item:", error);
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'An error occurred while updating the item. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const categories = ['Coffee', 'Tea', 'Pastry', 'Snack', 'Dessert', 'Beverage', 'Other'];
    
    if (isFetching) {
        return (
            <div className="create-form-container">
                <Card className="create-form-card">
                    <div className="spinner-container">
                        <Spinner size="large" text="Loading item data..." />
                    </div>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="create-form-container">
            <Card className="create-form-card">
                <div className="create-form-header">
                    <h2>Update Menu Item</h2>
                    <p>Update the details of your menu item</p>
                </div>
                
                {alert && (
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        dismissible 
                        onClose={() => setAlert(null)}
                    />
                )}
                
                <form onSubmit={handleSubmit} className="create-form">
                    <div className="form-row">
                        <div className="form-col">
                            <FormInput
                                label="Item Name"
                                id="itemName"
                                placeholder="Enter item name"
                                value={formData.itemName}
                                onChange={handleChange}
                                error={errors.itemName}
                                required
                            />
                            
                            <div className="category-input-container">
                                <label htmlFor="itemCategory" className="form-input-label">
                                    Item Category <span className="required-indicator">*</span>
                                </label>
                                <select
                                    id="itemCategory"
                                    className="form-input category-input"
                                    value={formData.itemCategory}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.itemCategory && (
                                    <div className="form-input-error">{errors.itemCategory}</div>
                                )}
                            </div>
                            
                            <div className="price-qty-row">
                                <FormInput
                                    label="Price ($)"
                                    id="itemPrice"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.itemPrice}
                                    onChange={handleChange}
                                    error={errors.itemPrice}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                
                                <FormInput
                                    label="Quantity"
                                    id="itemQty"
                                    type="number"
                                    placeholder="0"
                                    value={formData.itemQty}
                                    onChange={handleChange}
                                    error={errors.itemQty}
                                    min="0"
                                    required
                                />
                            </div>
                            
                            <FormInput
                                label="Description"
                                id="itemDescription"
                                type="textarea"
                                placeholder="Enter item description"
                                value={formData.itemDescription}
                                onChange={handleChange}
                                error={errors.itemDescription}
                                required
                            />
                        </div>
                        
                        <div className="form-col">
                            <div className="image-upload-container">
                                <label className="form-input-label">
                                    Item Image
                                </label>
                                
                                <div className="image-preview-container">
                                    {previewImage ? (
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="image-preview"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "../images/default.png";
                                            }}
                                        />
                                    ) : (
                                        <div className="image-placeholder">
                                            <div className="placeholder-text">
                                                <i className="placeholder-icon">📷</i>
                                                <span>No image selected</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <input
                                    type="file"
                                    id="itemImage"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="file-input"
                                />
                                
                                <Button 
                                    type="button" 
                                    variant="secondary"
                                    fullWidth
                                    onClick={() => document.getElementById('itemImage').click()}
                                >
                                    {uploadedFileName ? 'Change Image' : 'Browse Image'}
                                </Button>
                                
                                {uploadedFileName && (
                                    <div className="current-image-info">
                                        Current image: {uploadedFileName}
                                    </div>
                                )}
                                
                                {errors.itemImage && (
                                    <div className="form-input-error">{errors.itemImage}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => navigate('/allItems')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        
                        <Button 
                            type="submit" 
                            variant="primary"
                            disabled={isLoading}
                        >
                            {isLoading ? <Spinner size="small" text="" /> : 'Update Item'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UpdateForm;