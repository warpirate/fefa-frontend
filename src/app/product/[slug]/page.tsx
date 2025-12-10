'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiMinus, FiPlus, FiHeart, FiShare2, FiStar, FiX } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { loadCollectionsProductsData, loadProductBySlug } from '@/utils/dataLoader';
import { Product } from '@/types/data';
import reviewService from '@/services/reviewService';

// Type definitions
interface PincodeResult {
  available: boolean;
  message: string;
  deliveryTime?: string;
}

interface StockStatus {
  status: 'out' | 'low' | 'available';
  message: string;
}

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

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

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, isLoading: wishlistLoading } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [pincodeResult, setPincodeResult] = useState<PincodeResult | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  
  // Reviews data state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Data state
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to fetch reviews for the product
  const fetchReviews = async (productId: string) => {
    try {
      setIsLoadingReviews(true);
      const response = await reviewService.getProductReviews(productId);
      if (response.success) {
        setReviews(response.data.reviews);
        setReviewStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to load specific product first
        const productData = await loadProductBySlug(slug as string);
        if (productData) {
          setProduct(productData);
          // Fetch reviews for this product
          const productId = productData._id || (productData as any).id;
          if (productId) {
            await fetchReviews(productId);
          }
        } else {
          // Fallback to loading all products
          const productsData = await loadCollectionsProductsData();
          setProducts(productsData);
          const foundProduct = productsData.find(p => p.slug === slug);
          setProduct(foundProduct || productsData[0]);
          
          // Fetch reviews for found product
          const productId = (foundProduct || productsData[0])?._id || (foundProduct || productsData[0] as any)?.id;
          if (productId) {
            await fetchReviews(productId);
          }
        }
        
        // Load related products
        const productsData = await loadCollectionsProductsData();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug]);
  
  // Get related products (excluding current product)
  const relatedProducts = products
    .filter(p => {
      const productId = p._id || (p as any).id;
      const currentProductId = product?._id || (product as any)?.id;
      const productCategory = typeof p.category === 'string' ? p.category : p.category?.name;
      const currentCategory = typeof product?.category === 'string' ? product?.category : product?.category?.name;
      return productId !== currentProductId && productCategory === currentCategory;
    })
    .slice(0, 3);
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }

    if (!product) {
      setAddToCartMessage('Product not found');
      setTimeout(() => setAddToCartMessage(''), 3000);
      return;
    }

    if (product.variants && product.variants.length > 0 && !selectedSize) {
      setAddToCartMessage('Please select a size');
      setTimeout(() => setAddToCartMessage(''), 3000);
      return;
    }

    try {
      setIsAddingToCart(true);
      setAddToCartMessage('');
      
      const productId = product._id || (product as any).id;
      if (!productId) {
        throw new Error('Product ID not found');
      }

      // Find variant ID if size is selected
      let variantId = undefined;
      if (selectedSize && product.variants) {
        const variant = product.variants.find((v: any) => v.name === selectedSize);
        if (variant) {
          variantId = (variant as any)._id;
        }
      }

      await addToCart(productId, quantity, variantId);
      setAddToCartMessage('Added to cart successfully!');
      setTimeout(() => setAddToCartMessage(''), 3000);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setAddToCartMessage(error.message || 'Failed to add to cart');
      setTimeout(() => setAddToCartMessage(''), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }

    if (!product) {
      setWishlistMessage('Product not found');
      setTimeout(() => setWishlistMessage(''), 3000);
      return;
    }

    try {
      setIsAddingToWishlist(true);
      setWishlistMessage('');
      
      const productId = product._id || (product as any).id;
      if (!productId) {
        throw new Error('Product ID not found');
      }

      // Find variant ID if size is selected
      let variantId = undefined;
      if (selectedSize && product.variants) {
        const variant = product.variants.find((v: any) => v.name === selectedSize);
        if (variant) {
          variantId = (variant as any)._id;
        }
      }

      await addToWishlist(productId, variantId);
      setWishlistMessage('Added to wishlist successfully!');
      setTimeout(() => setWishlistMessage(''), 3000);
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      setWishlistMessage(error.message || 'Failed to add to wishlist');
      setTimeout(() => setWishlistMessage(''), 3000);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    if (!product) {
      setReviewMessage('Product not found');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    if (reviewRating === 0) {
      setReviewMessage('Please select a rating');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    if (!reviewTitle.trim()) {
      setReviewMessage('Please enter a review title');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage('Please enter your review comment');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewMessage('');

      const productId = product._id || (product as any).id;
      if (!productId) {
        throw new Error('Product ID not found');
      }

      // Submit review to backend
      const response = await reviewService.createReview({
        productId: productId,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim()
      });

      if (response.success) {
        setReviewMessage('Review submitted successfully! Thank you for your feedback.');
        setTimeout(() => setReviewMessage(''), 5000);

        // Reset form
        setReviewRating(0);
        setReviewTitle('');
        setReviewComment('');
        setShowReviewForm(false);

        // Refresh reviews
        await fetchReviews(productId);
      } else {
        throw new Error(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setReviewMessage(error.message || 'Failed to submit review');
      setTimeout(() => setReviewMessage(''), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetReviewForm = () => {
    setReviewRating(0);
    setReviewTitle('');
    setReviewComment('');
    setReviewMessage('');
    setShowReviewForm(false);
  };

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeResult({ available: false, message: 'Please enter a valid 6-digit pincode' });
      return;
    }

    setIsCheckingPincode(true);
    
    // Simulate API call
    setTimeout(() => {
      if (product) {
        const deliveryInfo = product.pincodeDelivery?.[pincode as keyof typeof product.pincodeDelivery];
        if (deliveryInfo) {
          setPincodeResult({
            available: true,
            deliveryTime: deliveryInfo.deliveryTime,
            message: `Delivery available in ${deliveryInfo.deliveryTime}`
          });
        } else {
          setPincodeResult({
            available: false,
            message: 'Delivery not available for this pincode'
          });
        }
      }
      setIsCheckingPincode(false);
    }, 1000);
  };

  const getStockStatus = (): StockStatus | null => {
    if (!selectedSize || !product) return null;
    
    // Check if using variants structure
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => v.name === selectedSize);
      if (!variant || !variant.inventory) return { status: 'out', message: 'Size not available' };
      
      const inventory = variant.inventory as any;
      if (inventory.quantity === 0) return { status: 'out', message: 'Out of Stock' };
      if (inventory.quantity <= inventory.lowStockThreshold) {
        return { status: 'low', message: `Only ${inventory.quantity} left in stock` };
      }
      return { status: 'available', message: `${inventory.quantity} in stock` };
    }
    
    // Check if using new inventory structure
    if (product.inventory) {
      if (!product.inventory.trackQuantity) return { status: 'available', message: 'In Stock' };
      if (product.inventory.quantity === 0) return { status: 'out', message: 'Out of Stock' };
      if (product.inventory.quantity <= product.inventory.lowStockThreshold) {
        return { status: 'low', message: `Only ${product.inventory.quantity} left in stock` };
      }
      return { status: 'available', message: `${product.inventory.quantity} in stock` };
    }
    
    // Fallback to legacy stock structure
    const stock = product.stock?.[selectedSize as keyof typeof product.stock];
    if (stock === undefined || stock === 0) return { status: 'out', message: 'Out of Stock' };
    if (stock <= 5) return { status: 'low', message: `Only ${stock} left in stock` };
    return { status: 'available', message: `${stock} in stock` };
  };

  // Loading component
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary">Loading product...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Product not found
  if (!product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-primary mb-2">Product Not Found</h2>
            <p className="text-dark-gray mb-4">The product you're looking for doesn't exist.</p>
            <Button href="/collections" variant="secondary">
              Back to Collections
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="order-1 lg:order-1">
            <div className="relative aspect-square bg-soft-pink-100 rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={typeof product.images[activeImageIndex] === 'string' 
                    ? (imageMap[product.images[activeImageIndex]] || product.images[activeImageIndex])
                    : (product.images[activeImageIndex] as any).url || product.images[activeImageIndex]
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              ) : (
                <div className="w-full h-full bg-soft-pink-100 flex items-center justify-center">
                  <span className="text-primary font-script text-2xl sm:text-3xl lg:text-4xl">{product.name.charAt(0)}</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-square rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 ${
                      activeImageIndex === index 
                        ? 'ring-2 ring-accent scale-105' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <Image
                      src={typeof image === 'string' 
                        ? (imageMap[image] || image)
                        : (image as any).url || image
                      }
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 12vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="order-2 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-primary mb-2 sm:mb-3">{product.name}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
                <div className="flex text-accent text-sm sm:text-base">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-dark-gray text-sm sm:text-base">(24 reviews)</span>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-accent">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {(product.comparePrice || product.originalPrice) && (
                    <span className="text-gray-400 line-through text-lg sm:text-xl">
                      ₹{((product.comparePrice || product.originalPrice) as number).toFixed(2)}
                    </span>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full">
                      -{product.discountPercentage}% OFF
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-dark-gray mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
              
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Details</h3>
                <ul className="list-disc list-inside text-dark-gray space-y-1 text-sm sm:text-base">
                  {product.details?.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>

              {/* Size Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Size</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.name}
                        onClick={() => handleSizeChange(variant.name)}
                        className={`px-3 py-2 sm:px-4 sm:py-3 border rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                          selectedSize === variant.name
                            ? 'border-accent bg-accent text-white'
                            : 'border-gray-300 hover:border-accent hover:bg-soft-pink-100'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <div className="mt-3">
                      {(() => {
                        const stockStatus = getStockStatus();
                        if (!stockStatus) return null;
                        return (
                          <div className={`text-sm font-medium ${
                            stockStatus.status === 'out' ? 'text-red-600' :
                            stockStatus.status === 'low' ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {stockStatus.message}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
                <span className="text-sm sm:text-base font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg w-fit">
                  <button
                    onClick={decreaseQuantity}
                    className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-soft-pink-100 transition-colors rounded-l-lg"
                    aria-label="Decrease quantity"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 sm:px-6 sm:py-3 border-x text-sm sm:text-base font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="px-3 py-2 sm:px-4 sm:py-3 hover:bg-soft-pink-100 transition-colors rounded-r-lg"
                    aria-label="Increase quantity"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pincode Check */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Check Delivery</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                    maxLength={6}
                  />
                  <button
                    onClick={checkPincode}
                    disabled={isCheckingPincode || pincode.length !== 6}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-primary text-white rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                  >
                    {isCheckingPincode ? 'Checking...' : 'Check'}
                  </button>
                </div>
                {pincodeResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                    pincodeResult.available 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {pincodeResult.message}
                  </div>
                )}
              </div>
              
              {/* Add to Cart Message */}
              {addToCartMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                  addToCartMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {addToCartMessage}
                </div>
              )}

              {/* Wishlist Message */}
              {wishlistMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                  wishlistMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {wishlistMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  fullWidth 
                  className="py-3 sm:py-4"
                  onClick={handleAddToCart}
                  disabled={(() => {
                    const sizeRequired = product.variants && product.variants.length > 0 && !selectedSize;
                    const outOfStock = selectedSize && getStockStatus()?.status === 'out';
                    const stockStatusOut = product.stockStatus === 'out-of-stock' || (product as any).stockStatus === 'out-of-stock';
                    const notActive = !(product.isActive ?? true);
                    const adding = isAddingToCart;
                    const cartLoadingState = cartLoading;
                    
                    return sizeRequired || outOfStock || stockStatusOut || notActive || adding || cartLoadingState;
                  })()}
                >
                  {isAddingToCart || cartLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to Cart...
                    </span>
                  ) : (product.variants && product.variants.length > 0 && !selectedSize) ? (
                    'Select Size'
                  ) : getStockStatus()?.status === 'out' || product.stockStatus === 'out-of-stock' ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex items-center justify-center gap-2 py-3 sm:py-4"
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist || wishlistLoading}
                >
                  {isAddingToWishlist || wishlistLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    <>
                  <FiHeart className="w-4 h-4" /> Add to Wishlist
                    </>
                  )}
                </Button>
              </div>
              
              {/* Share */}
              <div className="flex flex-col sm:flex-row sm:items-center text-dark-gray gap-2 sm:gap-4">
                <div className="flex items-center">
                  <FiShare2 className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Share:</span>
                </div>
                <div className="flex space-x-3 sm:space-x-4">
                  <button className="hover:text-accent transition-colors text-sm sm:text-base px-2 py-1 rounded hover:bg-gray-100">FB</button>
                  <button className="hover:text-accent transition-colors text-sm sm:text-base px-2 py-1 rounded hover:bg-gray-100">IG</button>
                  <button className="hover:text-accent transition-colors text-sm sm:text-base px-2 py-1 rounded hover:bg-gray-100">TW</button>
                  <button className="hover:text-accent transition-colors text-sm sm:text-base px-2 py-1 rounded hover:bg-gray-100">PIN</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="border-b">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 sm:pb-4 font-medium text-left sm:text-center whitespace-nowrap transition-colors ${
                  activeTab === 'description'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-dark-gray hover:text-accent'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 sm:pb-4 font-medium text-left sm:text-center whitespace-nowrap transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-dark-gray hover:text-accent'
                }`}
              >
                Reviews ({reviewStats?.totalReviews || 0})
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-3 sm:pb-4 font-medium text-left sm:text-center whitespace-nowrap transition-colors ${
                  activeTab === 'shipping'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-dark-gray hover:text-accent'
                }`}
              >
                Shipping & Returns
              </button>
            </div>
          </div>
          
          <div className="py-6 sm:py-8">
            {activeTab === 'description' && (
              <div>
                <p className="text-dark-gray mb-4 text-sm sm:text-base leading-relaxed">
                  {product.description}
                </p>
                <p className="text-dark-gray text-sm sm:text-base leading-relaxed">
                  Each piece is handcrafted with attention to detail, ensuring the highest quality and a unique touch. 
                  Our jewelry is designed to be both elegant and comfortable for everyday wear, making it the perfect 
                  addition to your collection.
                </p>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <h3 className="text-lg sm:text-xl font-medium">Customer Reviews</h3>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto mt-4 sm:mt-0"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-lg p-6 mb-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-primary">Write Your Review</h4>
                        <button
                          onClick={resetReviewForm}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Review Message */}
                      {reviewMessage && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                          reviewMessage.includes('successfully') 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {reviewMessage}
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Rating *
                          </label>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`transition-colors ${
                                  star <= reviewRating
                                    ? 'text-accent'
                                    : 'text-gray-300 hover:text-accent'
                                }`}
                              >
                                <FiStar className="w-6 h-6 fill-current" />
                              </button>
                            ))}
                          </div>
                          {reviewRating > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {reviewRating === 1 && 'Poor'}
                              {reviewRating === 2 && 'Fair'}
                              {reviewRating === 3 && 'Good'}
                              {reviewRating === 4 && 'Very Good'}
                              {reviewRating === 5 && 'Excellent'}
                            </p>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Review Title *
                          </label>
                          <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Summarize your review in a few words"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            maxLength={100}
                          />
                          <p className="text-xs text-gray-500 mt-1">{reviewTitle.length}/100</p>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium text-primary mb-2">
                            Your Review *
                          </label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Tell us about your experience with this product..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                            maxLength={1000}
                          />
                          <p className="text-xs text-gray-500 mt-1">{reviewComment.length}/1000</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3">
                          <Button
                            variant="secondary"
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview || reviewRating === 0 || !reviewTitle.trim() || !reviewComment.trim()}
                            className="flex-1"
                          >
                            {isSubmittingReview ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Submitting...
                              </span>
                            ) : (
                              'Submit Review'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetReviewForm}
                            disabled={isSubmittingReview}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Existing Reviews */}
                  {isLoadingReviews ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-primary">Loading reviews...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 sm:pb-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-2">
                          <h4 className="font-medium text-sm sm:text-base">
                            {review.user?.firstName} {review.user?.lastName}
                          </h4>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex text-accent mb-2 text-sm sm:text-base">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-accent' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        {review.title && (
                          <h5 className="font-medium text-primary mb-2 text-sm sm:text-base">
                            {review.title}
                          </h5>
                        )}
                        <p className="text-dark-gray text-sm sm:text-base leading-relaxed">
                          {review.comment}
                        </p>
                        {review.isVerified && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified Purchase
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg sm:text-xl font-medium mb-4">Shipping Information</h3>
                <p className="text-dark-gray mb-4 text-sm sm:text-base leading-relaxed">
                  We offer free standard shipping on all orders over ₹5000. Standard shipping takes 3-5 business days.
                  Express shipping is available for an additional fee and delivers within 1-2 business days.
                </p>
                
                <h3 className="text-lg sm:text-xl font-medium mb-4 mt-6">Return Policy</h3>
                <p className="text-dark-gray text-sm sm:text-base leading-relaxed">
                  We accept returns within 30 days of purchase. Items must be unworn, in their original packaging, 
                  and with all tags attached. Please note that custom orders are final sale and cannot be returned.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <h2 className="text-2xl sm:text-3xl font-script text-primary mb-6 sm:mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id || (relatedProduct as any).id} {...relatedProduct} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
