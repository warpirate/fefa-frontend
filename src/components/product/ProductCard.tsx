'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiCheck } from 'react-icons/fi';
import { StaticImageData } from 'next/image';
import { ProductImage, Category } from '@/types/data';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import '@/styles/components/product/ProductCard.css';

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

interface ProductCardProps {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  comparePrice?: number;
  originalPrice?: number;
  images: ProductImage[] | (string | StaticImageData)[];
  slug: string;
  category?: string | Category;
  occasions?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  stockStatus?: 'in-stock' | 'out-of-stock' | 'low-stock';
  discountPercentage?: number;
  ratings?: {
    average: number;
    count: number;
  };
}

export default function ProductCard({
  _id,
  id,
  name,
  price,
  comparePrice,
  originalPrice,
  images,
  slug,
  category,
  occasions,
  isNew,
  isBestSeller,
  isFeatured,
  isActive,
  stockStatus,
  discountPercentage,
  ratings,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist: checkIsInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Check if product is in wishlist on mount and when product changes
  useEffect(() => {
    const productId = _id || id;
    if (productId && isAuthenticated) {
      const inWishlist = checkIsInWishlist(productId);
      setIsInWishlist(inWishlist);
    }
  }, [_id, id, isAuthenticated, checkIsInWishlist]);
  
  const handleProductClick = () => {
    router.push(`/product/${slug}`);
  };
  
  // Helper function to get image URL
  const getImageUrl = (image: ProductImage | string | StaticImageData, index: number = 0): string | StaticImageData => {
    if (typeof image === 'string') {
      return imageMap[image] || image;
    }
    if (typeof image === 'object' && 'url' in image) {
      return image.url;
    }
    return image;
  };

  // Get current image
  const currentImage = images && images.length > 0 ? images[currentImageIndex] : null;
  const currentImageUrl = currentImage ? getImageUrl(currentImage as any) : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (images && images.length > 1) {
      setCurrentImageIndex(1);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/auth/login');
      return;
    }

    try {
      const productId = _id || id;
      console.log('[ProductCard] Toggling wishlist:', { _id, id, productId });
      
      if (!productId) {
        console.error('[ProductCard] No product ID available');
        setNotificationMessage('Product ID not found');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        return;
      }

      if (isInWishlist) {
        await removeFromWishlist(productId);
        setIsInWishlist(false);
        setNotificationMessage('Removed from wishlist');
      } else {
        await addToWishlist(productId);
        setIsInWishlist(true);
        setNotificationMessage('Added to wishlist');
      }
      
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      const errorMessage = error.message || 'Failed to update wishlist';
      setNotificationMessage(errorMessage);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/auth/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      const productId = _id || id;
      if (!productId) {
        setNotificationMessage('Product ID not found');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        return;
      }

      await addToCart(productId, 1);
      setIsAddedToCart(true);
      setNotificationMessage('Added to cart');
      setShowNotification(true);
      
      setTimeout(() => {
        setIsAddedToCart(false);
        setShowNotification(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setNotificationMessage(error.message || 'Failed to add to cart');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Product Image */}
      <div 
        className="block relative overflow-hidden rounded-t-xl bg-soft-pink-100 aspect-square cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="w-full h-full relative">
          {currentImageUrl && !imageError ? (
            <Image
              src={currentImageUrl}
              alt={name}
              fill
              className="object-cover hover-lift transition-transform duration-700 ease-in-out"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-soft-pink-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <span className="text-primary font-script text-sm">No Image</span>
              </div>
            </div>
          )}
        </div>
        
        
        {/* Quick Action Buttons */}
        <div 
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 transition-all duration-300 flex flex-col gap-1 sm:gap-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 ${
              isInWishlist 
                ? 'bg-accent text-white shadow-accent/25' 
                : 'bg-white/90 backdrop-blur-sm hover:bg-accent hover:text-white hover:shadow-accent/25'
            }`}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            suppressHydrationWarning
          >
            <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-accent hover:text-white hover:shadow-accent/25 transition-all duration-200"
            aria-label="Quick view"
            suppressHydrationWarning
          >
            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
        
        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-white/95 backdrop-blur-sm py-2 sm:py-3 px-3 sm:px-4 rounded-lg shadow-lg text-center text-xs sm:text-sm font-medium border border-gray-100"
            >
              {notificationMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 text-center">
        <h3 
          className="font-medium text-primary text-sm sm:text-lg mb-2 line-clamp-2 cursor-pointer hover:text-accent transition-colors"
          onClick={handleProductClick}
        >
          {name}
        </h3>
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <span className="font-semibold text-accent text-base sm:text-xl">₹{price.toFixed(2)}</span>
          {(comparePrice || originalPrice) && (
            <span className="text-gray-400 line-through text-xs sm:text-sm">
              ₹{((comparePrice || originalPrice) as number).toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={stockStatus === 'out-of-stock' || !isActive || isAddingToCart}
          className={`add-to-cart-button w-full mt-3 sm:mt-4 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            isAddedToCart 
              ? 'bg-green-500 text-white' 
              : stockStatus === 'out-of-stock' || !isActive
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-accent'
          }`}
        >
          {isAddedToCart ? (
            <span className="flex items-center justify-center gap-2">
              <FiCheck className="w-4 h-4" />
              Added to Cart
            </span>
          ) : isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </span>
          ) : stockStatus === 'out-of-stock' || !isActive ? (
            <span className="flex items-center justify-center gap-2">
              Out of Stock
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiShoppingBag className="w-4 h-4" />
              Add to Cart
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
