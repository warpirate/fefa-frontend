import { CarouselItem, Category, Feature, Style, Product, TrendingLook, Testimonial, CollectionCategory, CollectionOccasion } from '@/types/data';
import { API_HELPERS } from '@/config/api';

// Function to load JSON data (fallback)
async function loadJsonData<T>(path: string): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load data from ${path}`);
    }
    return await response.json();
  } catch (error) {
    // Error loading data - silent fail
    throw error;
  }
}

// Function to load data from API with fallback to JSON
async function loadDataWithFallback<T>(
  apiCall: () => Promise<T>,
  jsonPath: string,
  dataKey?: string
): Promise<T> {
  try {
    // Try API first
    const response = await apiCall();
    if (dataKey && typeof response === 'object' && response !== null && dataKey in response) {
      return (response as any)[dataKey];
    }
    return response;
  } catch (error) {
      // API call failed, falling back to JSON data
    try {
      // Fallback to JSON
      return await loadJsonData<T>(jsonPath);
    } catch (jsonError) {
        // Both API and JSON fallback failed
      throw jsonError;
    }
  }
}

// Data loading functions
export const loadCarouselData = (): Promise<CarouselItem[]> => 
  loadJsonData<CarouselItem[]>('/data/carousel.json');

export const loadCategoriesData = (): Promise<Category[]> => 
  loadDataWithFallback(
    () => API_HELPERS.getCategories(),
    '/data/categories.json',
    'data'
  );

export const loadFeaturesData = (): Promise<Feature[]> => 
  loadJsonData<Feature[]>('/data/features.json');

export const loadStylesData = (): Promise<Style[]> => 
  loadJsonData<Style[]>('/data/styles.json');

export const loadProductsData = (): Promise<Product[]> => 
  loadDataWithFallback(
    () => API_HELPERS.getProducts(),
    '/data/products.json',
    'data'
  );

export const loadTrendingData = (): Promise<TrendingLook[]> => 
  loadJsonData<TrendingLook[]>('/data/trending.json');

export const loadTestimonialsData = (): Promise<Testimonial[]> => 
  loadJsonData<Testimonial[]>('/data/testimonials.json');

// Collections data loading functions
export const loadCollectionsProductsData = (): Promise<Product[]> => 
  loadDataWithFallback(
    () => API_HELPERS.getProducts(),
    '/data/collections-products.json',
    'data'
  );

export const loadCollectionsCategoriesData = (): Promise<CollectionCategory[]> => 
  loadJsonData<CollectionCategory[]>('/data/collections-categories.json');

export const loadCollectionsOccasionsData = (): Promise<CollectionOccasion[]> => 
  loadJsonData<CollectionOccasion[]>('/data/collections-occasions.json');

// New API-based functions for collections page
export const loadProductsWithFilters = async (params: {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  isFeatured?: boolean;
}): Promise<{
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    if (params.isFeatured) queryParams.append('isFeatured', 'true');

    const response = await fetch(`${API_HELPERS.getUrl('/products')}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    // Failed to fetch products with filters - using fallback
    // Fallback to JSON data
    const products = await loadJsonData<Product[]>('/data/collections-products.json');
    return {
      data: products,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: products.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};

export const loadProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const response = await fetch(API_HELPERS.getUrl(`/products/${slug}`));
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    // Failed to fetch product by slug - using fallback
    // Fallback to JSON data
    const products = await loadJsonData<Product[]>('/data/collections-products.json');
    return products.find(p => p.slug === slug) || null;
  }
};

export const searchProducts = async (query: string, params?: {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  data: Product[];
  query: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_HELPERS.getUrl('/products/search')}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    // Failed to search products - using fallback
    // Fallback to JSON data with client-side search
    const products = await loadJsonData<Product[]>('/data/collections-products.json');
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    return {
      data: filteredProducts,
      query,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: filteredProducts.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
};
