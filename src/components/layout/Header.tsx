'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiGift, FiHome, FiGrid, FiMenu, FiSettings, FiLogOut } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSearch } from '@/contexts/SearchContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import UserDropdown from '@/components/auth/UserDropdown';
import SearchSuggestions from '@/components/ui/SearchSuggestions';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { loadCollectionsProductsData, loadCollectionsCategoriesData } from '@/utils/dataLoader';
import { Product, CollectionCategory } from '@/types/data';
import '@/styles/components/layout/Header.css';

const navigation = [
  { 
    name: 'HOME', 
    href: '/',
    hasDropdown: false
  },
  { 
    name: 'COLLECTIONS', 
    href: '/collections',
    hasDropdown: false
  },
  { 
    name: 'GIFT', 
    href: '/gift',
    isIcon: true,
    hasDropdown: false
  },
];

// Mobile navigation icons mapping
const mobileNavIcons = [
  { 
    name: 'HOME', 
    icon: FiHome, 
    href: '/',
    hasDropdown: false
  },
  { 
    name: 'GIFT', 
    icon: FiGift, 
    href: '/gift',
    hasDropdown: false
  },
  { 
    name: 'COLLECTIONS', 
    icon: FiGrid, 
    href: '/collections',
    hasDropdown: false
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CollectionCategory[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { setSearchQuery } = useSearch();
  const { totalQuantity } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header at top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Load data for suggestions
  useEffect(() => {
    const loadSuggestionsData = async () => {
      try {
        setIsLoadingSuggestions(true);
        const [productsData, categoriesData] = await Promise.all([
          loadCollectionsProductsData(),
          loadCollectionsCategoriesData()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading suggestions data:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestionsData();
  }, []);

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      router.push(`/collections?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(value.length >= 1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearchQuery(suggestion);
    router.push(`/collections?search=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleSearchAll = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      router.push(`/collections?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setShowSuggestions(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchInput.length >= 1) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isVisible 
            ? 'translate-y-0' 
            : '-translate-y-full'
        } ${
          isScrolled 
            ? 'bg-[#470031] shadow-lg py-2 sm:py-3 border-[#470031]' 
            : 'bg-[#470031] py-3 sm:py-4 border-[#470031]'
        }`}
        style={{ backgroundColor: '#470031' }}
      >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile search button */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#DBC078] focus:outline-none"
              suppressHydrationWarning
            >
              <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center h-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-full flex items-center"
              >
                <Image
                  src="/logo.jpg"
                  alt="FEFA Logo"
                  width={200}
                  height={100}
                  className="h-full max-h-12 sm:max-h-16 md:max-h-20 lg:max-h-24 w-auto object-contain"
                  priority
                />
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation and Search */}
          <div className="hidden lg:flex items-center flex-1 justify-end gap-6 xl:gap-8">
            {/* Navigation Links */}
            <nav className="flex items-center gap-6 xl:gap-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="text-xs xl:text-sm font-medium uppercase tracking-wide transition-colors hover:text-[#cfb570] text-[#DBC078]"
                    onMouseEnter={() => item.hasDropdown && handleDropdownToggle(item.name)}
                  >
                    {item.isIcon ? (
                      <motion.div
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                        whileTap={{ 
                          scale: 0.95,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.2 }
                        }}
                        className="p-2"
                      >
                         <FiGift className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#DBC078]" />
                      </motion.div>
                    ) : (
                      item.name
                    )}
                  </Link>
                  
                  {/* Mega Dropdown Menu */}
                  {item.hasDropdown && openDropdown === item.name && 'dropdown' in item && (item as any).dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="fixed left-0 right-0 top-12 sm:top-[70px] bg-[#F8E4EB] shadow-lg py-4 sm:py-8 z-50"
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="container mx-auto px-4">
                        <div className={`${item.name === 'GIFT' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-6 lg:gap-8`}>
                          {(item as any).dropdown.categories.map((category: any, index: number) => (
                            <div key={index} className="space-y-4">
                              <h3 className="text-[#4B006E] text-lg sm:text-xl font-cormorant mb-2 sm:mb-4 border-b border-[#4B006E] pb-1 sm:pb-2">
                                {category.title}
                              </h3>
                              {category.items.length > 0 ? (
                                <ul className="space-y-3">
                                  {category.items.map((subItem: any, subIndex: number) => (
                                    <li key={subIndex}>
                        <Link
                                        href={subItem.href}
                                        className="text-[#4B006E] hover:text-[#D4AF37] transition-colors block py-1 text-xs sm:text-sm font-medium hover:font-semibold"
                                      >
                                        {subItem.name}
                        </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-[#4B006E] text-xs sm:text-sm font-medium py-2">
                                  Coming Soon
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Search and Right icons */}
            <div className="flex items-center gap-4 xl:gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <form onSubmit={handleSearch} className="relative w-40 xl:w-52">
                 <FiSearch className="w-3 h-3 sm:w-4 sm:h-4 text-[#DBC078] absolute left-3 top-1/2 transform -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search"
                   value={searchInput}
                   onChange={handleSearchInputChange}
                   onFocus={handleSearchFocus}
                   onBlur={handleSearchBlur}
                   className="pl-10 pr-4 py-2 text-sm border-b border-[#DBC078] focus:outline-none focus:border-[#cfb570] bg-transparent text-[#DBC078] placeholder-[#dcc996] w-full"
                   suppressHydrationWarning
                 />
              </form>
              
              <SearchSuggestions
                searchTerm={searchInput}
                products={products}
                categories={categories}
                onSuggestionClick={handleSuggestionClick}
                onSearchAll={handleSearchAll}
                onClose={() => setShowSuggestions(false)}
                isVisible={showSuggestions && !isLoadingSuggestions}
              />
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
            
            {/* User Icons */}
          <div className="flex items-center gap-3 xl:gap-4">
             <Link href="/wishlist" className="p-2 text-[#DBC078] hover:text-[#cfb570] transition-colors relative">
               <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
               {wishlistCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#cfb570] text-[#470031] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                   {wishlistCount > 99 ? '99+' : wishlistCount}
                 </span>
               )}
             </Link>
             <Link href="/cart" className="p-2 text-[#DBC078] hover:text-[#cfb570] transition-colors relative">
               <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
               {totalQuantity > 0 && (
                 <span className="absolute -top-1 -right-1 bg-[#cfb570] text-[#470031] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                   {totalQuantity > 99 ? '99+' : totalQuantity}
                 </span>
               )}
             </Link>
            </div>
            
            {/* Auth Section */}
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/auth/login" 
                    className="px-4 py-2 text-sm font-medium text-primary dark:text-[#E6C547] hover:text-accent dark:hover:text-[#E6C547]/80 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 text-sm font-medium bg-primary dark:bg-[#6B1A7A] text-white rounded-lg hover:bg-primary/90 dark:hover:bg-[#6B1A7A]/90 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-3 sm:bottom-4 md:bottom-5 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl sm:rounded-3xl md:rounded-[1.75rem] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 shadow-lg border border-gray-200 dark:border-gray-700 min-w-[280px] sm:min-w-[350px] md:min-w-[420px]">
          {/* Navigation Icons */}
          {mobileNavIcons.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.name} className="relative">
                <Link
                  href={item.href}
                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary dark:text-[#E6C547] hover:transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onMouseEnter={() => setHoveredIcon(item.name)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  onClick={() => item.hasDropdown && handleDropdownToggle(item.name)}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </Link>
                
                {/* Hover Tooltip */}
                {hoveredIcon === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                  >
                    {item.name}
                  </motion.div>
                )}
                
                {/* Mobile Mega Menu */}
                {item.hasDropdown && openDropdown === item.name && 'dropdown' in item && (item as any).dropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 100 }}
                      className="bg-white rounded-t-3xl w-full max-w-md max-h-[80vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-[#4B006E]">Collections</h2>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-6">
                          {(item as any).dropdown.categories.map((category: any, index: number) => (
                            <div key={index} className="space-y-3">
                              <h3 className="text-lg font-bold uppercase tracking-wide text-[#4B006E] border-b border-[#4B006E] pb-2 font-cormorant">
                                {category.title}
                              </h3>
                              <ul className="space-y-2">
                                {category.items.map((subItem: any, subIndex: number) => (
                                  <li key={subIndex}>
                                    <Link
                                      href={subItem.href}
                                      className="text-sm text-[#4B006E] hover:text-[#D4AF37] transition-colors block py-2 px-3 rounded-lg hover:bg-gray-50"
                                      onClick={() => setOpenDropdown(null)}
                                    >
                                      {subItem.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* Wishlist Icon */}
          <div className="relative">
            <Link 
              href="/wishlist" 
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary dark:text-[#E6C547] hover:transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative"
              onMouseEnter={() => setHoveredIcon('WISHLIST')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <FiHeart className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Hover Tooltip */}
            {hoveredIcon === 'WISHLIST' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
              >
                WISHLIST
              </motion.div>
            )}
          </div>

          {/* Cart Icon */}
          <div className="relative">
            <Link 
              href="/cart" 
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary dark:text-[#E6C547] hover:transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 relative"
              onMouseEnter={() => setHoveredIcon('CART')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </Link>
            
            {/* Hover Tooltip */}
            {hoveredIcon === 'CART' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
              >
                CART
              </motion.div>
            )}
          </div>

          {/* Theme Toggle - Mobile */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* User Profile Icon with Dropdown */}
          <div className="relative">
            {isLoading ? (
              <button className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </button>
            ) : isAuthenticated ? (
              <button
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary dark:text-[#E6C547] hover:transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                onMouseEnter={() => setHoveredIcon('PROFILE')}
                onMouseLeave={() => setHoveredIcon(null)}
                onClick={() => handleDropdownToggle('PROFILE')}
              >
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </button>
            ) : (
              <button 
                onClick={() => openLoginModal()}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-primary dark:text-[#E6C547] hover:transform hover:-translate-y-1 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                onMouseEnter={() => setHoveredIcon('PROFILE')}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </button>
            )}
            
            {/* Hover Tooltip */}
            {hoveredIcon === 'PROFILE' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
              >
                PROFILE
              </motion.div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated && openDropdown === 'PROFILE' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
              >
                <div className="p-3">
                  <div className="flex items-center space-x-3 py-2 mb-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#4B006E] dark:text-[#E6C547]">Chilla</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <Link
                      href="/account/settings?tab=profile"
                      className="flex items-center space-x-3 py-2 text-sm text-[#4B006E] dark:text-[#E6C547] hover:text-[#D4AF37] dark:hover:text-[#E6C547]/80 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center space-x-3 py-2 text-sm text-[#4B006E] dark:text-[#E6C547] hover:text-[#D4AF37] dark:hover:text-[#E6C547]/80 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <FiShoppingBag className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/account/settings"
                      className="flex items-center space-x-3 py-2 text-sm text-[#4B006E] dark:text-[#E6C547] hover:text-[#D4AF37] dark:hover:text-[#E6C547]/80 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <button
                        className="flex items-center space-x-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors w-full"
                        onClick={async () => {
                          setOpenDropdown(null);
                          await logout();
                          // Redirect to home after logout
                          router.push('/');
                        }}
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Fixed at top when menu is open */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
           className="lg:hidden fixed top-12 sm:top-16 left-0 right-0 bg-[#470031] border-b border-[#470031] z-30 px-2 sm:px-4 py-2 sm:py-3"
        >
            <div className="flex items-center relative">
              <form onSubmit={handleSearch} className="relative w-full">
                 <FiSearch className="w-3 h-3 sm:w-4 sm:h-4 text-[#DBC078] absolute left-3 top-1/2 transform -translate-y-1/2" />
                 <input
                   type="text"
                   placeholder="Search"
                   value={searchInput}
                   onChange={handleSearchInputChange}
                   onFocus={handleSearchFocus}
                   onBlur={handleSearchBlur}
                   className="w-full pl-10 pr-4 py-2 text-sm border-b border-[#DBC078] focus:outline-none focus:border-[#cfb570] bg-transparent text-[#DBC078] placeholder-[#dcc996]"
                   suppressHydrationWarning
                 />
              </form>
              
              <SearchSuggestions
                searchTerm={searchInput}
                products={products}
                categories={categories}
                onSuggestionClick={handleSuggestionClick}
                onSearchAll={handleSearchAll}
                onClose={() => setShowSuggestions(false)}
                isVisible={showSuggestions && !isLoadingSuggestions}
              />
          </div>
        </motion.div>
      )}
    </header>
  );
}
