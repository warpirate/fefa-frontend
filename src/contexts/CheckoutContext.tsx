'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import checkoutService from '../services/checkoutService';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  postalCode?: string;
  country: string;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  details?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardName?: string;
    upiId?: string;
    bankName?: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface CheckoutContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  shippingAddress: ShippingAddress;
  setShippingAddress: (address: ShippingAddress) => void;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  order: Order | null;
  setOrder: (order: Order) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceedToNext: () => boolean;
  createOrder: () => Promise<void>;
  processPayment: (razorpayResponse?: any) => Promise<boolean>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cart, subtotal, total, itemCount } = useCart();
  const { user } = useAuth();

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email && !shippingAddress.email) {
      setShippingAddress(prev => ({ ...prev, email: user.email }));
    }
  }, [user, shippingAddress.email]);

  const clearError = () => setError(null);

  const nextStep = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1: // Shipping Information
        return !!(
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.email &&
          shippingAddress.phone &&
          shippingAddress.address &&
          shippingAddress.city &&
          shippingAddress.state &&
          shippingAddress.zipCode
        );
      case 2: // Payment Method
        return !!paymentMethod;
      case 3: // Order Review
        return true;
      case 4: // Order Confirmation
        return false;
      default:
        return false;
    }
  };

  const createOrder = async (): Promise<void> => {
    if (!cart || !paymentMethod || !shippingAddress) {
      throw new Error('Cart, payment method, or shipping address not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Format shipping address for API
      const formattedShippingAddress = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        addressLine1: shippingAddress.address || shippingAddress.addressLine1 || '',
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.zipCode || shippingAddress.postalCode || '',
        country: shippingAddress.country || 'India',
        phone: shippingAddress.phone,
      };

      // Create order via API
      const response = await checkoutService.createOrder({
        shippingAddress: formattedShippingAddress,
        billingAddress: formattedShippingAddress, // Using same address for billing
        paymentMethod: {
          type: paymentMethod.type,
        },
      });

      if (!response.success || !response.order) {
        throw new Error(response.message || 'Failed to create order');
      }

      // Map API response to Order interface
      const newOrder: Order = {
        id: response.order._id || response.order.orderNumber,
        items: cart.items.map(item => ({
          productId: typeof item.product === 'string' ? item.product : item.product._id,
          productName: typeof item.product === 'string' ? '' : item.product.name,
          variantId: item.variant ? (typeof item.variant === 'string' ? item.variant : item.variant._id) : undefined,
          variantName: item.variant && typeof item.variant !== 'string' ? item.variant.name : undefined,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          image: typeof item.product === 'string' 
            ? undefined 
            : (typeof item.product.images?.[0] === 'string' 
              ? item.product.images[0] 
              : item.product.images?.[0]?.url)
        })),
        shippingAddress,
        paymentMethod,
        subtotal: response.order.pricing?.subtotal || subtotal,
        discount: response.order.pricing?.discount || 0,
        shipping: response.order.pricing?.shipping || (subtotal > 5000 ? 0 : 99),
        total: response.order.pricing?.total || total,
        status: response.order.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store order ID for payment processing
      (newOrder as any).dbOrderId = response.order._id;

      setOrder(newOrder);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (razorpayResponse?: any): Promise<boolean> => {
    if (!order || !paymentMethod) {
      throw new Error('Order or payment method not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // If Razorpay response is provided, verify payment
      if (razorpayResponse) {
        const dbOrderId = (order as any).dbOrderId || order.id;
        const verifyResponse = await checkoutService.verifyPayment(
          razorpayResponse.razorpay_order_id,
          razorpayResponse.razorpay_payment_id,
          razorpayResponse.razorpay_signature,
          dbOrderId
        );

        if (!verifyResponse.success) {
          throw new Error(verifyResponse.message || 'Payment verification failed');
        }

        return true;
      }

      // Fallback: simulate payment (for testing)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.1;
      
      if (!success) {
        throw new Error('Payment failed. Please try again.');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const value: CheckoutContextType = {
    currentStep,
    setCurrentStep,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    order,
    setOrder,
    isProcessing,
    setIsProcessing,
    error,
    setError,
    clearError,
    nextStep,
    prevStep,
    canProceedToNext,
    createOrder,
    processPayment
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
