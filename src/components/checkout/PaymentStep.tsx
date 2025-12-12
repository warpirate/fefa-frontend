'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiShield, FiCheck, FiLoader } from 'react-icons/fi';
import { useCheckout, PaymentMethod } from '../../contexts/CheckoutContext';
import { useCart } from '../../contexts/CartContext';
import checkoutService from '../../services/checkoutService';
// Note: Using dynamic script loading instead of next/script for better compatibility

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentStep() {
  const { paymentMethod, setPaymentMethod, order } = useCheckout();
  const { subtotal, total } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['type'] | null>(
    paymentMethod?.type || null
  );
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const shipping = subtotal > 5000 ? 0 : 99;
  const discount = 0;
  const grandTotal = subtotal + shipping - discount;

  const paymentMethods = [
    {
      id: 'card',
      type: 'card' as const,
      title: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express, Rupay',
      icon: FiCreditCard,
      popular: true
    },
    {
      id: 'upi',
      type: 'upi' as const,
      title: 'UPI Payment',
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      icon: FiSmartphone,
      popular: true
    },
    {
      id: 'netbanking',
      type: 'netbanking' as const,
      title: 'Net Banking',
      description: 'All major banks supported',
      icon: FiShield,
      popular: false
    },
    {
      id: 'wallet',
      type: 'wallet' as const,
      title: 'Digital Wallet',
      description: 'Paytm Wallet, Mobikwik, Freecharge',
      icon: FiSmartphone,
      popular: false
    }
  ];

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const handleMethodSelect = (methodType: PaymentMethod['type']) => {
    setSelectedMethod(methodType);
    setPaymentMethod({
      type: methodType
    });
  };

  // This function will be called from ReviewStep after order creation
  const handleRazorpayPayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      alert('Payment gateway is loading. Please wait a moment and try again.');
      return;
    }

    if (!order) {
      // Order not created yet, payment will be handled after order creation
      return;
    }

    setIsLoadingRazorpay(true);

    try {
      // Create Razorpay order
      const dbOrderId = (order as any).dbOrderId || order.id;
      const razorpayOrderResponse = await checkoutService.createRazorpayOrder(
        grandTotal,
        dbOrderId
      );

      if (!razorpayOrderResponse.success || !razorpayOrderResponse.order) {
        throw new Error('Failed to create payment order');
      }

      const razorpayOrder = razorpayOrderResponse.order;

      // Get Razorpay key from environment
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      // Initialize Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'FEFA Jewelry',
        description: `Order ${order.id}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await checkoutService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              dbOrderId
            );

            if (verifyResponse.success) {
              // Payment successful - trigger order completion
              const { processPayment } = await import('../../contexts/CheckoutContext');
              // This will be handled by ConfirmationStep
              window.location.href = `/order-confirmation?orderId=${dbOrderId}&paymentId=${response.razorpay_payment_id}`;
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed: ' + (error.message || 'Unknown error'));
          }
        },
        prefill: {
          name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          email: order.shippingAddress.email,
          contact: order.shippingAddress.phone,
        },
        notes: {
          order_id: dbOrderId,
          order_number: order.id,
        },
        theme: {
          color: '#d4a574', // Your accent color
        },
        modal: {
          ondismiss: function() {
            setIsLoadingRazorpay(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + (response.error.description || 'Unknown error'));
        setIsLoadingRazorpay(false);
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      alert('Payment initialization failed: ' + (error.message || 'Unknown error'));
      setIsLoadingRazorpay(false);
    }
  };

  // Load Razorpay script dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    } else if (window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  return (
    <>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-primary mb-2">Payment Method</h2>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        {/* Payment Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.type;
            
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodSelect(method.type)}
              >
                {method.popular && (
                  <div className="absolute -top-2 left-4 bg-accent text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{method.title}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Message */}
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {paymentMethods.find(m => m.type === selectedMethod)?.title}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You will complete payment in the next step after reviewing your order.
            </p>
          </motion.div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <FiShield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
              <p className="text-sm text-green-700 mt-1">
                Your payment is secured by Razorpay. We never store your card details or payment information.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary mb-2">Accepted Payment Methods</h4>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span>• Credit/Debit Cards</span>
            <span>• UPI (Google Pay, PhonePe, Paytm)</span>
            <span>• Net Banking</span>
            <span>• Wallets</span>
          </div>
        </div>
      </div>
    </>
  );
}
