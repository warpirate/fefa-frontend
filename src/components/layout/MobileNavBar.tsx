'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiHeart, FiShoppingBag, FiGift, FiHome, FiGrid, FiSettings, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLoginModal } from '@/contexts/LoginModalContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

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

export default function MobileNavBar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { totalQuantity } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { openLoginModal } = useLoginModal();

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="lg:hidden fixed bottom-3 sm:bottom-4 md:bottom-5 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl sm:rounded-3xl md:rounded-[1.75rem] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 shadow-lg border border-gray-200 dark:border-gray-700 min-w-[280px] sm:min-w-[350px] md:min-w-[420px] max-w-[95vw]">
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
  );
}
