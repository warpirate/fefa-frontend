import { 
  loadFeaturesData, 
  loadStylesData, 
  loadProductsData, 
  loadTrendingData, 
  loadTestimonialsData,
  loadCollectionsCategoriesData,
  loadCollectionsOccasionsData,
  loadCollectionsProductsData
} from '../utils/dataLoader';
import { API_HELPERS } from '../config/api';
import browserCache from '../utils/browserCache';

class DataService {
  constructor() {
    // API integration - carousel and categories from backend only, others with local fallback
  }

  // Data endpoints - Carousel only from backend API (with browser cache)
  async getCarousel() {
    // Check browser cache first
    const cacheKey = 'carousel_data';
    const cached = browserCache.get(cacheKey);
    if (cached) {
      return cached; // Instant return from cache
    }

    try {
      const apiResponse = await API_HELPERS.getActiveBanners();
      if (apiResponse.success && apiResponse.data) {
        const result = { success: true, data: apiResponse.data };
        // Cache for 5 minutes
        browserCache.set(cacheKey, result, 300);
        return result;
      } else {
        return { 
          success: false, 
          error: 'No carousel data available from API',
          field: 'carousel',
          message: 'Carousel data loading failed'
        };
      }
    } catch (apiError) {
      // Error('Failed to load carousel data from API:', apiError);
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
      // Error('Failed to load categories data from API:', apiError);
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
      // Error('Failed to load collections categories data:', error);
      return { success: false, error: 'Failed to load collections categories data from local files' };
    }
  }

  async getCollectionsOccasions() {
    try {
      const localData = await loadCollectionsOccasionsData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load collections occasions data:', error);
      return { success: false, error: 'Failed to load collections occasions data from local files' };
    }
  }

  async getCollectionsProducts() {
    try {
      const localData = await loadCollectionsProductsData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load collections products data:', error);
      return { success: false, error: 'Failed to load collections products data from local files' };
    }
  }

  async getFeatures() {
    try {
      const localData = await loadFeaturesData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load features data:', error);
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
      // API call failed, falling back to local data
    }
    
    // Fallback to local data
    try {
      const localData = await loadProductsData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load products data:', error);
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
      // API call failed, falling back to local data
    }
    
    // Fallback to local data - filter featured products
    try {
      const localData = await loadProductsData();
      const featuredProducts = Array.isArray(localData) 
        ? localData.filter((product) => product.isFeatured === true).slice(0, limit)
        : [];
      return { success: true, data: featuredProducts };
    } catch (error) {
      // Error('Failed to load featured products data:', error);
      return { success: false, error: 'Failed to load featured products data from both API and local files' };
    }
  }

  async getStyles() {
    try {
      const localData = await loadStylesData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load styles data:', error);
      return { success: false, error: 'Failed to load styles data from local files' };
    }
  }

  async getTestimonials() {
    try {
      const localData = await loadTestimonialsData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load testimonials data:', error);
      return { success: false, error: 'Failed to load testimonials data from local files' };
    }
  }

  async getTrending() {
    try {
      const localData = await loadTrendingData();
      return { success: true, data: localData };
    } catch (error) {
      // Error('Failed to load trending data:', error);
      return { success: false, error: 'Failed to load trending data from local files' };
    }
  }

  // Get all data at once
  async getAllData() {
    try {
      const [
        carousel,
        categories,
        collectionsCategories,
        collectionsOccasions,
        collectionsProducts,
        features,
        products,
        styles,
        testimonials,
        trending
      ] = await Promise.all([
        this.getCarousel(),
        this.getCategories(),
        this.getCollectionsCategories(),
        this.getCollectionsOccasions(),
        this.getCollectionsProducts(),
        this.getFeatures(),
        this.getProducts(),
        this.getStyles(),
        this.getTestimonials(),
        this.getTrending()
      ]);

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
      // Error('Failed to fetch all data:', error);
      return { success: false, error: error.message };
    }
  }

  // Note: Authentication methods removed as we're using local data only
  // If authentication is needed in the future, implement local storage or other client-side solutions
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
