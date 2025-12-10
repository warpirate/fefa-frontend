'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiUser, FiSettings, FiLogOut, FiHeart, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/components/auth/UserDropdown.css';

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-button"
      >
        <div className="user-avatar">
          <FiUser className="w-5 h-5" />
        </div>
        <span className="user-name">
          {user.firstName}
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="user-dropdown"
          >
            {/* Menu Items */}
            <div className="dropdown-menu">
              <Link
                href="/account/settings?tab=profile"
                className="dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              
              <Link
                href="/account/orders"
                className="dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <FiShoppingBag className="w-4 h-4" />
                <span>My Orders</span>
              </Link>
              
              
              <Link
                href="/account/settings"
                className="dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              
              {/* Divider */}
              <div className="dropdown-divider" />
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="dropdown-item logout-item"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
