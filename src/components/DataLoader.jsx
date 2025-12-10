'use client';

import React from 'react';
import { useDataContext } from '@/contexts/DataContext';

const DataLoader = ({ children }) => {
  const { loading, error } = useDataContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800">Loading FEFA Jewelry...</h2>
          <p className="text-gray-600 mt-2">Please wait while we load our beautiful collection</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gold text-white px-6 py-2 rounded-lg hover:bg-gold-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default DataLoader;
