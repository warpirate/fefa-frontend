'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import '@/styles/components/ui/ThemeToggle.css';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="theme-toggle-container">
        <div className="theme-toggle-track" />
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        className={`theme-toggle-track ${isDark ? 'dark' : ''}`}
        animate={{
          backgroundColor: isDark ? '#6B1A7A' : '#E5E7EB',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.div
          className="theme-toggle-thumb"
          animate={{
            x: isDark ? 24 : 2,
            backgroundColor: isDark ? '#E6C547' : '#FFFFFF',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {isDark ? (
            <motion.div
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <FiMoon className="theme-toggle-icon" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <FiSun className="theme-toggle-icon" />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </button>
  );
}

