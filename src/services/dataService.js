import { 
  loadFeaturesData, 
  loadStylesData, 
  loadProductsData, 
  loadTrendingData, 
  loadTestimonialsData,
  loadCollectionsCategoriesData,
  loadCollectionsProductsData
} from '../utils/dataLoader';
import { API_HELPERS } from '../config/api';

class DataService {
  constructor() {
    // API integration - carousel and categories from backend only, others with local fallback
  }

  // Data endpoints - Carousel only from backend API
  async getCarousel() {
    try {
      const apiResponse = await API_HELPERS.getActiveBanners();
      if (apiResponse.success && apiResponse.data) {
        return { success: true, data: apiResponse.data };
      } else {
        return { 
          success: false, 
          error: 'No carousel data available from API',
          field: 'carousel',
          message: 'Carousel data loading failed'
        };
      }
    } catch (apiError) {
      console.error('Failed to load carousel data from API:', apiError);
      return { 
        success: false, 
        error: 'Failed to load carousel data from API',
        field: 'carousel',
        message: 'Carousel data loading failed'
      };
    }
  }

  // Data endpoints - Categories only from backend API
  async getCategories() {
    try {
      const apiResponse = await API_HELPERS.getCategories();
      if (apiResponse.success && apiResponse.data) {
        return { success: true, data: apiResponse.data };
      } else {
        return { 
          success: false, 
          error: 'No categories data available from API',
          field: 'categories',
          message: 'Categories data loading failed'
        };
      }
    } catch (apiError) {
      console.error('Failed to load categories data from API:', apiError);
      return { 
        success: false, 
        error: 'Failed to load categories data from API',
        field: 'categories',
        message: 'Categories data loading failed'
      };
    }
  }

  async getCollectionsCategories() {
    try {
      const localData = await loadCollectionsCategoriesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load collections categories data:', error);
      return { success: false, error: 'Failed to load collections categories data from local files' };
    }
  }

  async getCollectionsOccasions() {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/occasions?sortBy=sortOrder&sortOrder=asc`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { success: true, data: data.data || [] };
        } else {
          return { success: false, error: data.message || 'Failed to load occasions' };
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.message || `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Failed to load collections occasions data:', error);
      return { success: false, error: error.message || 'Failed to load collections occasions data' };
    }
  }

  async getCollectionsProducts() {
    try {
      const localData = await loadCollectionsProductsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load collections products data:', error);
      return { success: false, error: 'Failed to load collections products data from local files' };
    }
  }

  async getFeatures() {
    try {
      const localData = await loadFeaturesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load features data:', error);
      return { success: false, error: 'Failed to load features data from local files' };
    }
  }

  async getProducts() {
    try {
      // Try API first
      const apiResponse = await API_HELPERS.getProducts();
      if (apiResponse.success && apiResponse.data) {
        return { success: true, data: apiResponse.data };
      }
    } catch (apiError) {
      console.warn('API call failed, falling back to local data:', apiError);
    }
    
    // Fallback to local data
    try {
      const localData = await loadProductsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load products data:', error);
      return { success: false, error: 'Failed to load products data from both API and local files' };
    }
  }

  async getFeaturedProducts(limit = 20) {
    try {
      // Try API first
      const apiResponse = await API_HELPERS.getFeaturedProducts(limit);
      if (apiResponse.success && apiResponse.data) {
        // Filter to ensure only featured products are returned
        const featuredProducts = apiResponse.data.filter((product) => product.isFeatured === true);
        return { success: true, data: featuredProducts };
      }
    } catch (apiError) {
      console.warn('API call failed, falling back to local data:', apiError);
    }
    
    // Fallback to local data - filter featured products
    try {
      const localData = await loadProductsData();
      const featuredProducts = Array.isArray(localData) 
        ? localData.filter((product) => product.isFeatured === true).slice(0, limit)
        : [];
      return { success: true, data: featuredProducts };
    } catch (error) {
      console.error('Failed to load featured products data:', error);
      return { success: false, error: 'Failed to load featured products data from both API and local files' };
    }
  }

  async getStyles() {
    try {
      const localData = await loadStylesData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load styles data:', error);
      return { success: false, error: 'Failed to load styles data from local files' };
    }
  }

  async getTestimonials() {
    try {
      const localData = await loadTestimonialsData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load testimonials data:', error);
      return { success: false, error: 'Failed to load testimonials data from local files' };
    }
  }

  async getTrending() {
    try {
      const localData = await loadTrendingData();
      return { success: true, data: localData };
    } catch (error) {
      console.error('Failed to load trending data:', error);
      return { success: false, error: 'Failed to load trending data from local files' };
    }
  }

  // Get all data at once with sequential loading to prevent rate limiting
  async getAllData() {
    try {
      // Helper to add delay between requests
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Load critical API data sequentially with delays to prevent rate limiting
      const carousel = await this.getCarousel();
      await delay(300);
      
      const categories = await this.getCategories();
      await delay(300);
      
      // Load collections data (may use API or fallback)
      const collectionsCategories = await this.getCollectionsCategories();
      await delay(200);
      
      const collectionsOccasions = await this.getCollectionsOccasions();
      await delay(200);
      
      // Load products (may use API or fallback) - this is a heavy request
      const collectionsProducts = await this.getCollectionsProducts();
      await delay(400);
      
      // Load remaining data in parallel (these use local fallback, less critical)
      const [features, styles, testimonials, trending] = await Promise.all([
        this.getFeatures(),
        this.getStyles(),
        this.getTestimonials(),
        this.getTrending()
      ]);
      
      // Products can be loaded separately as it's heavy
      const products = await this.getProducts();

      return {
        success: true,
        data: {
          carousel: carousel.success ? carousel.data : null,
          categories: categories.success ? categories.data : null,
          collectionsCategories: collectionsCategories.success ? collectionsCategories.data : null,
          collectionsOccasions: collectionsOccasions.success ? collectionsOccasions.data : null,
          collectionsProducts: collectionsProducts.success ? collectionsProducts.data : null,
          features: features.success ? features.data : null,
          products: products.success ? products.data : null,
          styles: styles.success ? styles.data : null,
          testimonials: testimonials.success ? testimonials.data : null,
          trending: trending.success ? trending.data : null
        }
      };
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      return { success: false, error: error.message };
    }
  }

  // Note: Authentication methods removed as we're using local data only
  // If authentication is needed in the future, implement local storage or other client-side solutions
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
