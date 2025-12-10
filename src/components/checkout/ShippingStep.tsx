'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome } from 'react-icons/fi';
import { useCheckout } from '../../contexts/CheckoutContext';

export default function ShippingStep() {
  const { shippingAddress, setShippingAddress } = useCheckout();
  const [formData, setFormData] = useState(shippingAddress);

  useEffect(() => {
    setFormData(shippingAddress);
  }, [shippingAddress]);

  const handleInputChange = (field: keyof typeof shippingAddress, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setShippingAddress(updatedData);
  };

  const inputFields = [
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      icon: FiUser,
      required: true,
      placeholder: 'Enter your first name'
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      icon: FiUser,
      required: true,
      placeholder: 'Enter your last name'
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      icon: FiMail,
      required: true,
      placeholder: 'Enter your email address'
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'tel',
      icon: FiPhone,
      required: true,
      placeholder: 'Enter your phone number'
    },
    {
      id: 'address',
      label: 'Street Address',
      type: 'text',
      icon: FiHome,
      required: true,
      placeholder: 'Enter your street address'
    },
    {
      id: 'city',
      label: 'City',
      type: 'text',
      icon: FiMapPin,
      required: true,
      placeholder: 'Enter your city'
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      icon: FiMapPin,
      required: true,
      placeholder: 'Enter your state'
    },
    {
      id: 'zipCode',
      label: 'ZIP Code',
      type: 'text',
      icon: FiMapPin,
      required: true,
      placeholder: 'Enter your ZIP code'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-primary mb-2">Shipping Information</h2>
        <p className="text-gray-600">Please provide your delivery details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inputFields.map((field) => {
          const Icon = field.icon;
          const value = formData[field.id as keyof typeof formData];
          const isRequired = field.required;

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={field.id === 'address' ? 'md:col-span-2' : ''}
            >
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id={field.id}
                  type={field.type}
                  value={value}
                  onChange={(e) => handleInputChange(field.id as keyof typeof shippingAddress, e.target.value)}
                  placeholder={field.placeholder}
                  required={isRequired}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMapPin className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Japan">Japan</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-primary mb-3">Delivery Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Free shipping on orders over ₹5,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Standard delivery: 3-5 business days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>Express delivery: 1-2 business days (additional charges apply)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>All orders are carefully packaged and insured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
