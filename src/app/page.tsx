'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
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
  CarouselItem, 
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [retrying, setRetrying] = useState({ categories: false, carousel: false });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeaturedProducts, setLoadingFeaturedProducts] = useState(true);
  
  // Get data from context
  const { 
    carousel,
    categories,
    features,
    products,
    trending,
    testimonials,
    fieldErrors,
    loadCategories,
    loadCarousel
  } = useDataContext();

  // Helper function to safely extract array from data
  const getSafeArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  // Ensure arrays are not null and are actually arrays - memoized to prevent recalculation
  const safeCarouselItems = useMemo(() => getSafeArray(carousel), [carousel]);
  const safeJewelryCategories = useMemo(() => getSafeArray(categories), [categories]);
  const safeFeatures = useMemo(() => getSafeArray(features), [features]);
  const safeProducts = useMemo(() => getSafeArray(products), [products]);
  const safeTrendingLooks = useMemo(() => getSafeArray(trending), [trending]);
  const safeTestimonials = useMemo(() => getSafeArray(testimonials), [testimonials]);

  // Auto-advance carousel
  useEffect(() => {
    if (safeCarouselItems.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % safeCarouselItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [safeCarouselItems.length]);

  // Fetch featured products
  useEffect(() => {
    const loadFeaturedProducts = async () => {
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
        console.error('Failed to load featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoadingFeaturedProducts(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect unauthenticated users to login page
        router.push('/auth/login');
        return;
      } else if (isAdmin) {
        // Redirect admin users to admin dashboard
        router.push('/admin');
        return;
      }
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

  // Don't render the home page if user is not authenticated or is admin
  // (they will be redirected by useEffect)
  if (!isAuthenticated || isAdmin) {
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

  return (
    <DataLoader>
      <MainLayout>
      <div className="overflow-x-hidden">
      {/* Jewelry Categories Section */}
      <section className="pb-8 pt-12 bg-white">
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
            <>
              {/* Categories container with horizontal scroll */}
              <div 
                id="category-container"
                className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {safeJewelryCategories.map((category: Category, index: number) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer flex-shrink-0"
              >
                <Link href={`/collections?category=${category.slug}`}>
                    <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52 overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105">
                    {/* Background Image */}
                    <Image
                      src={category.image || '/images/placeholder-category.jpg'}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 475px) 96px, (max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 160px, (max-width: 1280px) 192px, 208px"
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-white text-center px-1 xs:px-2 sm:px-3 group-hover:text-accent transition-colors drop-shadow-lg">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Automated Carousel Section */}
      <section className="relative h-[60vh] xs:h-[65vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] xl:h-[95vh] overflow-hidden -mt-4">
        <div className="relative w-full h-full">
          {fieldErrors.carousel ? (
            <div className="flex items-center justify-center h-full">
              <ErrorDisplay 
                field="Carousel" 
                message={fieldErrors.carousel} 
                isLoading={retrying.carousel}
                onRetry={async () => {
                  setRetrying(prev => ({ ...prev, carousel: true }));
                  await loadCarousel();
                  setRetrying(prev => ({ ...prev, carousel: false }));
                }}
              />
            </div>
          ) : (
            <>
              {safeCarouselItems.map((item: CarouselItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    scale: currentSlide === index ? 1 : 1.1
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`absolute inset-0 ${
                    currentSlide === index ? 'z-10' : 'z-0'
                  }`}
                >
                  {/* Background Image */}
                  <Image
                    src={imageMap[item.image || ''] || item.image || '/images/placeholder-banner.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                  {/* Dark overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  <div className="container mx-auto px-3 xs:px-4 sm:px-4 md:px-4 lg:px-4 h-full flex items-center relative z-10">
                    <div className="max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 30
                        }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-script text-amber-300 mb-2 xs:mb-3 sm:mb-4 leading-tight"
                      >
                        {item.title}
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 30
                        }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-amber-100 text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl mb-4 xs:mb-6 sm:mb-6 md:mb-8 leading-relaxed"
                      >
                        {item.subtitle}
                      </motion.p>
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 30
                        }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <Button 
                          href={item.buttonLink || '#'} 
                          variant="secondary" 
                          size="sm"
                          className="bg-amber-400 hover:bg-amber-500 text-white border-0 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-2 sm:py-3"
                        >
                          {item.buttonText || 'Learn More'}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Carousel Indicators */}
              <div className="absolute bottom-3 xs:bottom-4 sm:bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 xs:space-x-2 z-20">
                {safeCarouselItems.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-amber-300 scale-125' 
                        : 'bg-amber-200/50 hover:bg-amber-200/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    suppressHydrationWarning
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-16 pb-8 bg-soft-pink-100 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-script text-primary mb-4">WHY CHOOSE US</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover what makes our jewelry special
            </p>
          </motion.div>
          
          {/* Features container with horizontal scroll for mobile/tablet, grid for desktop */}
          <div 
            id="features-container"
            className="flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:hidden overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {safeFeatures.map((feature: Feature, index: number) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 rounded-2xl xs:rounded-3xl p-3 xs:p-4 sm:p-5 md:p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg flex-shrink-0 w-32 xs:w-36 sm:w-40 md:w-44"
              >
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mb-2 xs:mb-3 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                      <path d={feature.icon}/>
                    </svg>
                  </div>
                  <div className="text-amber-500 font-semibold text-xs xs:text-xs sm:text-sm md:text-sm leading-tight drop-shadow-sm">
                    {feature.description.split(' ').map((word: string, i: number) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Desktop grid layout */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-6">
            {safeFeatures.map((feature: Feature, index: number) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-soft-pink-100 to-soft-pink-200 rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                      <path d={feature.icon}/>
                    </svg>
                  </div>
                  <div className="text-amber-500 font-semibold text-sm leading-tight drop-shadow-sm">
                    {feature.description.split(' ').map((word: string, i: number) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </div>
          </motion.div>
            ))}
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
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-script text-primary mb-3 xs:mb-4">OUR COLLECTIONS</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover our carefully curated collections of premium handcrafted jewelry
            </p>
          </motion.div>
          
          {/* Collections Slider */}
          <div 
            id="collections-slider"
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 cursor-grab active:cursor-grabbing"
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
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl font-script text-primary mb-3 xs:mb-4">FEATURED PRODUCTS</h2>
            <p className="text-dark-gray max-w-2xl mx-auto text-sm xs:text-base sm:text-lg">
              Discover our most popular jewelry pieces, handcrafted with love and attention to detail
            </p>
          </motion.div>
          
          {/* Featured Products container with horizontal scroll for mobile/tablet, grid for desktop */}
          {loadingFeaturedProducts ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              {/* Mobile/Tablet horizontal scroll */}
              <div 
                id="featured-products-container"
                className="flex gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:hidden overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredProducts.slice(0, 6).map((product, index) => {
                  const discountPercentage = product.comparePrice 
                    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                    : 0;
                  
                  return (
                    <div key={product._id || index} className="flex-shrink-0 w-48 xs:w-52 sm:w-56 md:w-60">
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
              
              {/* Desktop grid layout */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredProducts.slice(0, 6).map((product, index) => {
                  const discountPercentage = product.comparePrice 
                    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                    : 0;
                  
                  return (
                    <motion.div
                      key={product._id || index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
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
                    </motion.div>
                  );
                })}
              </div>
            </>
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
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl font-script text-primary mb-3 xs:mb-4">TRENDING LOOKS</h2>
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
                <h3 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-script text-primary mb-3 xs:mb-4">
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
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl font-script text-primary mb-3 xs:mb-4">CUSTOMER LOVE</h2>
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
                className="bg-white p-3 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex-shrink-0 w-64 xs:w-72 sm:w-80"
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
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-script text-accent mb-3 xs:mb-4">Join Our Community</h2>
          <p className="max-w-lg xs:max-w-xl mx-auto mb-6 xs:mb-8 text-sm xs:text-base">
            Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips.
          </p>
          <form className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="px-3 xs:px-4 py-2 xs:py-3 w-full sm:w-2/3 rounded-l xs:rounded-l text-dark-gray focus:outline-none focus:ring-2 focus:ring-accent text-sm xs:text-base"
              required
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-white px-4 xs:px-6 py-2 xs:py-3 rounded-r xs:rounded-r font-medium transition-colors sm:w-1/3 hover:scale-105 transform duration-200 text-sm xs:text-base"
              suppressHydrationWarning
            >
              Subscribe
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