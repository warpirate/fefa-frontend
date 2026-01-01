'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCreditCard, FiMapPin, FiPackage, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCheckout, CheckoutProvider } from '@/contexts/CheckoutContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import MainLayout from '@/components/layout/MainLayout';
import '@/styles/components/checkout/Checkout.css';

// Step Components
import ShippingStep from '../../components/checkout/ShippingStep';
import PaymentStep from '../../components/checkout/PaymentStep';
import ReviewStep from '../../components/checkout/ReviewStep';
import ConfirmationStep from '../../components/checkout/ConfirmationStep';

const steps = [
  { id: 1, title: 'Shipping', icon: FiMapPin, description: 'Delivery Information' },
  { id: 2, title: 'Payment', icon: FiCreditCard, description: 'Payment Method' },
  { id: 3, title: 'Review', icon: FiPackage, description: 'Order Review' },
  { id: 4, title: 'Confirmation', icon: FiCheck, description: 'Order Confirmed' }
];

function CheckoutContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { itemCount, isLoading: cartLoading } = useCart();
  const { openLoginModal } = useLoginModal();
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    canProceedToNext,
    isProcessing,
    error,
    clearError
  } = useCheckout();

  // Show login modal if not authenticated, redirect if cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      // Open login modal with redirect to checkout after login
      openLoginModal('/checkout');
      return;
    }
    
    if (!cartLoading && itemCount === 0) {
      router.push('/cart');
      return;
    }
  }, [isAuthenticated, cartLoading, itemCount, router, openLoginModal]);

  // Clear error when step changes
  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  const handleNext = () => {
    if (canProceedToNext()) {
      nextStep();
    }
  };

  const handlePrev = () => {
    prevStep();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ShippingStep />;
      case 2:
        return <PaymentStep />;
      case 3:
        return <ReviewStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <ShippingStep />;
    }
  };

  // Show loading only if cart is loading (not if just not authenticated - login modal will handle that)
  if (cartLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-primary font-medium">Loading checkout...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If not authenticated, show message (login modal will be shown by useEffect)
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-soft-pink-100 rounded-full flex items-center justify-center mb-6">
                <FiUser className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-medium text-primary mb-2">Please Login to Continue</h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                You need to be logged in to proceed with checkout. Please login using the modal.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (itemCount === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-soft-pink-100 rounded-full flex items-center justify-center mb-6">
                <FiPackage className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-medium text-primary mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                Add some beautiful jewelry to your cart before proceeding to checkout.
              </p>
              <button
                onClick={() => router.push('/collections')}
                className="bg-primary text-white py-3 px-8 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
              >
                <span>Start Shopping</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-script text-accent">Checkout</h1>
            <div className="w-24 h-1 bg-accent mx-auto mt-2 rounded-full"></div>
            <p className="text-primary mt-4">
              Complete your order in a few simple steps
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4 md:space-x-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-accent border-accent text-white'
                              : isActive
                              ? 'border-accent text-accent bg-accent/10'
                              : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <FiCheck className="w-6 h-6" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-accent' : isCompleted ? 'text-accent' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-400 hidden md:block">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`hidden md:block w-16 h-0.5 mx-4 ${
                            isCompleted ? 'bg-accent' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-md p-4"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={clearError}
                      className="text-red-400 hover:text-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-soft overflow-hidden"
          >
            {renderStepContent()}
          </motion.div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex justify-between"
            >
              <button
                onClick={handlePrev}
                disabled={currentStep === 1 || isProcessing}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceedToNext() || isProcessing}
                className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === 3 ? 'Place Order' : 'Next'}</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
