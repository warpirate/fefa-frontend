'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheck, FiPackage, FiTruck, FiMail, FiDownload, FiHome, FiCreditCard } from 'react-icons/fi';
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

export default function ConfirmationStep() {
  const router = useRouter();
  const { order, processPayment, isProcessing } = useCheckout();
  const { clearCart } = useCart();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (order && !paymentSuccess) {
      handlePayment();
    }
  }, [order]);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const success = await processPayment();
      setPaymentSuccess(success);
      
      if (success) {
        // Clear cart after successful payment
        clearCart();
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatPaymentMethod = (method: any) => {
    if (!method) return 'Not specified';
    
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

  if (!order) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-primary font-medium">Processing your order...</p>
      </div>
    );
  }

  if (isProcessingPayment) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-primary font-medium">Processing payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please don't close this page</p>
      </div>
    );
  }

  if (!paymentSuccess) {
    return (
      <div className="p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCreditCard className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-medium text-primary mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We encountered an issue processing your payment. Please try again or use a different payment method.
        </p>
        <div className="space-y-4">
          <button
            onClick={handlePayment}
            className="bg-accent text-white py-3 px-8 rounded-md hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
          <div>
            <Link
              href="/cart"
              className="text-primary hover:text-accent transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-script text-accent mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-accent font-medium">Order ID: {order.id}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
              <FiPackage className="w-5 h-5 text-accent" />
              Order Summary
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-white rounded-lg"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={getValidImageUrl([{ url: item.image }])}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">Variant: {item.variantName}</p>
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

          {/* Shipping Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
              <FiTruck className="w-5 h-5 text-accent" />
              Shipping Information
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.email}</p>
              <p>{order.shippingAddress.phone}</p>
              <p className="mt-2">
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-accent" />
              Payment Information
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{formatPaymentMethod(order.paymentMethod)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {order.paymentMethod?.type === 'card' && 'Credit/Debit Card'}
                {order.paymentMethod?.type === 'upi' && 'UPI Payment'}
                {order.paymentMethod?.type === 'netbanking' && 'Net Banking'}
                {order.paymentMethod?.type === 'wallet' && 'Digital Wallet'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Order Total & Next Steps */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-32">
            <h3 className="text-lg font-medium text-primary mb-4">Order Total</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span className="text-accent">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">What's Next?</h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>You'll receive an order confirmation email shortly</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>We'll prepare your order for shipping</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>You'll get tracking information once shipped</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <span>Expected delivery: 3-5 business days</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              
              <Link
                href="/account/orders"
                className="block w-full bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition-colors text-center"
              >
                View Order Details
              </Link>
              
              <Link
                href="/collections"
                className="block w-full text-center text-primary hover:text-accent transition-colors py-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
