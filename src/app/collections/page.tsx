'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import ProductCard from '@/components/product/ProductCard';
import { useSearch } from '@/contexts/SearchContext';
import { 
  loadCollectionsProductsData, 
  loadCollectionsCategoriesData, 
  loadProductsWithFilters,
  searchProducts
} from '@/utils/dataLoader';
import { Product, CollectionCategory, CollectionOccasion } from '@/types/data';
import '@/styles/components/collections/Collections.css';

// Import product images for fallback
import product1 from '@/assets/images/product-1.png';
import product1Hover from '@/assets/images/product-1-hover.png';
import product2 from '@/assets/images/product-2.png';
import product2Hover from '@/assets/images/product-2-hover.png';
import product3 from '@/assets/images/product-3.png';
import product3Hover from '@/assets/images/product-3-hover.png';
import product4 from '@/assets/images/product-4.png';
import product4Hover from '@/assets/images/product-4-hover.png';
import product5 from '@/assets/images/product-5.png';
import product5Hover from '@/assets/images/product-5-hover.png';
import product6 from '@/assets/images/product-6.png';
import product6Hover from '@/assets/images/product-6-hover.png';
import product7 from '@/assets/images/product-7.png';
import product7Hover from '@/assets/images/product-7-hover.png';
import product8 from '@/assets/images/product-8.png';
import product8Hover from '@/assets/images/product-8-hover.png';

// Image mapping for fallback
const imageMap: { [key: string]: any } = {
  '/images/product-1.png': product1,
  '/images/product-1-hover.png': product1Hover,
  '/images/product-2.png': product2,
  '/images/product-2-hover.png': product2Hover,
  '/images/product-3.png': product3,
  '/images/product-3-hover.png': product3Hover,
  '/images/product-4.png': product4,
  '/images/product-4-hover.png': product4Hover,
  '/images/product-5.png': product5,
  '/images/product-5-hover.png': product5Hover,
  '/images/product-6.png': product6,
  '/images/product-6-hover.png': product6Hover,
  '/images/product-7.png': product7,
  '/images/product-7-hover.png': product7Hover,
  '/images/product-8.png': product8,
  '/images/product-8-hover.png': product8Hover,
};

const sortOptions = [
  { name: 'Newest', value: 'newest' },
  { name: 'Price: Low to High', value: 'price_asc' },
  { name: 'Price: High to Low', value: 'price_desc' },
];


