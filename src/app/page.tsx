'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import PhoneCard from '@/components/ui/PhoneCard';
import Link from 'next/link';
import Image from 'next/image';
import DataLoader from '@/components/DataLoader';
import { useDataContext } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import dataService from '@/services/dataService';
import { 
  loadProductsWithFilters
} from '@/utils/dataLoader';
import { 
  Category, 
  Feature, 
  Product, 
  TrendingLook, 
  Testimonial
} from '@/types/data';

// Import category images for fallback
import earringsImage from '@/assets/images/earrings.png';
import banglesImage from '@/assets/images/bangles.png';
import braceletsImage from '@/assets/images/braceletts.png';
import necklacesImage from '@/assets/images/necklaces.png';
import chainsImage from '@/assets/images/chains.png';
import ringsImage from '@/assets/images/rings.png';
import hairAccessoriesImage from '@/assets/images/hairaccessories.png';

// Import carousel images for fallback
import carouselImage1 from '@/assets/images/carosel-image1.jpg';
import carouselImage2 from '@/assets/images/carosel-image2.jpg';
import carouselImage3 from '@/assets/images/carosel-image3.jpg';

// Image mapping for fallback
const imageMap: { [key: string]: any } = {
  '/images/earrings.png': earringsImage,
  '/images/bangles.png': banglesImage,
  '/images/braceletts.png': braceletsImage,
  '/images/necklaces.png': necklacesImage,
  '/images/chains.png': chainsImage,
  '/images/rings.png': ringsImage,
  '/images/hairaccessories.png': hairAccessoriesImage,
  '/images/carosel-image1.jpg': carouselImage1,
  '/images/carosel-image2.jpg': carouselImage2,
  '/images/carosel-image3.jpg': carouselImage3,
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, isAdmin } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [retrying, setRetrying] = useState({ categories: false });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeaturedProducts, setLoadingFeaturedProducts] = useState(true);
  const [featuredProductsScroll, setFeaturedProductsScroll] = useState(0);
  const [featuredProductsSliderRef, setFeaturedProductsSliderRef] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [categoriesSliderRef, setCategoriesSliderRef] = useState<HTMLDivElement | null>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [collectionsSliderRef, setCollectionsSliderRef] = useState<HTMLDivElement | null>(null);
  const [canScrollCollectionsLeft, setCanScrollCollectionsLeft] = useState(false);
  const [canScrollCollectionsRight, setCanScrollCollectionsRight] = useState(true);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [occasionCounts, setOccasionCounts] = useState<Record<string, number>>({});
  const [occasionsSliderRef, setOccasionsSliderRef] = useState<HTMLDivElement | null>(null);
  const [canScrollOccasionsLeft, setCanScrollOccasionsLeft] = useState(false);
  const [canScrollOccasionsRight, setCanScrollOccasionsRight] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Get data from context
  const { 
    categories,
    features,
    products,
    trending,
    testimonials,
    fieldErrors,
    loadCategories
  } = useDataContext();

  // Helper function to safely extract array from data
  const getSafeArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  // Ensure arrays are not null and are actually arrays
  const safeJewelryCategories = getSafeArray(categories);
  const safeFeatures = getSafeArray(features);
  const safeProducts = getSafeArray(products);
  const safeTrendingLooks = getSafeArray(trending);
  const safeTestimonials = getSafeArray(testimonials);

  // Fetch featured products with delay to avoid rate limiting
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      // Small delay to stagger API requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        setLoadingFeaturedProducts(true);
        const result = await dataService.getFeaturedProducts(20);
        if (result.success && result.data) {
          // Filter to ensure only featured products are included
          const featured = Array.isArray(result.data) 
            ? result.data.filter((product) => product.isFeatured === true && product.isActive !== false)
            : [];
          setFeaturedProducts(featured);
        }
      } catch (error) {
        setFeaturedProducts([]);
      } finally {
        setLoadingFeaturedProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Load collections data
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseURL}/collections?sortBy=sortOrder&sortOrder=asc`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCollections(data.data || []);
          } else {
            setCollections([]);
          }
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error('Failed to load collections:', error);
        setCollections([]);
      }
    };

    loadCollections();
  }, []);

  // Load collection product counts (if needed in future)
  useEffect(() => {
    // Collections don't have direct product counts yet
    // This can be implemented later if products are linked to collections
    setCollectionCounts({});
  }, [collections]);

  // Load occasions data from API (database only, no JSON fallback) with retry logic
  useEffect(() => {
    const loadOccasions = async () => {
      // Delay to avoid hitting API immediately on page load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${baseURL}/occasions?sortBy=sortOrder&sortOrder=asc`;
      
      // Retry logic with exponential backoff
      let lastError: Error | null = null;
      const maxRetries = 3;
      const initialDelay = 1000;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url);
          
          // If rate limited (429), retry with exponential backoff
          if (response.status === 429 && attempt < maxRetries) {
            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`Rate limited (429) loading occasions. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Filter out any inactive occasions and ensure we have valid data
              const activeOccasions = data.data.filter((occ: any) => occ.isActive !== false);
              setOccasions(activeOccasions);
              return; // Success, exit function
            } else {
              console.error('Failed to load occasions:', data.message || 'Unknown error');
              setOccasions([]);
              return;
            }
          } else {
            // If not 429 and not ok, try to get error message
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 429 && attempt < maxRetries) {
              const delay = initialDelay * Math.pow(2, attempt);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            console.error('Failed to load occasions:', errorData.message || `HTTP ${response.status}`);
            setOccasions([]);
            return;
          }
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we get here, all retries failed
      if (lastError) {
        console.error('Failed to load occasions after retries:', lastError);
      }
      setOccasions([]);
    };

    loadOccasions();
  }, []);

  // Load occasion product counts with throttling to prevent rate limiting
  useEffect(() => {
    const loadOccasionCounts = async () => {
      if (occasions.length === 0) return;
      
      // Delay loading to avoid hitting API immediately on page load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const counts: Record<string, number> = {};
        const occasionsList = occasions.filter((occ: any) => occ.value && occ.value !== 'all');
        
        // Process occasions in batches of 3 with delays to prevent rate limiting
        const batchSize = 3;
        const delayBetweenBatches = 500; // 500ms delay between batches
        
        for (let i = 0; i < occasionsList.length; i += batchSize) {
          const batch = occasionsList.slice(i, i + batchSize);
          
          // Process batch in parallel
          await Promise.all(
            batch.map(async (occasion: any) => {
              try {
                const result = await loadProductsWithFilters({
                  occasion: occasion.value,
                  limit: 1,
                  page: 1
                });
                // Use the totalProducts from pagination which reflects the actual count
                counts[occasion.value] = result.pagination?.totalProducts || 0;
              } catch (error: any) {
                console.error(`Error loading count for ${occasion.value}:`, error);
                // If API fails (including 429), set to 0
                counts[occasion.value] = 0;
              }
            })
          );
          
          // Update counts incrementally as we load them
          setOccasionCounts({ ...counts });
          
          // Add delay between batches (except for the last batch)
          if (i + batchSize < occasionsList.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }
      } catch (error) {
        console.error('Error loading occasion counts:', error);
      }
    };

    if (occasions.length > 0) {
      loadOccasionCounts();
    }
  }, [occasions]);

  // Update scroll state when slider scrolls
  useEffect(() => {
    if (!featuredProductsSliderRef) return;
    
    const updateScrollState = () => {
      const scrollLeft = featuredProductsSliderRef.scrollLeft;
      const maxScroll = featuredProductsSliderRef.scrollWidth - featuredProductsSliderRef.clientWidth;
      
      setFeaturedProductsScroll(scrollLeft);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    };
    
    featuredProductsSliderRef.addEventListener('scroll', updateScrollState);
    updateScrollState(); // Initial check
    
    // Also check on resize
    const handleResize = () => {
      updateScrollState();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      featuredProductsSliderRef.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [featuredProductsSliderRef]);

  // Update scroll state for categories carousel
  useEffect(() => {
    if (!categoriesSliderRef) return;
    
    const updateScrollState = () => {
      const scrollLeft = categoriesSliderRef.scrollLeft;
      const maxScroll = categoriesSliderRef.scrollWidth - categoriesSliderRef.clientWidth;
      
      setCanScrollCategoriesLeft(scrollLeft > 10);
      setCanScrollCategoriesRight(scrollLeft < maxScroll - 10);
    };
    
    categoriesSliderRef.addEventListener('scroll', updateScrollState);
    updateScrollState(); // Initial check
    
    // Also check on resize
    const handleResize = () => {
      updateScrollState();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      categoriesSliderRef.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [categoriesSliderRef]);

  // Update scroll state for collections carousel
  useEffect(() => {
    if (!collectionsSliderRef) return;
    
    const updateScrollState = () => {
      const scrollLeft = collectionsSliderRef.scrollLeft;
      const maxScroll = collectionsSliderRef.scrollWidth - collectionsSliderRef.clientWidth;
      
      setCanScrollCollectionsLeft(scrollLeft > 10);
      setCanScrollCollectionsRight(scrollLeft < maxScroll - 10);
    };
    
    collectionsSliderRef.addEventListener('scroll', updateScrollState);
    updateScrollState(); // Initial check
    
    // Also check on resize
    const handleResize = () => {
      updateScrollState();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      collectionsSliderRef.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [collectionsSliderRef]);

  // Update scroll state for occasions carousel
  useEffect(() => {
    if (!occasionsSliderRef) return;
    
    const updateScrollState = () => {
      if (!occasionsSliderRef) return;
      const scrollLeft = occasionsSliderRef.scrollLeft;
      const maxScroll = occasionsSliderRef.scrollWidth - occasionsSliderRef.clientWidth;
      
      setCanScrollOccasionsLeft(scrollLeft > 10);
      setCanScrollOccasionsRight(scrollLeft < maxScroll - 10);
    };
    
    updateScrollState();
    occasionsSliderRef.addEventListener('scroll', updateScrollState);
    
    // Also update on resize
    const handleResize = () => {
      updateScrollState();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      occasionsSliderRef.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [occasionsSliderRef]);

  // Handle authentication redirect for admin users only
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      // Redirect admin users to admin dashboard
      router.push('/admin');
      return;
    }
  }, [isAuthenticated, authLoading, isAdmin, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soft-pink-100 via-white to-soft-pink-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the home page if user is admin (they will be redirected by useEffect)
  if (isAdmin) {
    return null;
  }

  // Error display component
  const ErrorDisplay = ({ field, message, onRetry, isLoading }: { field: string, message: string, onRetry?: () => void, isLoading?: boolean }) => (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 text-center shadow-lg">
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-2xl font-bold text-red-700 mb-2">Failed to Load {field}</h3>
        <p className="text-lg text-red-600 mb-3 font-medium">Data loading failed</p>
        <p className="text-sm text-red-500 mb-4 bg-red-100 p-3 rounded-lg border border-red-200">
          <strong>Error:</strong> {message}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-700 font-medium">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Please ensure the backend server is running on port 5000
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center mx-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Retrying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Loading
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  // Touch/swipe support - horizontal only
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const slider = target.closest('[id$="-slider"]') as HTMLElement;
    if (!slider) return;
    
    setIsDragging(true);
    setStartX(e.pageX - slider.offsetLeft);
    setScrollLeft(slider.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    const slider = target.closest('[id$="-slider"]') as HTMLElement;
    if (!slider) return;
    
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  };

  // Touch events - horizontal only
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const slider = target.closest('[id$="-slider"]') as HTMLElement;
    if (!slider) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - slider.offsetLeft);
    setScrollLeft(slider.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent vertical scrolling
    
    const target = e.target as HTMLElement;
    const slider = target.closest('[id$="-slider"]') as HTMLElement;
    if (!slider) return;
    
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Featured products slider navigation
  const scrollFeaturedProducts = (direction: 'left' | 'right') => {
    if (!featuredProductsSliderRef) return;
    
    const cardWidth = 280; // Approximate card width including gap
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    const maxScroll = featuredProductsSliderRef.scrollWidth - featuredProductsSliderRef.clientWidth;
    
    const newScroll = direction === 'left' 
      ? Math.max(0, featuredProductsSliderRef.scrollLeft - scrollAmount)
      : Math.min(maxScroll, featuredProductsSliderRef.scrollLeft + scrollAmount);
    
    featuredProductsSliderRef.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Categories slider navigation
  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoriesSliderRef) return;
    
    const cardWidth = 320; // Approximate card width including gap (larger for categories)
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    const maxScroll = categoriesSliderRef.scrollWidth - categoriesSliderRef.clientWidth;
    
    const newScroll = direction === 'left' 
      ? Math.max(0, categoriesSliderRef.scrollLeft - scrollAmount)
      : Math.min(maxScroll, categoriesSliderRef.scrollLeft + scrollAmount);
    
    categoriesSliderRef.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Collections slider navigation
  const scrollCollections = (direction: 'left' | 'right') => {
    if (!collectionsSliderRef) return;
    
    const cardWidth = 320; // Approximate card width including gap (same as categories)
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    const maxScroll = collectionsSliderRef.scrollWidth - collectionsSliderRef.clientWidth;
    
    const newScroll = direction === 'left' 
      ? Math.max(0, collectionsSliderRef.scrollLeft - scrollAmount)
      : Math.min(maxScroll, collectionsSliderRef.scrollLeft + scrollAmount);
    
    collectionsSliderRef.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  // Occasions slider navigation
  const scrollOccasions = (direction: 'left' | 'right') => {
    if (!occasionsSliderRef) return;
    
    const cardWidth = 320; // Approximate card width including gap (same as categories)
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time
    const maxScroll = occasionsSliderRef.scrollWidth - occasionsSliderRef.clientWidth;
    
    const newScroll = direction === 'left' 
      ? Math.max(0, occasionsSliderRef.scrollLeft - scrollAmount)
      : Math.min(maxScroll, occasionsSliderRef.scrollLeft + scrollAmount);
    
    occasionsSliderRef.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  return (
    <DataLoader>
      <MainLayout>
      <div className="overflow-x-hidden">
      {/* Brand Banner Section */}
      <section 
        id="brand-banner"
        className="relative py-12 xs:py-16 sm:py-20 md:py-24 overflow-hidden flex items-center justify-center min-h-[40vh]"
        style={{ 
          background: 'linear-gradient(135deg, #470031 0%, #470031 50%, #470031 100%)'
        }}
      >
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
              <Image
                src="/logo.jpg"
                alt="FEFA Logo"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 475px) 128px, (max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jewelry Categories Section */}
      <section id="categories-section" className="pb-8 pt-12 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        <div className="container mx-auto px-4">
          {fieldErrors.categories ? (
            <ErrorDisplay 
              field="Categories" 
              message={fieldErrors.categories} 
              isLoading={retrying.categories}
              onRetry={async () => {
                setRetrying(prev => ({ ...prev, categories: true }));
                await loadCategories();
                setRetrying(prev => ({ ...prev, categories: false }));
              }}
            />
          ) : (
            <div className="relative group">
              {/* Navigation Arrows - Invisible by default, show on hover */}
              <button
                onClick={() => scrollCategories('left')}
                disabled={!canScrollCategoriesLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  !canScrollCategoriesLeft ? 'cursor-not-allowed' : 'hover:scale-110'
                } flex items-center justify-center`}
                aria-label="Previous categories"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => scrollCategories('right')}
                disabled={!canScrollCategoriesRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  !canScrollCategoriesRight ? 'cursor-not-allowed' : 'hover:scale-110'
                } flex items-center justify-center`}
                aria-label="Next categories"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Categories Slider Container */}
              <div 
                ref={setCategoriesSliderRef}
                id="category-container"
                className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 cursor-grab active:cursor-grabbing px-8 sm:px-10 md:px-12 lg:px-16"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth',
                  touchAction: 'pan-x'
                }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {safeJewelryCategories.map((category: Category, index: number) => (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-2xl xs:rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-60 xl:w-80"
                  >
                    <Link href={`/collections?category=${category.slug}`} className="block">
                      <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-60 xl:h-80">
                        {/* Background Image */}
                        <Image
                          src={imageMap[category.image || ''] || category.image || '/images/placeholder-category.jpg'}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 475px) 160px, (max-width: 640px) 176px, (max-width: 768px) 192px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, 320px"
                        />
                        {/* Light overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/20" />
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-2 xs:p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
                          <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-script mb-1 xs:mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300 text-center leading-tight"
                          >
                            {category.name}
                          </motion.h3>
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className="text-white/90 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base font-light text-center"
                          >
                            Explore {category.name.toLowerCase()}
                          </motion.p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-12 pb-8 bg-white dark:bg-[#0a0a0a] overflow-hidden transition-colors duration-300">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl !font-cormorant text-primary mb-4">WHY CHOOSE US</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover what makes our jewelry special
            </p>
          </motion.div>
          
          {/* Features container with horizontal scroll for all screen sizes */}
          <div className="w-full flex justify-center lg:overflow-hidden">
            <div 
              id="features-container"
              className="flex gap-4 xs:gap-5 sm:gap-6 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing lg:justify-center"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
                touchAction: 'pan-x'
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
            {safeFeatures.map((feature: Feature, index: number) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-100 dark:border-purple-800/30 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-4 md:p-5 text-center flex-shrink-0 w-36 xs:w-40 sm:w-44 md:w-48 lg:w-52"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary via-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-2 xs:mb-2.5 sm:mb-3 shadow-lg">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                      <path d={feature.icon}/>
                    </svg>
                  </div>
                  <h3 className="text-primary dark:text-purple-300 font-bold text-base xs:text-base sm:text-lg md:text-lg mb-1 xs:mb-1.5 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-dark-gray dark:text-gray-300 text-sm xs:text-sm sm:text-base md:text-base leading-snug px-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections Section */}
      <section className="pt-8 pb-8 bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl !font-cormorant text-primary mb-3 xs:mb-4">OUR COLLECTIONS</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover our carefully curated collections of premium handcrafted jewelry
            </p>
          </motion.div>
          
          {/* Collections Carousel */}
          <div className="relative group">
            {/* Navigation Arrows - Invisible by default, show on hover */}
            <button
              onClick={() => scrollCollections('left')}
              disabled={!canScrollCollectionsLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                !canScrollCollectionsLeft ? 'cursor-not-allowed' : 'hover:scale-110'
              } flex items-center justify-center`}
              aria-label="Previous collections"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => scrollCollections('right')}
              disabled={!canScrollCollectionsRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                !canScrollCollectionsRight ? 'cursor-not-allowed' : 'hover:scale-110'
              } flex items-center justify-center`}
              aria-label="Next collections"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Collections Slider Container */}
            <div 
              ref={setCollectionsSliderRef}
              id="collections-slider"
              className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 cursor-grab active:cursor-grabbing px-8 sm:px-10 md:px-12 lg:px-16"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
                touchAction: 'pan-x'
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {collections.length > 0 ? (
                collections.map((collection, index) => (
                  <motion.div
                    key={collection._id || collection.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-2xl xs:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-60 xl:w-80"
                  >
                    <Link href={`/collections`} className="block">
                      <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-60 xl:h-80">
                        {/* Background Image or Gradient */}
                        {collection.image ? (
                          <>
                            <Image
                              src={collection.image}
                              alt={collection.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 475px) 160px, (max-width: 640px) 176px, (max-width: 768px) 192px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, 320px"
                            />
                            {/* Dark overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
                            {/* Large initial letter - positioned at top */}
                            <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-0">
                              <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-script text-primary opacity-20 group-hover:opacity-30 transition-opacity">
                                {collection.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Content overlay - centered */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-2 xs:p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
                          <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-script mb-1 xs:mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300 text-center leading-tight ${
                              collection.image ? 'text-white' : 'text-primary'
                            }`}
                          >
                            {collection.name}
                          </motion.h3>
                          {collection.description && (
                            <motion.p 
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.4 }}
                              viewport={{ once: true }}
                              className={`text-xs xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base font-medium text-center line-clamp-2 ${
                                collection.image ? 'text-white/90' : 'text-gray-600'
                              }`}
                            >
                              {collection.description}
                            </motion.p>
                          )}
                        </div>
                        
                        {/* Hover overlay */}
                        <div className={`absolute inset-0 transition-all duration-300 ${
                          collection.image 
                            ? 'bg-primary/0 group-hover:bg-primary/10' 
                            : 'bg-primary/0 group-hover:bg-primary/5'
                        }`} />
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full py-12">
                  <p className="text-gray-500">No collections available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Our Occasions Section */}
      <section className="pt-8 pb-8 bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl !font-cormorant text-primary mb-3 xs:mb-4">OCCASIONS</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Find the perfect jewelry for every special moment in your life
            </p>
          </motion.div>
          
          {/* Occasions Carousel */}
          <div className="relative group">
            {/* Navigation Arrows - Invisible by default, show on hover */}
            <button
              onClick={() => scrollOccasions('left')}
              disabled={!canScrollOccasionsLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                !canScrollOccasionsLeft ? 'cursor-not-allowed' : 'hover:scale-110'
              } flex items-center justify-center`}
              aria-label="Previous occasions"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => scrollOccasions('right')}
              disabled={!canScrollOccasionsRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                !canScrollOccasionsRight ? 'cursor-not-allowed' : 'hover:scale-110'
              } flex items-center justify-center`}
              aria-label="Next occasions"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Occasions Slider Container */}
            <div 
              ref={setOccasionsSliderRef}
              id="occasions-slider"
              className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 cursor-grab active:cursor-grabbing px-8 sm:px-10 md:px-12 lg:px-16"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
                touchAction: 'pan-x'
              }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {occasions.length > 0 ? (
                occasions.map((occasion: any, index: number) => (
                  <motion.div
                    key={occasion.value || occasion._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative overflow-hidden rounded-2xl xs:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 flex-shrink-0 w-40 xs:w-44 sm:w-48 md:w-52 lg:w-60 xl:w-80"
                  >
                    <Link href={`/collections?occasion=${occasion.value}`} className="block">
                      <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-60 xl:h-80">
                        {/* Background Image or Gradient */}
                        {occasion.image ? (
                          <>
                            <Image
                              src={occasion.image}
                              alt={occasion.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 475px) 160px, (max-width: 640px) 176px, (max-width: 768px) 192px, (max-width: 1024px) 208px, (max-width: 1280px) 240px, 320px"
                            />
                            {/* Dark overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
                            {/* Large initial letter - positioned at top */}
                            <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-0">
                              <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-script text-primary opacity-20 group-hover:opacity-30 transition-opacity">
                                {occasion.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Content overlay - centered */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-2 xs:p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6">
                          <motion.h3 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className={`text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-script mb-1 xs:mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300 text-center leading-tight ${
                              occasion.image ? 'text-white' : 'text-primary'
                            }`}
                          >
                            {occasion.name}
                          </motion.h3>
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            viewport={{ once: true }}
                            className={`text-xs xs:text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base font-medium text-center ${
                              occasion.image ? 'text-white/90' : 'text-gray-600'
                            }`}
                          >
                            {occasionCounts[occasion.value] !== undefined 
                              ? `(${occasionCounts[occasion.value]} items)`
                              : 'Loading...'}
                          </motion.p>
                        </div>
                        
                        {/* Hover overlay */}
                        <div className={`absolute inset-0 transition-all duration-300 ${
                          occasion.image 
                            ? 'bg-primary/0 group-hover:bg-primary/10' 
                            : 'bg-primary/0 group-hover:bg-primary/5'
                        }`} />
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full py-12">
                  <p className="text-gray-500">No occasions available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="pt-8 pb-8 bg-gradient-to-br from-soft-pink-100 to-soft-pink-200">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl !font-cormorant text-primary mb-3 xs:mb-4">FEATURED PRODUCTS</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover our most popular jewelry pieces, handcrafted with love and attention to detail
            </p>
          </motion.div>
          
          {/* Featured Products Slider */}
          {loadingFeaturedProducts ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="relative group">
              {/* Navigation Arrows - Invisible by default, show on hover */}
              <button
                onClick={() => scrollFeaturedProducts('left')}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  !canScrollLeft ? 'cursor-not-allowed' : 'hover:scale-110'
                } flex items-center justify-center`}
                aria-label="Previous products"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => scrollFeaturedProducts('right')}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  !canScrollRight ? 'cursor-not-allowed' : 'hover:scale-110'
                } flex items-center justify-center`}
                aria-label="Next products"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Products Slider Container */}
              <div 
                ref={setFeaturedProductsSliderRef}
                id="featured-products-slider"
                className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 cursor-grab active:cursor-grabbing px-8 sm:px-10 md:px-12 lg:px-16"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth',
                  touchAction: 'pan-x'
                }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {featuredProducts.map((product, index) => {
                  const discountPercentage = product.comparePrice 
                    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                    : 0;
                  
                  return (
                    <div 
                      key={product._id || index} 
                      className="flex-shrink-0 w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] h-full"
                    >
                      <ProductCard
                        _id={product._id}
                        name={product.name}
                        price={product.price}
                        comparePrice={product.comparePrice}
                        images={product.images || []}
                        slug={product.slug}
                        category={product.category}
                        isFeatured={product.isFeatured}
                        isActive={product.isActive}
                        discountPercentage={discountPercentage}
                        stockStatus={product.inventory?.quantity > 0 ? 'in-stock' : 'out-of-stock'}
                        ratings={product.ratings}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-dark-gray text-lg">No featured products available at the moment.</p>
            </div>
          )}
          
          {/* View All Products Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button href="/collections" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white">
              View All Products
            </Button>
          </motion.div>
        </div>
      </section>
          

      {/* Trending Looks Section */}
      <section className="pt-8 pb-8 bg-gradient-to-br from-soft-pink-100 to-soft-pink-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl !font-cormorant text-primary mb-3 xs:mb-4">TRENDING LOOKS</h2>
          </motion.div>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 lg:gap-8 items-center">
            {/* Phone Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center order-1 lg:order-1 mb-6 lg:mb-0"
            >
              <div className="relative scale-75 xs:scale-80 sm:scale-90 md:scale-95 lg:scale-100">
                <PhoneCard />
                {/* Decorative elements around phone */}
                <div className="absolute -top-2 xs:-top-3 sm:-top-4 -right-2 xs:-right-3 sm:-right-4 w-4 h-4 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-amber-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-3 xs:-bottom-4 sm:-bottom-6 -left-3 xs:-left-4 sm:-left-6 w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 bg-rose-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 -left-4 xs:-left-6 sm:-left-8 w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </motion.div>
            
            {/* Trending Looks Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4 xs:space-y-5 sm:space-y-6 order-2 lg:order-2 flex flex-col justify-center"
            >
              <div>
                <h3 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl !font-cormorant text-primary mb-3 xs:mb-4">
                  Discover What's Hot
                </h3>
                <p className="text-dark-gray text-sm xs:text-base sm:text-lg leading-relaxed mb-4 xs:mb-5 sm:mb-6">
                  Stay ahead of the fashion curve with our trending jewelry styles. 
                  From elegant statement pieces to delicate everyday wear, discover 
                  the looks that are making waves in the fashion world.
                </p>
              </div>
              
              <div className="space-y-3 xs:space-y-4">
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 xs:mt-1">
                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-primary mb-1 xs:mb-2">Statement Earrings</h4>
                    <p className="text-dark-gray text-sm xs:text-base">Bold, eye-catching pieces that command attention</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 xs:mt-1">
                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-primary mb-1 xs:mb-2">Layered Necklaces</h4>
                    <p className="text-dark-gray text-sm xs:text-base">Mix and match different lengths for a modern look</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 xs:mt-1">
                    <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base xs:text-lg sm:text-xl font-semibold text-primary mb-1 xs:mb-2">Minimalist Rings</h4>
                    <p className="text-dark-gray text-sm xs:text-base">Clean, simple designs that speak volumes</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 xs:pt-3 sm:pt-4">
                <Button 
                  href="/collections" 
                  variant="outline" 
                  size="sm"
                  className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white text-xs xs:text-sm px-3 xs:px-4 py-2 xs:py-2.5"
                >
                  Explore Trending Styles
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Love Section */}
      <section className="pt-8 pb-8 bg-gradient-to-br from-soft-pink-100 to-soft-pink-200">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl !font-cormorant text-primary mb-3 xs:mb-4">CUSTOMER LOVE</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              See why thousands of customers choose FEFA for their jewelry needs
            </p>
          </motion.div>
          
          {/* Customer testimonials container with horizontal scroll for mobile/tablet, grid for desktop */}
          <div 
            id="testimonials-container"
            className="flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:hidden overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {safeTestimonials.map((testimonial: Testimonial, index: number) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#1F2937] p-3 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 hover:scale-105 flex-shrink-0 w-64 xs:w-72 sm:w-80"
              >
                <div className="flex items-center mb-2 xs:mb-3">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-2 xs:ml-3 sm:ml-4">
                    <h4 className="font-semibold text-dark-gray text-xs xs:text-sm sm:text-base">{testimonial.name}</h4>
                    <div className="flex text-accent text-xs xs:text-sm">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-dark-gray text-xs xs:text-sm mb-2 xs:mb-3 italic leading-relaxed">
                  "{testimonial.review}"
                </p>
                <p className="text-primary text-xs font-medium">
                  Purchased: {testimonial.product}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* Desktop grid layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {safeTestimonials.map((testimonial: Testimonial, index: number) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-dark-gray">{testimonial.name}</h4>
                    <div className="flex text-accent">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-dark-gray text-sm mb-3 italic">
                  "{testimonial.review}"
                </p>
                <p className="text-primary text-xs font-medium">
                  Purchased: {testimonial.product}
                </p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button href="/collections" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-white">
              Shop Now
            </Button>
          </motion.div>
        </div>
      </section>



      {/* Newsletter */}
      <section className="pt-6 xs:pt-8 pb-12 xs:pb-16 bg-primary text-white">
        <div className="container mx-auto px-3 xs:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl !font-cormorant text-accent mb-3 xs:mb-4">Join Our Community</h2>
          <p className="max-w-lg xs:max-w-xl mx-auto mb-6 xs:mb-8 text-sm xs:text-base">
            Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips.
          </p>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email.trim()) return;
              
              setIsSubscribing(true);
              try {
                // TODO: Implement newsletter subscription API call
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
                alert('Thank you for subscribing!');
                setEmail('');
              } catch (error) {
                alert('Something went wrong. Please try again.');
              } finally {
                setIsSubscribing(false);
              }
            }}
            className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="px-3 xs:px-4 py-2 xs:py-3 w-full sm:flex-1 rounded sm:rounded-l sm:rounded-r-none text-dark-gray focus:outline-none focus:ring-2 focus:ring-accent text-sm xs:text-base"
              required
              disabled={isSubscribing}
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 disabled:cursor-not-allowed text-white px-4 xs:px-6 py-2 xs:py-3 rounded sm:rounded-r sm:rounded-l-none font-medium transition-colors sm:w-auto hover:scale-105 transform duration-200 text-sm xs:text-base whitespace-nowrap"
              suppressHydrationWarning
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          </motion.div>
        </div>
      </section>
      </div>
      </MainLayout>
    </DataLoader>
  );
}