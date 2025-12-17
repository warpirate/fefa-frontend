'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiSearch, FiTag, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import { Product, CollectionCategory } from '@/types/data';
import '@/styles/components/ui/SearchSuggestions.css';

interface SearchSuggestionsProps {
  searchTerm: string;
  products: Product[];
  categories: CollectionCategory[];
  onSuggestionClick: (suggestion: string) => void;
  onSearchAll: () => void;
  onClose: () => void;
  isVisible: boolean;
}

interface SuggestionItem {
  text: string;
  type: 'product' | 'category' | 'trending' | 'page';
  icon: React.ReactNode;
  priority: number;
  isExactMatch?: boolean;
  isTrending?: boolean;
  image?: string;
  price?: number;
}

interface CategorizedSuggestions {
  suggestions: SuggestionItem[];
  products: SuggestionItem[];
  pages: SuggestionItem[];
}

export default function SearchSuggestions({
  searchTerm,
  products,
  categories,
  onSuggestionClick,
  onSearchAll,
  onClose,
  isVisible
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Generate categorized suggestions based on search term - memoized for performance
  const categorizedSuggestions: CategorizedSuggestions = useMemo(() => {
    const result: CategorizedSuggestions = {
      suggestions: [],
      products: [],
      pages: []
    };

    if (searchTerm.length >= 1) {
      const searchLower = searchTerm.toLowerCase();
      
      // Generate category suggestions - optimized: cache toLowerCase() calls
      const categorySuggestions = categories
        .map(category => ({
          category,
          nameLower: category.name.toLowerCase()
        }))
        .filter(({ nameLower, category }) => 
          nameLower.includes(searchLower) && category.value !== 'all'
        )
        .slice(0, 4)
        .map(({ category, nameLower }) => ({
          text: category.name,
          type: 'category' as const,
          icon: <FiTag className="w-4 h-4" />,
          priority: nameLower === searchLower ? 1 : 2,
          isExactMatch: nameLower === searchLower
        }));

      // Generate product suggestions - optimized: cache toLowerCase() calls
      const productSuggestions = products
        .map(product => ({
          product,
          nameLower: product.name.toLowerCase(),
          categoryLower: typeof product.category === 'string' 
            ? product.category.toLowerCase()
            : product.category?.name?.toLowerCase() || ''
        }))
        .filter(({ nameLower, categoryLower }) => 
          nameLower.includes(searchLower) || categoryLower.includes(searchLower)
        )
        .slice(0, 3)
        .map(({ product, nameLower }) => ({
          text: product.name,
          type: 'product' as const,
          icon: <FiSearch className="w-4 h-4" />,
          priority: nameLower === searchLower ? 1 : 2,
          isExactMatch: nameLower === searchLower,
          image: product.images?.[0]?.url || '/images/product-1.png',
          price: product.price
        }));

      // Generate page suggestions (left column)
      const pageSuggestions = [
        {
          text: `Types of ${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)}`,
          type: 'page' as const,
          icon: <FiSearch className="w-4 h-4" />,
          priority: 3,
          isExactMatch: false
        },
        {
          text: `How to ${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)}`,
          type: 'page' as const,
          icon: <FiSearch className="w-4 h-4" />,
          priority: 3,
          isExactMatch: false
        }
      ].slice(0, 2);

      result.suggestions = categorySuggestions;
      result.products = productSuggestions;
      result.pages = pageSuggestions;
    }

    return result;
  }, [searchTerm, categories, products]);

  // Flatten all suggestions for keyboard navigation
  const allSuggestions = useMemo(() => [
    ...categorizedSuggestions.suggestions,
    ...categorizedSuggestions.products,
    ...categorizedSuggestions.pages
  ], [categorizedSuggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || allSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (allSuggestions[selectedIndex]) {
            onSuggestionClick(allSuggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, allSuggestions, selectedIndex, onSuggestionClick, onClose]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allSuggestions]);

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || allSuggestions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={suggestionsRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="search-suggestions"
      >
        <div className="suggestions-content">
          {/* Left Column */}
          <div className="suggestions-left">
            {/* Suggestions Section */}
            {categorizedSuggestions.suggestions.length > 0 && (
              <div className="suggestion-section">
                <h3 className="section-title">Suggestions</h3>
                <div className="section-items">
                  {categorizedSuggestions.suggestions.map((suggestion, index) => {
                    const globalIndex = allSuggestions.indexOf(suggestion);
                    return (
                      <motion.div
                        key={`suggestion-${suggestion.text}`}
                        ref={el => { itemRefs.current[globalIndex] = el; }}
                        className={`suggestion-item ${
                          globalIndex === selectedIndex ? 'selected' : ''
                        } ${suggestion.isExactMatch ? 'exact-match' : ''}`}
                        onClick={() => onSuggestionClick(suggestion.text)}
                        whileHover={{ backgroundColor: 'rgba(125, 33, 129, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="suggestion-icon">
                          {suggestion.icon}
                        </div>
                        <span className="suggestion-text">{suggestion.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pages Section */}
            {categorizedSuggestions.pages.length > 0 && (
              <div className="suggestion-section">
                <h3 className="section-title">Pages</h3>
                <div className="section-items">
                  {categorizedSuggestions.pages.map((suggestion, index) => {
                    const globalIndex = allSuggestions.indexOf(suggestion);
                    return (
                      <motion.div
                        key={`page-${suggestion.text}`}
                        ref={el => { itemRefs.current[globalIndex] = el; }}
                        className={`suggestion-item ${
                          globalIndex === selectedIndex ? 'selected' : ''
                        }`}
                        onClick={() => onSuggestionClick(suggestion.text)}
                        whileHover={{ backgroundColor: 'rgba(125, 33, 129, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="suggestion-icon">
                          {suggestion.icon}
                        </div>
                        <span className="suggestion-text">{suggestion.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="suggestions-right">
            {/* Products Section */}
            {categorizedSuggestions.products.length > 0 && (
              <div className="suggestion-section">
                <h3 className="section-title">Products</h3>
                <div className="section-items">
                  {categorizedSuggestions.products.map((suggestion, index) => {
                    const globalIndex = allSuggestions.indexOf(suggestion);
                    return (
                      <motion.div
                        key={`product-${suggestion.text}`}
                        ref={el => { itemRefs.current[globalIndex] = el; }}
                        className={`product-item ${
                          globalIndex === selectedIndex ? 'selected' : ''
                        } ${suggestion.isExactMatch ? 'exact-match' : ''}`}
                        onClick={() => onSuggestionClick(suggestion.text)}
                        whileHover={{ backgroundColor: 'rgba(125, 33, 129, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="product-image">
                          <Image
                            src={suggestion.image || '/images/product-1.png'}
                            alt={suggestion.text}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                        </div>
                        <div className="product-content">
                          <span className="product-name">{suggestion.text}</span>
                          {suggestion.price && (
                            <span className="product-price">₹{suggestion.price}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search All Button */}
        <div className="search-all-section">
          <motion.button
            className="search-all-button"
            onClick={onSearchAll}
            whileHover={{ backgroundColor: 'rgba(125, 33, 129, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Search for "{searchTerm}"</span>
            <FiArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
