/**
 * Configuration file for API URLs and other environment-specific settings
 * Uses environment variables with fallbacks for development
 */

const config = {
  // Base API URL for all backend requests
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // S3 Configuration
  s3: {
    // Base URL for S3 assets (only used when not using presigned URLs)
    baseUrl: process.env.REACT_APP_S3_BASE_URL || '',
    
    // Whether to use presigned URLs for S3 images
    // When true, the backend will provide presigned URLs with the items
    usePresignedUrls: process.env.REACT_APP_USE_PRESIGNED_URLS !== 'false' || true,
  },
  
  // Testing mode configuration
  testing: {
    // Enable testing mode (set to false in production)
    enabled: process.env.REACT_APP_TESTING_MODE === 'true' || true,
    
    // Testing credentials
    credentials: {
      email: 'test@example.com',
      password: 'test123',
    }
  },
  
  // Individual API endpoints
  endpoints: {
    // Auth endpoints
    auth: {
      login: '/auth/login',
      register: '/auth/register',
    },
    
    // Item endpoints
    items: {
      base: '/items',
      create: '/create',
      update: '/updateItem',
      delete: '/deleteItem',
      search: '/searchItem',
      deleteImage: '/deleteImage',
    },
    
    // Order endpoints
    orders: {
      base: '/orders',
      create: '/order/create',
      all: '/orders',
      byId: '/order',
    },
    
    // Invoice endpoints
    invoice: {
      generate: '/generate-invoice',
    }
  }
};

export default config;