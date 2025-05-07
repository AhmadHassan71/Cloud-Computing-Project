import React, { useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './CreateForm.css';

// Import config
import config from '../config';

// Import shared components
import Card from './shared/Card';
import Button from './shared/Button';
import FormInput from './shared/FormInput';
import Alert from './shared/Alert';
import Spinner from './shared/Spinner';

const CreateForm = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        itemName: '',
        itemCategory: '',
        itemPrice: '',
        itemQty: '',
        itemDescription: ''
    });
    
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
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
        } else {
            setPreviewImage(null);
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
        
        if (!fileInputRef.current.files[0]) {
            newErrors.itemImage = 'Item image is required';
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
        submitFormData.append('itemImage', fileInputRef.current.files[0]);
        
        try {
            const response = await axios.post(
                `${config.apiUrl}${config.endpoints.items.create}`, 
                submitFormData, 
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            
            setAlert({
                type: 'success',
                message: 'Item created successfully!'
            });
            
            // Reset form
            setFormData({
                itemName: '',
                itemCategory: '',
                itemPrice: '',
                itemQty: '',
                itemDescription: ''
            });
            
            fileInputRef.current.value = '';
            setPreviewImage(null);
            
            // Navigate to items list after a short delay
            setTimeout(() => {
                navigate('/allItems');
            }, 2000);
            
        } catch (error) {
            console.error("Error creating item:", error);
            setAlert({
                type: 'error',
                message: error.response?.data?.message || 'An error occurred while creating the item. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const categories = ['Coffee', 'Tea', 'Pastry', 'Snack', 'Dessert', 'Beverage'];
    
    return (
        <div className="create-form-container">
            <Card className="create-form-card">
                <div className="create-form-header">
                    <h2>Add New Menu Item</h2>
                    <p>Create a new item to add to your menu collection</p>
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
                                    <option value="Other">Other</option>
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
                                    Item Image <span className="required-indicator">*</span>
                                </label>
                                
                                <div className="image-preview-container">
                                    {previewImage ? (
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="image-preview" 
                                        />
                                    ) : (
                                        <div className="image-placeholder">
                                            <div className="placeholder-text">
                                                <i className="placeholder-icon">📷</i>
                                                <span>Select an image</span>
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
                                    {previewImage ? 'Change Image' : 'Browse Image'}
                                </Button>
                                
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
                            {isLoading ? <Spinner size="small" text="" /> : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateForm;
