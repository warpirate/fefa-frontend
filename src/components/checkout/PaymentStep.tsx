'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiSmartphone, FiShield, FiCheck } from 'react-icons/fi';
import { useCheckout, PaymentMethod } from '../../contexts/CheckoutContext';

export default function PaymentStep() {
  const { paymentMethod, setPaymentMethod } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['type'] | null>(
    paymentMethod?.type || null
  );
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [upiId, setUpiId] = useState('');

  const paymentMethods = [
    {
      id: 'card',
      type: 'card' as const,
      title: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
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

  const handleMethodSelect = (methodType: PaymentMethod['type']) => {
    setSelectedMethod(methodType);
    
    if (methodType === 'card') {
      setPaymentMethod({
        type: 'card',
        details: cardDetails
      });
    } else if (methodType === 'upi') {
      setPaymentMethod({
        type: 'upi',
        details: { upiId }
      });
    } else {
      setPaymentMethod({
        type: methodType
      });
    }
  };

  const handleCardInputChange = (field: string, value: string) => {
    const updatedDetails = { ...cardDetails, [field]: value };
    setCardDetails(updatedDetails);
    
    if (selectedMethod === 'card') {
      setPaymentMethod({
        type: 'card',
        details: updatedDetails
      });
    }
  };

  const handleUpiInputChange = (value: string) => {
    setUpiId(value);
    
    if (selectedMethod === 'upi') {
      setPaymentMethod({
        type: 'upi',
        details: { upiId: value }
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
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

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-primary mb-4">Card Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  handleCardInputChange('cardNumber', formatted);
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                id="cardName"
                type="text"
                value={cardDetails.cardName}
                onChange={(e) => handleCardInputChange('cardName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    handleCardInputChange('expiryDate', formatted);
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                    handleCardInputChange('cvv', value);
                  }}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* UPI Details Form */}
      {selectedMethod === 'upi' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-primary mb-4">UPI Details</h3>
          
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID
            </label>
            <input
              id="upiId"
              type="text"
              value={upiId}
              onChange={(e) => handleUpiInputChange(e.target.value)}
              placeholder="yourname@paytm or 9876543210@paytm"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter your UPI ID or mobile number linked to UPI
            </p>
          </div>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <FiShield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-800">Secure Payment</h4>
            <p className="text-sm text-green-700 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
