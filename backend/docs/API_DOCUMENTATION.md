# API Documentation

## Base URL
- Local: `http://localhost:5000/api`
- Production: Replace with your deployed API URL

## Authentication Endpoints

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "token": "jwt-token-here",
      "message": "✨ :: User registered successfully!"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "status": false,
      "message": "⚠️ :: User Already Exists!"
    }
    ```

### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "token": "jwt-token-here",
      "message": "✨ :: Login successful!"
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "messageEmail": "User with this email does not exist."
    }
    ```
  - OR
    ```json
    {
      "messagePw": "Invalid password."
    }
    ```

## Item Management Endpoints

### Create Item
- **URL**: `/create`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `itemName`: String (required)
  - `itemCategory`: String (required)
  - `itemPrice`: Number (required)
  - `itemQty`: Number (required)
  - `itemDescription`: String (required)
  - `itemImage`: File (required) - Image file to upload
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Data saved successfully!",
      "item": {
        "id": "unique-item-id",
        "itemName": "Coffee",
        "itemCategory": "Beverages",
        "itemPrice": 5.99,
        "itemQty": 100,
        "itemDescription": "Freshly brewed coffee",
        "itemImage": "s3-image-key.jpg",
        "isS3Image": true,
        "createdAt": "2023-05-05T12:00:00.000Z",
        "updatedAt": "2023-05-05T12:00:00.000Z"
      }
    }
    ```
- **Error Response**:
  - **Code**: 400/500
  - **Content**:
    ```json
    {
      "status": false,
      "message": "Error message here"
    }
    ```

### Get All Items
- **URL**: `/items`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: All items are fetched!",
      "AllItems": [
        {
          "id": "unique-item-id-1",
          "itemName": "Coffee",
          "itemCategory": "Beverages",
          "itemPrice": 5.99,
          "itemQty": 100,
          "itemDescription": "Freshly brewed coffee",
          "itemImage": "s3-image-key-1.jpg",
          "isS3Image": true,
          "imageUrl": "https://presigned-s3-url.com/image.jpg",
          "createdAt": "2023-05-05T12:00:00.000Z",
          "updatedAt": "2023-05-05T12:00:00.000Z"
        },
        // More items...
      ]
    }
    ```

### Get One Item
- **URL**: `/item/:id`
- **Method**: `GET`
- **Auth Required**: No
- **URL Parameters**: `id` - Item ID
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Item Fetched!",
      "Item": {
        "id": "unique-item-id",
        "itemName": "Coffee",
        "itemCategory": "Beverages",
        "itemPrice": 5.99,
        "itemQty": 100,
        "itemDescription": "Freshly brewed coffee",
        "itemImage": "s3-image-key.jpg",
        "isS3Image": true,
        "imageUrl": "https://presigned-s3-url.com/image.jpg",
        "createdAt": "2023-05-05T12:00:00.000Z",
        "updatedAt": "2023-05-05T12:00:00.000Z"
      }
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "status": false,
      "message": "Item not found"
    }
    ```

### Search Items
- **URL**: `/searchItem`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**: `itemName` - Search term
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Project Searched and fetched!",
      "searchedItem": [
        {
          "id": "unique-item-id",
          "itemName": "Coffee",
          "itemCategory": "Beverages",
          "itemPrice": 5.99,
          "itemQty": 100,
          "itemDescription": "Freshly brewed coffee",
          "itemImage": "s3-image-key.jpg",
          "isS3Image": true,
          "imageUrl": "https://presigned-s3-url.com/image.jpg",
          "createdAt": "2023-05-05T12:00:00.000Z",
          "updatedAt": "2023-05-05T12:00:00.000Z"
        },
        // More matching items...
      ]
    }
    ```

### Update Item
- **URL**: `/itemUpdate/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **Content-Type**: `multipart/form-data`
- **URL Parameters**: `id` - Item ID
- **Request Body**:
  - `itemName`: String (required)
  - `itemCategory`: String (required)
  - `itemPrice`: Number (required)
  - `itemQty`: Number (required)
  - `itemDescription`: String (required)
  - `itemImage`: File (optional) - New image file to upload
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Item Updated!",
      "UpdateItemObj": {
        "id": "unique-item-id",
        "itemName": "Updated Coffee",
        "itemCategory": "Hot Beverages",
        "itemPrice": 6.99,
        "itemQty": 150,
        "itemDescription": "Premium freshly brewed coffee",
        "itemImage": "s3-image-key.jpg",
        "isS3Image": true,
        "createdAt": "2023-05-05T12:00:00.000Z",
        "updatedAt": "2023-05-06T15:30:00.000Z"
      }
    }
    ```

### Delete Item
- **URL**: `/deleteItem/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **URL Parameters**: `id` - Item ID
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Item Deleted!"
    }
    ```

### Delete Image
- **URL**: `/deleteImage/:imageKey`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **URL Parameters**: `imageKey` - S3 image key to delete
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "status": true,
      "message": "✨ :: Image deleted successfully!"
    }
    ```

### Generate Invoice
- **URL**: `/generate-invoice`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "filepath": "http://localhost:5000/docs/Item_Management_2023_05_05_12_00_00_doc.pdf",
      "filename": "Item_Management_2023_05_05_12_00_00_doc.pdf"
    }
    ```

## Order Management Endpoints

### Create Order
- **URL**: `/order/create`
- **Method**: `POST`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **Request Body**:
  ```json
  {
    "itemIds": ["item-id-1", "item-id-2"]
  }
  ```
- **Success Response**:
  - **Code**: 201
  - **Content**:
    ```json
    {
      "success": true,
      "order": {
        "id": "unique-order-id",
        "itemIds": ["item-id-1", "item-id-2"],
        "createdAt": "2023-05-05T12:00:00.000Z"
      }
    }
    ```
- **Error Response**:
  - **Code**: 400
  - **Content**:
    ```json
    {
      "success": false,
      "error": "No items provided for the order"
    }
    ```

### Get All Orders
- **URL**: `/order/`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "orders": [
        {
          "id": "unique-order-id-1",
          "itemIds": ["item-id-1", "item-id-2"],
          "createdAt": "2023-05-05T12:00:00.000Z"
        },
        // More orders...
      ]
    }
    ```

### Get Order by ID
- **URL**: `/order/:id`
- **Method**: `GET`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **URL Parameters**: `id` - Order ID
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "order": {
        "id": "unique-order-id",
        "itemIds": ["item-id-1", "item-id-2"],
        "createdAt": "2023-05-05T12:00:00.000Z"
      }
    }
    ```
- **Error Response**:
  - **Code**: 404
  - **Content**:
    ```json
    {
      "success": false,
      "error": "Order not found"
    }
    ```

### Update Order
- **URL**: `/order/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **URL Parameters**: `id` - Order ID
- **Request Body**:
  ```json
  {
    "itemIds": ["item-id-1", "item-id-3", "item-id-4"]
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "order": {
        "id": "unique-order-id",
        "itemIds": ["item-id-1", "item-id-3", "item-id-4"],
        "createdAt": "2023-05-05T12:00:00.000Z",
        "updatedAt": "2023-05-06T15:30:00.000Z"
      }
    }
    ```

### Delete Order
- **URL**: `/order/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT Token in Authorization header)
- **URL Parameters**: `id` - Order ID
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Order deleted successfully"
    }
    ```

## Health Check

### API Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**: `OK`