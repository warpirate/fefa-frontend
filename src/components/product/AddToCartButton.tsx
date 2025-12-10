'use client';

import { useState } from 'react';
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
}

export default function AddToCartButton({
  productId,
  variantId,
  price,
  quantity = 1,
  className = '',
  disabled = false
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/auth/login';
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(productId, quantity, variantId);
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could show a toast notification here
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
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {added ? (
        <>
          <FiCheck className="w-4 h-4" />
          <span>Added to Cart</span>
        </>
      ) : isAdding ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Adding...</span>
        </>
      ) : (
        <>
          <FiShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
