"use client";

import React, { createContext, useContext } from 'react';
import { useData } from '../hooks/useData.js';

const DataContext = createContext();

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const data = useData();

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};
