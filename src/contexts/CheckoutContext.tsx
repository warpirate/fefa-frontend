'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
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
  processPayment: () => Promise<boolean>;
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
    if (!cart || !paymentMethod) {
      throw new Error('Cart or payment method not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderItems: OrderItem[] = cart.items.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        variantId: item.variant?._id,
        variantName: item.variant?.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        image: typeof item.product.images?.[0] === 'string' 
          ? item.product.images[0] 
          : item.product.images?.[0]?.url
      }));

      const shipping = subtotal > 5000 ? 0 : 99;
      const discount = 0; // You can implement discount logic here
      const orderTotal = subtotal + shipping - discount;

      const newOrder: Order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        discount,
        shipping,
        total: orderTotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setOrder(newOrder);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (): Promise<boolean> => {
    if (!order || !paymentMethod) {
      throw new Error('Order or payment method not available');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      // In a real app, you would integrate with payment gateway here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success (90% success rate)
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