function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { searchQuery, clearSearch, isSearchActive } = useSearch();
  
  // Initialize state from URL params immediately to prevent flash
  const initialOccasionParam = searchParams.get('occasion') || null;
  const initialCategoryParam = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  
  // Parse multiple categories from URL (comma-separated)
  const parseCategoriesFromUrl = (categoryParam: string): string[] => {
    if (categoryParam === 'all') {
      return ['all'];
    }
    // Split by comma and filter out empty strings
    const categories = categoryParam.split(',').map(c => c.trim()).filter(c => c.length > 0);
    return categories.length > 0 ? categories : ['all'];
  };
  
  // Parse multiple occasions from URL (comma-separated)
  const parseOccasionsFromUrl = (occasionParam: string | null): string[] => {
    if (!occasionParam) {
      return ['all'];
    }
    // Split by comma and filter out empty strings
    const occasions = occasionParam.split(',').map(o => o.trim()).filter(o => o.length > 0);
    return occasions.length > 0 ? occasions : ['all'];
  };
  
  const initialCategories = parseCategoriesFromUrl(initialCategoryParam);
  const initialOccasions = parseOccasionsFromUrl(initialOccasionParam);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(initialOccasions);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000]); // Increased default maxPrice to show all products
  
  // Pending filter states (not applied yet)
  const [pendingCategories, setPendingCategories] = useState<string[]>(initialCategories);
  const [pendingOccasions, setPendingOccasions] = useState<string[]>(initialOccasions);
  const [pendingPriceRange, setPendingPriceRange] = useState([0, 100000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isOccasionDropdownOpen, setIsOccasionDropdownOpen] = useState(
    initialOccasions.length > 0 && !initialOccasions.includes('all')
  );
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [occasions, setOccasions] = useState<CollectionOccasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Occasion selection state (for the new UI) - use first occasion for backward compatibility
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(
    initialOccasions.length > 0 && !initialOccasions.includes('all') ? initialOccasions[0] : null
  );

  const [occasionCounts, setOccasionCounts] = useState<Record<string, number>>({});
  
  // Track if counts are being loaded to prevent concurrent calls
  const isLoadingCountsRef = useRef(false);
  const lastLoadTimeRef = useRef<number>(0);
  
  // Load occasion product counts with rate limiting
  const loadOccasionCounts = useCallback(async () => {
    if (occasions.length === 0) return;
    
    // Prevent concurrent calls
    if (isLoadingCountsRef.current) {
      return;
    }
    
    // Throttle: don't load more than once every 5 seconds
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    if (timeSinceLastLoad < 5000) {
      return;
    }
    
    isLoadingCountsRef.current = true;
    lastLoadTimeRef.current = now;
    
    try {
      const counts: Record<string, number> = {};
      const occasionsList = occasions.filter(occ => occ.value !== 'all');
      
      // Process requests sequentially with delays to avoid rate limiting
      // Process in batches of 2 with delays between batches
      const batchSize = 2;
      const delayBetweenBatches = 1500; // 1.5 second delay between batches
      const delayBetweenRequests = 500; // 500ms delay between requests in same batch
      
      for (let i = 0; i < occasionsList.length; i += batchSize) {
        const batch = occasionsList.slice(i, i + batchSize);
        
        // Process batch with small delays between requests
        for (let j = 0; j < batch.length; j++) {
          const occasion = batch[j];
          
          // Add delay between requests (except first one)
          if (j > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
          }
          
          try {
            const result = await loadProductsWithFilters({
              occasion: occasion.value,
              limit: 1,
              page: 1
            });
            // Use the totalProducts from pagination which reflects the actual count
            counts[occasion.value] = result.pagination?.totalProducts || 0;
          } catch (error) {
            console.error(`Error loading count for ${occasion.value}:`, error);
            // If API fails, set to 0 (don't use JSON fallback for counts to ensure real-time data)
            counts[occasion.value] = 0;
          }
        }
        
        // Update counts after each batch for better UX
        setOccasionCounts({ ...counts });
        
        // Add delay between batches (except after last batch)
        if (i + batchSize < occasionsList.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    } catch (error) {
      console.error('Error loading occasion counts:', error);
    } finally {
      isLoadingCountsRef.current = false;
    }
  }, [occasions]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const [categoriesData, occasionsResponse] = await Promise.all([
          loadCollectionsCategoriesData(),
          fetch(`${baseURL}/occasions?sortBy=sortOrder&sortOrder=asc`)
        ]);

        setCategories(categoriesData);
        
        // Load occasions from API
        if (occasionsResponse.ok) {
          const occasionsData = await occasionsResponse.json();
          if (occasionsData.success && occasionsData.data) {
            setOccasions(occasionsData.data);
          } else {
            console.error('Failed to load occasions:', occasionsData.message);
            setOccasions([]);
          }
        } else {
          console.error('Failed to load occasions:', occasionsResponse.status);
          setOccasions([]);
        }
        
        // Load products with current filters
        // Note: loadFilteredProducts will be called by useEffect when selectedCategories changes
      } catch (error) {
        console.error('Error loading collections data:', error);
        setOccasions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load occasion counts when occasions are loaded
  useEffect(() => {
    if (occasions.length > 0) {
      loadOccasionCounts();
    }
  }, [occasions.length, loadOccasionCounts]);

  // Refresh occasion counts when page becomes visible (to reflect admin updates)
  // Throttled to prevent too many API calls
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && occasions.length > 0) {
        // Only reload if it's been at least 30 seconds since last load
        const now = Date.now();
        if (now - lastLoadTimeRef.current > 30000) {
          loadOccasionCounts();
        }
      }
    };

    const handleFocus = () => {
      if (occasions.length > 0) {
        // Only reload if it's been at least 30 seconds since last load
        const now = Date.now();
        if (now - lastLoadTimeRef.current > 30000) {
          loadOccasionCounts();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [occasions.length, loadOccasionCounts]);

  // Helper function to remove duplicate products
  const removeDuplicateProducts = (products: Product[]): Product[] => {
    const seen = new Set<string>();
    return products.filter(product => {
      const productId = product._id || (product as any)?.id;
      if (!productId) return true; // Keep products without ID (shouldn't happen, but safe)
      if (seen.has(productId)) {
        return false; // Duplicate, remove it
      }
      seen.add(productId);
      return true; // First occurrence, keep it
    });
  };

  // Load filtered products
  const loadFilteredProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setProducts([]);
      }
      
      // Handle multiple categories and occasions
      const categoriesToFilter = selectedCategories.includes('all') 
        ? [] 
        : selectedCategories.filter(cat => cat !== 'all');
      
      const occasionsToFilter = selectedOccasions.includes('all') 
        ? [] 
        : selectedOccasions.filter(occ => occ !== 'all');
      
      let result;
      
      // If multiple categories or occasions selected, fetch products for each combination and combine
      if (categoriesToFilter.length > 1 || occasionsToFilter.length > 1) {
        // Build all combinations of category and occasion
        const combinations: Array<{category?: string, occasion?: string}> = [];
        
        if (categoriesToFilter.length > 0 && occasionsToFilter.length > 0) {
          // All combinations of categories and occasions
          categoriesToFilter.forEach(cat => {
            occasionsToFilter.forEach(occ => {
              combinations.push({ category: cat, occasion: occ });
            });
          });
        } else if (categoriesToFilter.length > 1) {
          // Multiple categories, single or no occasion
          categoriesToFilter.forEach(cat => {
            combinations.push({ 
              category: cat, 
              occasion: occasionsToFilter.length > 0 ? occasionsToFilter[0] : undefined 
            });
          });
        } else if (occasionsToFilter.length > 1) {
          // Multiple occasions, single or no category
          occasionsToFilter.forEach(occ => {
            combinations.push({ 
              category: categoriesToFilter.length > 0 ? categoriesToFilter[0] : undefined, 
              occasion: occ 
            });
          });
        }
        
        // Fetch products for each combination
        const combinationPromises = combinations.map(combo => {
          const comboFilters = {
            page: 1,
            limit: 100, // Fetch more to ensure we get all products
            category: combo.category,
            occasion: combo.occasion,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price_asc' ? 'price' : 'price',
            sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc' as 'asc' | 'desc',
            search: searchTerm || undefined
          };
          
          if (searchTerm) {
            return searchProducts(searchTerm, comboFilters);
          } else {
            return loadProductsWithFilters(comboFilters);
          }
        });
        
        const combinationResults = await Promise.all(combinationPromises);
        
        // Combine all products and remove duplicates
        let allProducts: Product[] = [];
        combinationResults.forEach(comboResult => {
          const products = comboResult.data || [];
          allProducts = [...allProducts, ...products];
        });
        
        // Remove duplicates based on product ID
        const uniqueProducts = removeDuplicateProducts(allProducts);
        
        // Apply sorting
        if (sortBy === 'price_asc') {
          uniqueProducts.sort((a: Product, b: Product) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_desc') {
          uniqueProducts.sort((a: Product, b: Product) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'newest') {
          uniqueProducts.sort((a: Product, b: Product) => {
            const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return dateB - dateA;
          });
        }
        
        // Apply pagination
        const startIndex = (page - 1) * 9;
        const endIndex = startIndex + 9;
        const paginatedProducts = uniqueProducts.slice(startIndex, endIndex);
        
        result = {
          data: paginatedProducts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(uniqueProducts.length / 9),
            totalProducts: uniqueProducts.length,
            hasNextPage: endIndex < uniqueProducts.length,
            hasPrevPage: page > 1
          }
        };
      } else {
        // Single category and occasion (or none) - use normal API call
        const filters = {
          page: page,
          limit: 9,
          category: categoriesToFilter.length > 0 ? categoriesToFilter[0] : undefined,
          occasion: occasionsToFilter.length > 0 ? occasionsToFilter[0] : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price_asc' ? 'price' : 'price',
          sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc' as 'asc' | 'desc',
          search: searchTerm || undefined
        };

        if (searchTerm) {
          result = await searchProducts(searchTerm, filters);
        } else {
          result = await loadProductsWithFilters(filters);
        }
      }

      // Check if result has the expected structure
      // API returns: { success: true, data: [...], pagination: {...} }
      const productsData = result.data || (Array.isArray(result) ? result : []);
      const pagination = result.pagination || { 
        currentPage: page, 
        totalPages: 1, 
        totalProducts: Array.isArray(productsData) ? productsData.length : 0,
        hasNextPage: false,
        hasPrevPage: false
      };

      // If API returns 0 products, try JSON fallback (only on first page)
      if (pagination.totalProducts === 0 && !searchTerm && page === 1) {
        const jsonProducts = await loadCollectionsProductsData();
        let filteredProducts = jsonProducts;
        
        // Filter by occasion if selected (support multiple occasions)
        if (!selectedOccasions.includes('all') && selectedOccasions.length > 0) {
          filteredProducts = jsonProducts.filter((product: Product) => 
            product.occasions && selectedOccasions.some(occ => product.occasions?.includes(occ))
          );
        }
        
        // Filter by category if selected (support multiple categories)
        if (!selectedCategories.includes('all') && selectedCategories.length > 0) {
          const categoriesToFilter = selectedCategories.filter(cat => cat !== 'all');
          filteredProducts = filteredProducts.filter((product: Product) => {
            const productCategory = typeof product.category === 'string' 
              ? product.category 
              : (product.category as any)?.slug || (product.category as any)?.name;
            // Check if product category matches any of the selected categories
            return categoriesToFilter.some(catSlug => 
              productCategory === catSlug || 
              productCategory?.toLowerCase() === catSlug.toLowerCase()
            );
          });
        }
        
        // Apply price filter
        filteredProducts = filteredProducts.filter((product: Product) => {
          const price = product.price || 0;
          return price >= priceRange[0] && price <= priceRange[1];
        });
        
        // Apply sorting
        if (sortBy === 'price_asc') {
          filteredProducts.sort((a: Product, b: Product) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_desc') {
          filteredProducts.sort((a: Product, b: Product) => (b.price || 0) - (a.price || 0));
        }
        
        // Apply pagination
        const startIndex = (page - 1) * 9;
        const endIndex = startIndex + 9;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        const uniquePaginatedProducts = removeDuplicateProducts(paginatedProducts);
        
        if (append) {
          setProducts(prev => removeDuplicateProducts([...prev, ...uniquePaginatedProducts]));
        } else {
          setProducts(uniquePaginatedProducts);
          // Only update totalProducts on first load, not when appending
          setTotalProducts(filteredProducts.length);
        }
        
        setHasMoreProducts(endIndex < filteredProducts.length);
      } else {
        // Handle API response (successful or with products)
        const uniqueResultData = removeDuplicateProducts(Array.isArray(productsData) ? productsData : []);
        
        // Check if we received any products when appending
        if (uniqueResultData.length === 0 && append) {
          // If no products returned on append, we've reached the end
          setHasMoreProducts(false);
          return;
        }
        
        // Update products
        if (append) {
          setProducts(prev => removeDuplicateProducts([...prev, ...uniqueResultData]));
        } else {
          setProducts(uniqueResultData);
          // Update totalProducts only on first load
          setTotalProducts(pagination.totalProducts || 0);
        }
        
        // Set hasMoreProducts based on API's pagination info
        // Priority: hasNextPage > totalPages comparison > product count check
        if (typeof pagination.hasNextPage === 'boolean') {
          setHasMoreProducts(pagination.hasNextPage);
        } else if (pagination.totalPages !== undefined && pagination.currentPage !== undefined) {
          // Use totalPages and currentPage for reliable pagination
          const hasMore = pagination.currentPage < pagination.totalPages;
          setHasMoreProducts(hasMore);
        } else if (pagination.totalProducts !== undefined) {
          // Fallback: calculate based on total products vs current loaded count
          const currentlyLoaded = append ? products.length + uniqueResultData.length : uniqueResultData.length;
          const hasMore = currentlyLoaded < pagination.totalProducts;
          setHasMoreProducts(hasMore);
        } else {
          // Last resort: if we got fewer products than requested, assume no more
          const limit = 9;
          const hasMore = uniqueResultData.length >= limit;
          setHasMoreProducts(hasMore);
        }
      }
    } catch (error) {
      console.error('Error loading filtered products:', error);
      // Fallback to JSON data with proper pagination handling
      try {
        const productsData = await loadCollectionsProductsData();
        let filteredProducts = productsData;
        
        // Filter by occasion if selected (support multiple occasions)
        if (!selectedOccasions.includes('all') && selectedOccasions.length > 0) {
          filteredProducts = productsData.filter((product: Product) => 
            product.occasions && selectedOccasions.some(occ => product.occasions?.includes(occ))
          );
        }
        
        // Filter by category if selected (support multiple categories)
        if (!selectedCategories.includes('all') && selectedCategories.length > 0) {
          const categoriesToFilter = selectedCategories.filter(cat => cat !== 'all');
          filteredProducts = filteredProducts.filter((product: Product) => {
            const productCategory = typeof product.category === 'string' 
              ? product.category 
              : (product.category as any)?.slug || (product.category as any)?.name;
            // Check if product category matches any of the selected categories
            return categoriesToFilter.some(catSlug => 
              productCategory === catSlug || 
              productCategory?.toLowerCase() === catSlug.toLowerCase()
            );
          });
        }
        
        // Apply price filter
        filteredProducts = filteredProducts.filter((product: Product) => {
          const price = product.price || 0;
          return price >= priceRange[0] && price <= priceRange[1];
        });
        
        // Apply sorting
        if (sortBy === 'price_asc') {
          filteredProducts.sort((a: Product, b: Product) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_desc') {
          filteredProducts.sort((a: Product, b: Product) => (b.price || 0) - (a.price || 0));
        }
        
        // Apply pagination for JSON fallback
        const startIndex = (page - 1) * 9;
        const endIndex = startIndex + 9;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        const uniquePaginatedProducts = removeDuplicateProducts(paginatedProducts);
        
        if (append) {
          setProducts(prev => removeDuplicateProducts([...prev, ...uniquePaginatedProducts]));
        } else {
          setProducts(uniquePaginatedProducts);
          setTotalProducts(filteredProducts.length);
        }
        
        // Set hasMoreProducts based on whether there are more products
        setHasMoreProducts(endIndex < filteredProducts.length);
      } catch (fallbackError) {
        console.error('Error loading fallback products:', fallbackError);
        if (!append) {
          setProducts([]);
          setTotalProducts(0);
        }
        // Don't set hasMoreProducts to false on error when appending - allow retry
        if (!append) {
          setHasMoreProducts(false);
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategories, selectedOccasions, priceRange, sortBy, searchTerm]);

  // Apply all pending filters
  const applyFilters = () => {
    // Mark that we're applying filters to prevent URL effect from interfering
    isApplyingFiltersRef.current = true;
    
    // Sync selectedOccasion with selectedOccasions (use first occasion for backward compatibility)
    let newSelectedOccasion: string | null = null;
    if (pendingOccasions.includes('all') || pendingOccasions.length === 0) {
      newSelectedOccasion = null;
    } else {
      // Set selectedOccasion to the first selected occasion (for backward compatibility with existing code)
      newSelectedOccasion = pendingOccasions[0];
    }
    
    // Mark that filters have been applied
    // When user clicks "Apply Filters", they want to see products, so always set to true
    // This ensures products are shown even when "all" categories are selected
    setFiltersApplied(true);
    
    // Batch all state updates together
    setSelectedCategories(pendingCategories);
    setSelectedOccasions(pendingOccasions);
    setPriceRange(pendingPriceRange);
    setSelectedOccasion(newSelectedOccasion);
    setFiltersApplied(true);
    setCurrentPage(1);
    
    // Trigger product loading immediately (before URL update to prevent flash)
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      // Update URL with current filters
      const params = new URLSearchParams();
      
      // Add categories to URL (comma-separated, or 'all' if all is selected)
      if (pendingCategories.includes('all') || pendingCategories.length === 0) {
        params.set('category', 'all');
      } else {
        // Join multiple categories with comma
        params.set('category', pendingCategories.join(','));
      }
      
      // Add occasions to URL (comma-separated, or omit if 'all' is selected)
      if (!pendingOccasions.includes('all') && pendingOccasions.length > 0) {
        params.set('occasion', pendingOccasions.join(','));
      }
      
      // Add search term to URL if present
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      
      // Update URL without page reload
      const newUrl = params.toString() 
        ? `/collections?${params.toString()}` 
        : '/collections';
      router.push(newUrl, { scroll: false });
      
      // Reset the flag after URL update completes
      setTimeout(() => {
        isApplyingFiltersRef.current = false;
      }, 200);
    }, 50);
  };

  // Clear all filters
  const clearFilters = () => {
    setPendingCategories(['all']);
    setPendingOccasions(['all']);
    setPendingPriceRange([0, 100000]);
    setSelectedCategories(['all']);
    setSelectedOccasions(['all']);
    setPriceRange([0, 100000]);
    setSortBy('newest');
    setCurrentPage(1);
    setSelectedOccasion(null);
    setProducts([]);
    setFiltersApplied(false);
    
    // Clear URL parameters
    router.push('/collections', { scroll: false });
  };
  
  // Handle occasion card click
  const handleOccasionCardClick = (occasionValue: string) => {
    if (occasionValue === 'all') {
      setSelectedOccasion(null);
      setSelectedOccasions(['all']);
      setPendingOccasions(['all']);
      // Check if there are other filters applied
      const categoryParam = searchParams.get('category');
      const hasOtherFilters = categoryParam && categoryParam !== 'all';
      setFiltersApplied(hasOtherFilters || false);
      // Update URL to remove occasion parameter (preserve categories)
      const params = new URLSearchParams();
      if (categoryParam) {
        params.set('category', categoryParam);
      }
      const searchParam = searchParams.get('search');
      if (searchParam) {
        params.set('search', searchParam);
      }
      const newUrl = params.toString() 
        ? `/collections?${params.toString()}` 
        : '/collections';
      router.push(newUrl, { scroll: false });
    } else {
      // Set selectedOccasion to first occasion for backward compatibility
      setSelectedOccasion(occasionValue);
      // Update both selectedOccasions and pendingOccasions to sync with filter sidebar
      // This automatically applies the filter (no need to click "Apply Filters")
      setSelectedOccasions([occasionValue]);
      setPendingOccasions([occasionValue]);
      setFiltersApplied(true); // Mark filters as applied when selecting an occasion
      
      // Update URL with occasion parameter (preserve categories)
      const params = new URLSearchParams();
      const currentCategoryParam = searchParams.get('category');
      if (currentCategoryParam) {
        params.set('category', currentCategoryParam);
      }
      params.set('occasion', occasionValue);
      const searchParam = searchParams.get('search');
      if (searchParam) {
        params.set('search', searchParam);
      }
      const newUrl = `/collections?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    }
    setCurrentPage(1);
    setProducts([]);
    // Open the occasion dropdown in the filter sidebar to show the selection
    setIsOccasionDropdownOpen(true);
  };

  // Track if we're applying filters to prevent URL effect from interfering
  const isApplyingFiltersRef = useRef(false);
  
  // Handle search, category, and occasion from URL params (for URL changes after initial load)
  useEffect(() => {
    // Skip if we're currently applying filters (to prevent conflicts)
    if (isApplyingFiltersRef.current) {
      return;
    }
    
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const occasionParam = searchParams.get('occasion');
    
    // Check if filters are present in URL (indicates filters have been applied)
    // Only set this on initial load or when URL changes externally (not from applyFilters)
    const hasUrlFilters = categoryParam || occasionParam || searchParam;
    if (hasUrlFilters) {
      setFiltersApplied(true);
    } else {
      // If no URL params and we're not in a filter application, reset filtersApplied
      // But only if we don't have active filters in state
      const hasActiveFilters = (selectedCategories.length > 0 && !selectedCategories.includes('all')) || 
                               selectedOccasion || 
                               searchTerm;
      if (!hasActiveFilters) {
        setFiltersApplied(false);
      }
    }
    
    // Only update if URL params have changed (to avoid unnecessary re-renders and glitches)
    if (searchParam !== searchTerm) {
      if (searchParam) {
        setSearchTerm(searchParam);
      } else {
        // Clear search term when no URL search param
        setSearchTerm('');
        if (isSearchActive) {
          clearSearch();
        }
      }
    }
    
    // Handle category filter from URL (support multiple categories)
    if (categoryParam) {
      const categoriesFromUrl = parseCategoriesFromUrl(categoryParam);
      // Only update if categories have changed
      const categoriesMatch = categoriesFromUrl.length === selectedCategories.length &&
        categoriesFromUrl.every(cat => selectedCategories.includes(cat));
      if (!categoriesMatch) {
        setSelectedCategories(categoriesFromUrl);
        setPendingCategories(categoriesFromUrl);
      }
    } else if (!categoryParam && !selectedCategories.includes('all')) {
      setSelectedCategories(['all']);
      setPendingCategories(['all']);
    }
    
    // Handle occasion filter from URL (support multiple occasions)
    if (occasionParam) {
      const occasionsFromUrl = parseOccasionsFromUrl(occasionParam);
      // Only update if occasions have changed
      const occasionsMatch = occasionsFromUrl.length === selectedOccasions.length &&
        occasionsFromUrl.every(occ => selectedOccasions.includes(occ));
      if (!occasionsMatch) {
        setSelectedOccasions(occasionsFromUrl);
        setPendingOccasions(occasionsFromUrl);
        // Set selectedOccasion to first occasion for backward compatibility
        setSelectedOccasion(occasionsFromUrl.includes('all') ? null : occasionsFromUrl[0]);
        setIsOccasionDropdownOpen(true);
      }
    } else if (!occasionParam && selectedOccasions.length > 0 && !selectedOccasions.includes('all') && !searchTerm) {
      // Only clear if we're not already showing products from a previous selection
      setSelectedOccasion(null);
      setSelectedOccasions(['all']);
      setPendingOccasions(['all']);
    }
  }, [searchParams, clearSearch, isSearchActive, searchTerm, selectedCategories, selectedOccasion]);
  
  // Track if filters have been applied (to show products even when "all" is selected)
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Load products when any filter changes (if category is selected, occasion is selected, search is active, or filters have been applied)
  useEffect(() => {
    const hasCategorySelected = selectedCategories.length > 0 && !selectedCategories.includes('all');
    // Show products if: category is selected, occasion is selected, search is active, or filters have been applied (even with "all" selected)
    const shouldLoadProducts = hasCategorySelected || selectedOccasion || searchTerm || filtersApplied;
    
    if (categories.length > 0 && shouldLoadProducts) {
      setCurrentPage(1);
      loadFilteredProducts(1, false);
    } else if (categories.length > 0 && !shouldLoadProducts && !isApplyingFiltersRef.current) {
      // Clear products when no filters are selected (but not while applying filters)
      setProducts([]);
      setTotalProducts(0);
      setHasMoreProducts(false);
      setCurrentPage(1);
      setFiltersApplied(false);
    }
  }, [loadFilteredProducts, categories.length, selectedCategories, selectedOccasion, searchTerm, priceRange, sortBy, filtersApplied]);
  
  // Handle window width check for hydration safety
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    // Check on mount
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const handleCategoryChange = (categoryValue: string) => {
    if (categoryValue === 'all') {
      setPendingCategories(['all']);
    } else {
      setPendingCategories(prev => {
        const newSelection = prev.filter(cat => cat !== 'all');
        if (newSelection.includes(categoryValue)) {
          return newSelection.filter(cat => cat !== categoryValue);
        } else {
          return [...newSelection, categoryValue];
        }
      });
    }
  };

  const handleOccasionChange = (occasionValue: string) => {
    // Only update pending state - don't apply filters until "Apply Filters" is clicked
    if (occasionValue === 'all') {
      setPendingOccasions(['all']);
    } else {
      setPendingOccasions(prev => {
        const newSelection = prev.filter(occ => occ !== 'all');
        const isCurrentlySelected = newSelection.includes(occasionValue);
        
        if (isCurrentlySelected) {
          // If deselecting this occasion
          const updated = newSelection.filter(occ => occ !== occasionValue);
          // If no occasions selected, go back to 'all'
          return updated.length === 0 ? ['all'] : updated;
        } else {
          // If selecting this occasion
          return [...newSelection, occasionValue];
        }
      });
    }
  };
  
  // Ref for the sentinel element (triggers loading when it comes into view)
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);

  // Track if we're currently loading to prevent duplicate requests
  const isLoadingRef = useRef(false);
  const lastRequestTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  // Track previous product count to identify newly added items
  const previousProductCountRef = useRef(0);

  // Load more products - simplified and more aggressive
  const loadMoreProducts = useCallback(async () => {
    // Stop if already loading or no more data
    if (isLoadingMore || !hasMoreProducts || isLoadingRef.current) {
      console.log('Skipping load:', { isLoadingMore, hasMoreProducts, isLoadingRefCurrent: isLoadingRef.current });
      return;
    }
    
    // Check if we need to respect throttling (minimum 800ms between requests)
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < 800) {
      console.log('Throttling - too soon since last request');
      return;
    }
    
    isLoadingRef.current = true;
    lastRequestTimeRef.current = now;
    const nextPage = currentPage + 1;
    
    console.log(`Loading page ${nextPage}...`);
    
    try {
      await loadFilteredProducts(nextPage, true);
      // Only increment page after successful load
      setCurrentPage(nextPage);
      // Reset retry count on success
      retryCountRef.current = 0;
      console.log(`Successfully loaded page ${nextPage}`);
    } catch (error) {
      console.error('Error loading more products:', error);
      retryCountRef.current += 1;
      
      // Handle different types of errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Permanent errors - stop trying
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log('404 error - stopping infinite scroll');
          setHasMoreProducts(false);
        }
        // Rate limit errors - implement exponential backoff
        else if (errorMessage.includes('429') || errorMessage.includes('too many')) {
          const backoffDelay = Math.min(2000 * Math.pow(1.5, retryCountRef.current), 8000); // Max 8 seconds
          console.log(`Rate limited. Retrying in ${backoffDelay}ms...`);
          
          if (retryCountRef.current < maxRetries) {
            setTimeout(() => {
              isLoadingRef.current = false;
              loadMoreProducts();
            }, backoffDelay);
            return; // Don't reset isLoadingRef immediately
          } else {
            console.error('Max retries reached. Stopping infinite scroll.');
            setHasMoreProducts(false);
          }
        }
        // Network errors - retry with shorter delay
        else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          if (retryCountRef.current < maxRetries) {
            setTimeout(() => {
              isLoadingRef.current = false;
              loadMoreProducts();
            }, 1500);
            return;
          }
        }
      }
    } finally {
      // Shorter delay to allow faster loading
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 500); // Reduced from 1000ms to 500ms
    }
  }, [currentPage, isLoadingMore, hasMoreProducts, loadFilteredProducts]);

  // Infinite scroll using Intersection Observer - more aggressive for complete loading
  useEffect(() => {
    if (!sentinelRef || !hasMoreProducts) return;

    // Create Intersection Observer with aggressive settings to ensure all products load
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log('Intersection observed:', { 
          isIntersecting: entry.isIntersecting, 
          hasMoreProducts, 
          isLoadingMore, 
          isLoadingRefCurrent: isLoadingRef.current,
          currentPage,
          totalProducts: products.length
        });
        
        // Load more products when sentinel comes into view
        if (entry.isIntersecting && hasMoreProducts && !isLoadingMore && !isLoadingRef.current) {
          console.log('Triggering load more products...');
          // Use requestAnimationFrame to ensure smooth loading
          requestAnimationFrame(() => {
            // Final checks before loading
            if (hasMoreProducts && !isLoadingMore && !isLoadingRef.current) {
              loadMoreProducts();
            }
          });
        }
      },
      {
        root: null, // viewport
        rootMargin: '800px', // Increased to 800px for more aggressive loading
        threshold: 0.1, // Reduced back to 0.1 for earlier triggering
      }
    );

    observer.observe(sentinelRef);

    return () => {
      if (sentinelRef) {
        observer.unobserve(sentinelRef);
      }
    };
  }, [sentinelRef, hasMoreProducts, isLoadingMore, loadMoreProducts, currentPage, products.length]);

  // Fallback mechanism: Auto-load if we haven't loaded in a while and there are more products
  useEffect(() => {
    if (!hasMoreProducts || isLoadingMore || isLoadingRef.current) return;
    
    const autoLoadTimer = setTimeout(() => {
      // If we have more products but haven't loaded in 5 seconds, auto-load
      if (hasMoreProducts && !isLoadingMore && !isLoadingRef.current) {
        console.log('Auto-loading next page due to timeout...');
        loadMoreProducts();
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(autoLoadTimer);
  }, [hasMoreProducts, isLoadingMore, currentPage, loadMoreProducts]);

  // Update previous product count when loading completes
  useEffect(() => {
    // When loading finishes, update the previous count to mark current items as "old"
    // This ensures only newly added items get animated
    if (!isLoadingMore && products.length > 0) {
      // Use a small delay to ensure the state has fully updated
      const timer = setTimeout(() => {
        previousProductCountRef.current = products.length;
      }, 300); // Wait for animations to complete
      
      return () => clearTimeout(timer);
    }
  }, [isLoadingMore, products.length]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('State update:', {
      currentPage,
      totalProducts: products.length,
      hasMoreProducts,
      isLoadingMore,
      isLoadingRefCurrent: isLoadingRef.current
    });
  }, [currentPage, products.length, hasMoreProducts, isLoadingMore]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    setProducts([]);
  };

  const handlePriceRangeChange = (newPriceRange: number[]) => {
    setPendingPriceRange(newPriceRange);
  };

  // Loading component
  if (isLoading) {
    return (
      <div className="collections-page">
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen pt-32 sm:pt-36 md:pt-40 lg:pt-44">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-primary">Loading collections...</p>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  return (
    <div className="collections-page">
    <MainLayout>
      {/* Collections Banner - positioned below fixed header */}
      <div className="pt-32 sm:pt-36 md:pt-40 lg:pt-44">
      <section className="collections-header pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center"
        >
          {searchTerm ? (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-cormorant text-accent mb-4">
                Search Results
              </h1>
              <p className="text-primary dark:text-gray-300 max-w-xl mx-auto text-sm md:text-base mb-4">
                Showing results for "{searchTerm}"
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearSearch();
                }}
                className="text-primary dark:text-gray-300 hover:text-accent underline transition-colors"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-cormorant text-accent mb-4">Our Collections</h1>
              <p className="text-primary dark:text-gray-300 max-w-xl mx-auto text-sm md:text-base">
                Discover our exquisite range of handcrafted jewelry pieces designed to celebrate your unique style
              </p>
            </>
          )}
        </motion.div>
      </section>
      </div>

      {/* Occasion Selection View - Show when no category selected, no occasion selected, no search, and filters haven't been applied */}
      {!selectedOccasion && !searchTerm && !isLoading && selectedCategories.includes('all') && !filtersApplied && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Featured Occasions Hero Section */}
            <div className="mb-12">
              {/* Featured Occasions Grid (3-4 main occasions) */}
              <div className="flex justify-center mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl w-full">
                {occasions
                  .filter(occ => occ.value !== 'all')
                  .slice(0, 4)
                  .map((occasion, index) => (
                    <motion.div
                      key={occasion.value}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleOccasionCardClick(occasion.value)}
                      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {/* Card with gradient background */}
                      <div className="aspect-[4/5] bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Large initial letter - positioned at top */}
                        <div className="absolute top-6 md:top-8 left-1/2 transform -translate-x-1/2 z-0">
                          <span className="text-6xl sm:text-7xl md:text-8xl font-cormorant text-primary opacity-25 group-hover:opacity-35 transition-opacity">
                            {occasion.name.charAt(0)}
                          </span>
                        </div>
                        
                        {/* Content overlay - centered */}
                        <div className="relative z-10 text-center p-4 md:p-6 flex flex-col items-center justify-center h-full">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-cormorant text-primary mb-2 md:mb-3 group-hover:text-accent transition-colors">
                            {occasion.name}
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">
                            {occasionCounts[occasion.value] !== undefined 
                              ? `(${occasionCounts[occasion.value]} items)`
                              : 'Loading...'}
                          </p>
                        </div>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* "Explore More Occasions" Section */}
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-cormorant text-primary text-center mb-6">
                  Explore More Occasions
                </h3>
                
                {/* Horizontal Scrollable Strip */}
                <div className="relative flex justify-center">
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth max-w-full">
                    {occasions
                      .filter(occ => occ.value !== 'all')
                      .slice(4)
                      .map((occasion) => (
                        <motion.button
                          key={occasion.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOccasionCardClick(occasion.value)}
                          className="flex-shrink-0 px-5 md:px-6 py-2.5 md:py-3 bg-white border-2 border-primary rounded-full text-primary font-medium hover:bg-primary hover:text-white transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          {occasion.name}
                        </motion.button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products View - Show when category is selected, occasion is selected, search is active, or filters have been applied */}
      {((selectedCategories.length > 0 && !selectedCategories.includes('all')) || selectedOccasion || searchTerm || filtersApplied) && (
        <section className="py-0 md:py-0">
          {/* Category/Occasion Header */}
          {((selectedCategories.length > 0 && !selectedCategories.includes('all')) || selectedOccasion) && !searchTerm && (
            <div className="container mx-auto px-4 mb-6">
              {selectedOccasion && (
                <button
                  onClick={() => handleOccasionCardClick('all')}
                  className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Occasions
                </button>
              )}
              <h2 className="text-2xl md:text-3xl font-cormorant text-primary mt-4">
                {selectedOccasion 
                  ? occasions.find(occ => occ.value === selectedOccasion)?.name || 'Products'
                  : categories.find(cat => cat.value === selectedCategories[0])?.name || 'Products'}
              </h2>
            </div>
          )}
        </section>
      )}

      {/* Filters and Products */}
      <section className={`py-8 md:py-12 ${((selectedCategories.length > 0 && !selectedCategories.includes('all')) || selectedOccasion || searchTerm || filtersApplied) ? '' : 'hidden'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
      {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
              </button>
      </div>

            {/* Sidebar Filters */}
      <AnimatePresence>
              {(isFilterOpen || isLargeScreen) && (
          <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`w-full lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'} lg:sticky lg:top-28 lg:self-start`}
                >
                  <div className="filter-sidebar p-4 md:p-6 rounded-lg lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-primary">Filters</h3>
                  {/* Active filters indicator */}
                  {((selectedCategories.length > 0 && !selectedCategories.includes('all')) || 
                    (selectedOccasions.length > 0 && !selectedOccasions.includes('all')) || 
                    (priceRange[1] < 100000)) && (
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </div>
                <button
                        onClick={() => setIsFilterOpen(false)}
                        className="lg:hidden text-primary hover:text-accent"
                >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="category-dropdown">
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full flex justify-between items-center py-3 px-4 bg-white border border-gray-300 rounded-lg hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <span className="text-primary font-medium">SHOP BY CATEGORY</span>
                    <motion.svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  
                  <AnimatePresence>
                    {isCategoryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="p-2">
                          {categories.map((category) => (
                            <label
                              key={category.value}
                              className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={pendingCategories.includes(category.value)}
                                onChange={() => handleCategoryChange(category.value)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                              />
                              <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="occasion-dropdown">
                  <button
                    onClick={() => setIsOccasionDropdownOpen(!isOccasionDropdownOpen)}
                    className="w-full flex justify-between items-center py-3 px-4 bg-white border border-gray-300 rounded-lg hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <span className="text-primary font-medium">SHOP BY OCCASION</span>
                    <motion.svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isOccasionDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  
                  <AnimatePresence>
                    {isOccasionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="p-2">
                          {occasions.map((occasion) => {
                            // Determine if this occasion should be checked
                            // Priority: pendingOccasions > selectedOccasions > selectedOccasion
                            let isChecked = false;
                            if (pendingOccasions.length > 0 && !pendingOccasions.includes('all')) {
                              // If there are pending selections (not 'all'), use pendingOccasions
                              isChecked = pendingOccasions.includes(occasion.value);
                            } else if (selectedOccasions.length > 0 && !selectedOccasions.includes('all')) {
                              // If no pending changes, use selectedOccasions
                              isChecked = selectedOccasions.includes(occasion.value);
                            } else if (selectedOccasion) {
                              // If an occasion card is selected, check that one
                              isChecked = selectedOccasion === occasion.value;
                            } else {
                              // Default: check 'all' if nothing is selected
                              isChecked = occasion.value === 'all';
                            }
                            
                            return (
                              <label
                                key={occasion.value}
                                className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleOccasionChange(occasion.value);
                                  }}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                                />
                                <span className="ml-3 text-sm text-gray-700">{occasion.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-primary mb-3">Price Range</h4>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          value={pendingPriceRange[1]}
                          onChange={(e) => handlePriceRangeChange([pendingPriceRange[0], parseInt(e.target.value)])}
                          className="price-range-slider w-full"
                        />
                  <div className="flex justify-between text-sm text-gray-600">
                          <span>₹{pendingPriceRange[0]}</span>
                          <span>₹{pendingPriceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Apply Filters and Clear Filters Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={applyFilters}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                    // Check if there are pending changes
                    (JSON.stringify(pendingCategories) !== JSON.stringify(selectedCategories) ||
                     JSON.stringify(pendingOccasions) !== JSON.stringify(selectedOccasions) ||
                     JSON.stringify(pendingPriceRange) !== JSON.stringify(priceRange))
                      ? 'bg-accent text-white hover:bg-accent/90' 
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Apply Filters
                  {/* Show indicator if there are pending changes */}
                  {(JSON.stringify(pendingCategories) !== JSON.stringify(selectedCategories) ||
                    JSON.stringify(pendingOccasions) !== JSON.stringify(selectedOccasions) ||
                    JSON.stringify(pendingPriceRange) !== JSON.stringify(priceRange)) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

            {/* Products Grid */}
            <div className="w-full lg:w-3/4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
              >
                <p className="text-dark-gray text-sm md:text-base">
                  {totalProducts > 0 ? (
                    <>
                      Showing <span className="font-medium text-primary">{products.length}</span> of <span className="font-medium text-primary">{totalProducts}</span> products
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-primary">{products.length}</span> products
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm md:text-base text-dark-gray">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
              
              <div className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {products.map((product, index) => {
                      const productId = product._id || (product as any)?.id;
                      const uniqueKey = productId ? `${productId}` : `product-${index}`;
                      
                      // Only animate items that are newly added (beyond previous count)
                      const isNewItem = index >= previousProductCountRef.current;
                      const relativeIndex = index - previousProductCountRef.current;
                      // Stagger animation for new items only, max 0.3s total delay
                      const staggerDelay = isNewItem ? Math.min(relativeIndex * 0.04, 0.3) : 0;
                      
                      return (
                      <motion.div
                        key={uniqueKey}
                        initial={isNewItem ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ 
                          duration: 0.2,
                          delay: staggerDelay,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        className="product-card-wrapper group"
                      >
                        <ProductCard {...product} />
                      </motion.div>
                      );
                    })}
                  </div>
              
              {/* Sentinel element - triggers loading when it comes into view */}
              {/* Positioned with padding to ensure smooth loading before footer appears */}
              {hasMoreProducts && (
                <div 
                  ref={setSentinelRef}
                  className="h-20 w-full py-8"
                  aria-hidden="true"
                  style={{ minHeight: '200px' }}
                />
              )}
              
              {/* Manual Load More Button - shown when there are more products but not currently loading */}
              {hasMoreProducts && !isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <button
                    onClick={loadMoreProducts}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Load More Products ({totalProducts - products.length} remaining)
                  </button>
                </div>
              )}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-dark-gray">Loading more products...</p>
                  </div>
                </div>
              )}
              
              {/* End of products message */}
              {!hasMoreProducts && products.length > 0 && (
                <div className="flex justify-center items-center py-12">
                  <p className="text-sm text-dark-gray">You've reached the end of the products</p>
                </div>
              )}
              
              {products.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state text-center py-16 rounded-2xl"
                >
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  {searchTerm ? (
                    <>
                      <h3 className="text-lg font-medium text-primary mb-2">No results found for "{searchTerm}"</h3>
                      <p className="text-dark-gray mb-4">Try searching for different keywords or browse our collections.</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          clearSearch();
                        }}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-primary mb-2">No products found</h3>
                      <p className="text-dark-gray">Try adjusting your filters to see more results.</p>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
      </MainLayout>
    </div>
  );
}

export default function Collections() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-primary font-medium">Loading collections...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    }>
      <CollectionsContent />
    </Suspense>
  );
}
