import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService.js';

export const useData = () => {
  const [data, setData] = useState({
    carousel: null,
    categories: null,
    collectionsCategories: null,
    collectionsOccasions: null,
    collectionsProducts: null,
    features: null,
    products: null,
    styles: null,
    testimonials: null,
    trending: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Load all data with retry mechanism
  const loadAllData = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dataService.getAllData();
      
      if (result.success) {
        setData(result.data);
      } else {
        // If it's a rate limit error and we haven't retried too many times, retry after a delay
        if (result.error.includes('Rate limit exceeded') && retryCount < 3) {
          setTimeout(() => {
            loadAllData(retryCount + 1);
          }, (retryCount + 1) * 2000); // Exponential backoff: 2s, 4s, 6s
          return;
        }
        
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific data
  const loadCarousel = useCallback(async () => {
    const result = await dataService.getCarousel();
    if (result.success) {
      setData(prev => ({ ...prev, carousel: result.data }));
      setFieldErrors(prev => ({ ...prev, carousel: null }));
    } else {
      setFieldErrors(prev => ({ ...prev, carousel: result.message || result.error }));
    }
    return result;
  }, []);

  const loadCategories = useCallback(async () => {
    const result = await dataService.getCategories();
    if (result.success) {
      setData(prev => ({ ...prev, categories: result.data }));
      setFieldErrors(prev => ({ ...prev, categories: null }));
    } else {
      setFieldErrors(prev => ({ ...prev, categories: result.message || result.error }));
    }
    return result;
  }, []);

  const loadProducts = useCallback(async () => {
    const result = await dataService.getProducts();
    if (result.success) {
      setData(prev => ({ ...prev, products: result.data }));
    }
    return result;
  }, []);

  const loadFeatures = useCallback(async () => {
    const result = await dataService.getFeatures();
    if (result.success) {
      setData(prev => ({ ...prev, features: result.data }));
    }
    return result;
  }, []);

  const loadTestimonials = useCallback(async () => {
    const result = await dataService.getTestimonials();
    if (result.success) {
      setData(prev => ({ ...prev, testimonials: result.data }));
    }
    return result;
  }, []);

  const loadTrending = useCallback(async () => {
    const result = await dataService.getTrending();
    if (result.success) {
      setData(prev => ({ ...prev, trending: result.data }));
    }
    return result;
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    data,
    loading,
    error,
    fieldErrors,
    loadAllData,
    loadCarousel,
    loadCategories,
    loadProducts,
    loadFeatures,
    loadTestimonials,
    loadTrending,
    // Individual data getters
    carousel: data.carousel,
    categories: data.categories,
    collectionsCategories: data.collectionsCategories,
    collectionsOccasions: data.collectionsOccasions,
    collectionsProducts: data.collectionsProducts,
    features: data.features,
    products: data.products,
    styles: data.styles,
    testimonials: data.testimonials,
    trending: data.trending
  };
};
