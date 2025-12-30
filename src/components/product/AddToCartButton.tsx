'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  price: number;
  quantity?: number;
  className?: string;
  disabled?: boolean;
  productName?: string;
  productImage?: string;
  productSlug?: string;
}

export default function AddToCartButton({
  productId,
  variantId,
  price,
  quantity = 1,
  className = '',
  disabled = false,
  productName,
  productImage,
  productSlug
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      // Pass product info for local storage when not authenticated
      await addToCart(
        productId, 
        quantity, 
        variantId,
        {
          name: productName,
          image: productImage,
          slug: productSlug,
          price: price
        }
      );
      
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      // Error handling
    } finally {
      setIsAdding(false);
    }
  };

  const baseClasses = `
    flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
  `;

  const variantClasses = added
    ? 'bg-green-500 text-white'
    : isAdding
    ? 'bg-gray-400 text-white cursor-not-allowed'
    : 'bg-accent text-white hover:bg-accent/90';

  return (
    <motion.button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      whileHover={!disabled && !isAdding && !added ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isAdding && !added ? { scale: 0.95 } : {}}
      animate={added ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={added ? {
        duration: 0.5,
        times: [0, 0.5, 1],
      } : {}}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      <AnimatePresence mode="wait">
        {added ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1
              }}
            >
              <FiCheck className="w-4 h-4" />
            </motion.div>
            <span>Added to Cart</span>
          </motion.span>
        ) : isAdding ? (
          <motion.span
            key="adding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
