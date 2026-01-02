// API Configuration for FEFA Jewelry Frontend
const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
  // API endpoints
  ENDPOINTS: {
    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_SLUG: '/categories',
    
    // Banners/Carousel
    BANNERS: '/banners',
    BANNERS_ACTIVE: '/banners/active',
    BANNER_BY_ID: '/banners',
    BANNER_CREATE: '/banners',
    BANNER_UPDATE: '/banners',
    BANNER_DELETE: '/banners',
    BANNER_CLICK: '/banners',
    BANNER_IMPRESSION: '/banners',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: '/products',
    PRODUCTS_BY_CATEGORY: '/products/category',
    PRODUCTS_SEARCH: '/products/search',
    
    // Users
    USERS: '/users',
    USER_PROFILE: '/users/profile',
    
  // Cart
  CART: '/cart',
  CART_ADD: '/cart',
  CART_UPDATE: '/cart',
  CART_REMOVE: '/cart',
  CART_CLEAR: '/cart',
  
  // Wishlist
  WISHLIST: '/wishlist',
  WISHLIST_ADD: '/wishlist',
  WISHLIST_UPDATE: '/wishlist',
  WISHLIST_REMOVE: '/wishlist',
  WISHLIST_CLEAR: '/wishlist',
  WISHLIST_MOVE_TO_CART: '/wishlist',
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEWS_PRODUCT: '/reviews/product',
  REVIEWS_CREATE: '/reviews',
  REVIEWS_UPDATE: '/reviews',
  REVIEWS_DELETE: '/reviews',
  REVIEWS_HELPFUL: '/reviews',
    
    // Orders
    ORDERS: '/orders',
    
    // Auth
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_REFRESH: '/auth/refresh'
  },
  
  // Local data paths (fallback)
  DATA_PATHS: {
    CAROUSEL: '/data/carousel.json',
    CATEGORIES: '/data/categories.json',
    COLLECTIONS_CATEGORIES: '/data/collections-categories.json',
    COLLECTIONS_OCCASIONS: '/data/collections-occasions.json',
    COLLECTIONS_PRODUCTS: '/data/collections-products.json',
    FEATURES: '/data/features.json',
    PRODUCTS: '/data/products.json',
    STYLES: '/data/styles.json',
    TESTIMONIALS: '/data/testimonials.json',
    TRENDING: '/data/trending.json'
  },
  
  // Image paths
  IMAGE_PATHS: {
    BASE: '/images/',
    PRODUCTS: '/images/',
    CAROUSEL: '/images/',
    CATEGORIES: '/images/'
  }
};

// Retry function with exponential backoff for rate limiting (429 errors)
async function fetchWithRetry(url, maxRetries = 3, initialDelay = 1000) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      
      // If rate limited (429), retry with exponential backoff
      if (response.status === 429 && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Rate limited (429). Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

// Helper functions for API calls
const API_HELPERS = {
  // Get full API URL
  getUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Categories API
  getCategories: async () => {
    try {
      const response = await fetchWithRetry(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.CATEGORIES));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },
  
  getCategoryBySlug: async (slug) => {
    try {
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.CATEGORY_BY_SLUG}/${slug}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch category by slug:', error);
      throw error;
    }
  },
  
  // Banners API
  getBanners: async () => {
    try {
      const response = await fetch(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.BANNERS));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      throw error;
    }
  },
  
  getActiveBanners: async () => {
    try {
      // Use /banners endpoint instead of /banners/active to get all active banners
      // regardless of date restrictions (startDate/endDate)
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetchWithRetry(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.BANNERS + cacheBuster));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch active banners:', error);
      throw error;
    }
  },
  
  // Products API
  getProducts: async () => {
    try {
      const response = await fetchWithRetry(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },
  
  getFeaturedProducts: async (limit = 20) => {
    try {
      const response = await fetchWithRetry(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}?isFeatured=true&limit=${limit}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  },
  
  getProductById: async (id) => {
    try {
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCT_BY_ID}/${id}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch product by ID:', error);
      throw error;
    }
  },
  
  getProductsByCategory: async (category) => {
    try {
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS_BY_CATEGORY}/${category}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      throw error;
    }
  },
  
  searchProducts: async (query) => {
    try {
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS_SEARCH}?q=${encodeURIComponent(query)}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  },
  
  // Cart API
  getCart: async () => {
    try {
      const token = localStorage.getItem('fefa_access_token');
      const response = await fetch(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.CART), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1, variantId = null) => {
    try {
      const token = localStorage.getItem('fefa_access_token');
      const response = await fetch(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.CART_ADD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          productId,
          quantity,
          variantId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const token = localStorage.getItem('fefa_access_token');
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.CART_UPDATE}/${productId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const token = localStorage.getItem('fefa_access_token');
      const response = await fetch(API_HELPERS.getUrl(`${API_CONFIG.ENDPOINTS.CART_REMOVE}/${productId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const token = localStorage.getItem('fefa_access_token');
      const response = await fetch(API_HELPERS.getUrl(API_CONFIG.ENDPOINTS.CART_CLEAR), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Generic fetch with error handling
  fetchWithErrorHandling: async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};

export default API_CONFIG;
export { API_HELPERS };
