'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import ProductCard from '@/components/product/ProductCard';
import { useSearch } from '@/contexts/SearchContext';
import { 
  loadCollectionsProductsData, 
  loadCollectionsCategoriesData, 
  loadCollectionsOccasionsData,
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

const itemsPerPageOptions = [
  { name: '9 per page', value: 9 },
  { name: '12 per page', value: 12 },
  { name: '18 per page', value: 18 },
  { name: '24 per page', value: 24 },
  { name: 'All', value: 999 },
];

function CollectionsContent() {
  const searchParams = useSearchParams();
  const { searchQuery, clearSearch, isSearchActive } = useSearch();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000]); // Increased default maxPrice to show all products
  
  // Pending filter states (not applied yet)
  const [pendingCategories, setPendingCategories] = useState<string[]>(['all']);
  const [pendingOccasions, setPendingOccasions] = useState<string[]>(['all']);
  const [pendingPriceRange, setPendingPriceRange] = useState([0, 100000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isOccasionDropdownOpen, setIsOccasionDropdownOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [occasions, setOccasions] = useState<CollectionOccasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesData, occasionsData] = await Promise.all([
          loadCollectionsCategoriesData(),
          loadCollectionsOccasionsData()
        ]);

        setCategories(categoriesData);
        setOccasions(occasionsData);
        
        // Load products with current filters
        // Note: loadFilteredProducts will be called by useEffect when selectedCategories changes
      } catch (error) {
        console.error('Error loading collections data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load filtered products
  const loadFilteredProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        category: selectedCategories.includes('all') ? undefined : selectedCategories[0],
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price_asc' ? 'price' : 'price',
        sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc' as 'asc' | 'desc',
        search: searchTerm || undefined
      };

      let result;
      if (searchTerm) {
        result = await searchProducts(searchTerm, filters);
      } else {
        result = await loadProductsWithFilters(filters);
      }

      setProducts(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading filtered products:', error);
      // Fallback to JSON data
      const productsData = await loadCollectionsProductsData();
      setProducts(productsData);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: productsData.length,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedCategories, priceRange, sortBy, searchTerm]);

  // Apply all pending filters
  const applyFilters = () => {
    setSelectedCategories(pendingCategories);
    setSelectedOccasions(pendingOccasions);
    setPriceRange(pendingPriceRange);
    setCurrentPage(1); // Reset to first page when applying filters
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
  };

  // Handle search and category from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      // Clear search term when no URL search param
      setSearchTerm('');
      if (isSearchActive) {
        clearSearch();
      }
    }
    
    // Handle category filter from URL
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
      setPendingCategories([categoryParam]);
    } else {
      setSelectedCategories(['all']);
      setPendingCategories(['all']);
    }
  }, [searchParams, clearSearch, isSearchActive]);
  
  // Load products when any filter changes
  useEffect(() => {
    if (categories.length > 0) {
      loadFilteredProducts();
    }
  }, [loadFilteredProducts, categories.length]);
  
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
    if (occasionValue === 'all') {
      setPendingOccasions(['all']);
    } else {
      setPendingOccasions(prev => {
        const newSelection = prev.filter(occ => occ !== 'all');
        if (newSelection.includes(occasionValue)) {
          return newSelection.filter(occ => occ !== occasionValue);
        } else {
          return [...newSelection, occasionValue];
        }
      });
    }
  };
  
  // Use products directly from API (server-side filtering)
  const paginatedProducts = products;

  // Reset to page 1 when filters change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // loadFilteredProducts will be called by useEffect when dependencies change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // loadFilteredProducts will be called by useEffect when currentPage changes
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    // loadFilteredProducts will be called by useEffect when sortBy changes
  };

  const handlePriceRangeChange = (newPriceRange: number[]) => {
    setPendingPriceRange(newPriceRange);
  };

  // Loading component
  if (isLoading) {
    return (
      <div className="collections-page">
        <Header />
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
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
      <Header />
    <MainLayout>
      {/* Header */}
      <section className="collections-header py-16 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center"
        >
          {searchTerm ? (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-script text-accent mb-4">
                Search Results
              </h1>
              <p className="text-white max-w-xl mx-auto text-sm md:text-base mb-4">
                Showing results for "{searchTerm}"
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearSearch();
                }}
                className="text-white hover:text-accent underline transition-colors"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-script text-accent mb-4">Our Collections</h1>
              <p className="text-white max-w-xl mx-auto text-sm md:text-base">
                Discover our exquisite range of handcrafted jewelry pieces designed to celebrate your unique style
              </p>
            </>
          )}
        </motion.div>
      </section>

      {/* Filters and Products */}
      <section className="py-8 md:py-12">
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
                  className={`w-full lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}
                >
                  <div className="filter-sidebar p-4 md:p-6 rounded-lg">
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
                          {occasions.map((occasion) => (
                            <label
                              key={occasion.value}
                              className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={pendingOccasions.includes(occasion.value)}
                                onChange={() => handleOccasionChange(occasion.value)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                              />
                              <span className="ml-3 text-sm text-gray-700">{occasion.name}</span>
                            </label>
                          ))}
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
                  Showing <span className="font-medium text-primary">{((pagination.currentPage - 1) * itemsPerPage) + 1}-{Math.min(pagination.currentPage * itemsPerPage, pagination.totalProducts)}</span> of <span className="font-medium text-primary">{pagination.totalProducts}</span> products
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm md:text-base text-dark-gray">Items per page:</label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                      className="sort-select border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    >
                      {itemsPerPageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                </div>
              </motion.div>
              
              <motion.div 
                layout
                className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
              >
                <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product._id || (product as any).id || index}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        className="product-card-wrapper group"
                      >
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                </AnimatePresence>
                  </motion.div>
              
              {paginatedProducts.length === 0 && (
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
              
              {/* Pagination */}
              {pagination.totalProducts > 0 && pagination.totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-12 flex justify-center"
              >
                  <nav className="flex items-center flex-wrap justify-center gap-2">
                    {/* Previous Button */}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="pagination-button pagination-nav px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 hover:bg-soft-pink-100 hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      aria-label="Previous page"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </motion.button>
                    
                    {/* Page Numbers */}
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const currentPage = pagination.currentPage;
                      const pages: (number | string)[] = [];
                      
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        // Always show first page
                        pages.push(1);
                        
                        if (currentPage <= 3) {
                          // Near the beginning
                          for (let i = 2; i <= 4; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-end');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end
                          pages.push('ellipsis-start');
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // In the middle
                          pages.push('ellipsis-start');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i);
                          }
                          pages.push('ellipsis-end');
                          pages.push(totalPages);
                        }
                      }
                      
                      return pages.map((page, index) => {
                        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <motion.button 
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(page as number)}
                            className={`pagination-button pagination-page px-3 py-2 sm:px-4 sm:py-2 rounded-lg border transition-all duration-200 text-sm sm:text-base min-w-[2.5rem] sm:min-w-[3rem] ${
                              pagination.currentPage === page 
                                ? 'bg-primary text-white border-primary shadow-md font-medium' 
                                : 'border-gray-300 hover:bg-soft-pink-100 hover:border-primary bg-white'
                            }`}
                            aria-label={`Go to page ${page}`}
                            aria-current={pagination.currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </motion.button>
                        );
                      });
                    })()}
                    
                    {/* Next Button */}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                      disabled={!pagination.hasNextPage}
                      className="pagination-button pagination-nav px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 hover:bg-soft-pink-100 hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </nav>
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
