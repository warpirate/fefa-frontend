'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiCreditCard, FiPackage, FiEdit3, FiCheck } from 'react-icons/fi';
import { useCheckout } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';

// Helper function to get valid image URL
const getValidImageUrl = (images: any[] | undefined, fallback: string = '/images/logo.jpg'): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  const firstImage = images[0];
  
  if (typeof firstImage === 'string') {
    if (firstImage.trim() === '' || firstImage === 'undefined' || firstImage === 'null') {
      return fallback;
    }
    return firstImage;
  } else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    if (firstImage.url.trim() === '' || firstImage.url === 'undefined' || firstImage.url === 'null') {
      return fallback;
    }
    return firstImage.url;
  }
  
  return fallback;
};

export default function ReviewStep() {
  const { shippingAddress, paymentMethod, createOrder, isProcessing } = useCheckout();
  const { cart, subtotal, total, itemCount } = useCart();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const shipping = subtotal > 5000 ? 0 : 99;
  const discount = 0; // You can implement discount logic here
  const grandTotal = subtotal + shipping - discount;

  const handlePlaceOrder = async () => {
    setIsCreatingOrder(true);
    try {
      await createOrder();
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const formatPaymentMethod = (method: typeof paymentMethod) => {
    if (!method) return 'Not selected';
    
    switch (method.type) {
      case 'card':
        return `**** **** **** ${method.details?.cardNumber?.slice(-4) || '****'}`;
      case 'upi':
        return method.details?.upiId || 'UPI Payment';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Digital Wallet';
      default:
        return 'Unknown';
    }
  };

  if (!cart) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-primary font-medium">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-primary mb-2">Review Your Order</h2>
        <p className="text-gray-600">Please review your order details before placing it</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-accent" />
                Shipping Address
              </h3>
              <button className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
                <FiEdit3 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
              <p>{shippingAddress.email}</p>
              <p>{shippingAddress.phone}</p>
              <p className="mt-2">
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
              <p>{shippingAddress.country}</p>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-accent" />
                Payment Method
              </h3>
              <button className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
                <FiEdit3 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{formatPaymentMethod(paymentMethod)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {paymentMethod?.type === 'card' && 'Credit/Debit Card'}
                {paymentMethod?.type === 'upi' && 'UPI Payment'}
                {paymentMethod?.type === 'netbanking' && 'Net Banking'}
                {paymentMethod?.type === 'wallet' && 'Digital Wallet'}
              </p>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="text-lg font-medium text-primary flex items-center gap-2 mb-4">
              <FiPackage className="w-5 h-5 text-accent" />
              Order Items ({itemCount} item{itemCount !== 1 ? 's' : ''})
            </h3>
            
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-white rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={getValidImageUrl(item.product?.images)}
                      alt={item.product?.name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/product/${item.product?.slug || '#'}`}
                      className="font-medium text-primary hover:text-accent transition-colors"
                    >
                      {item.product?.name || 'Product'}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500">Variant: {item.variant?.name}</p>
                    )}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-accent">₹{item.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-32">
            <h3 className="text-lg font-medium text-primary mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-accent">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                  required
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-accent hover:underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || isCreatingOrder}
              className="w-full bg-accent text-white py-3 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing || isCreatingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
