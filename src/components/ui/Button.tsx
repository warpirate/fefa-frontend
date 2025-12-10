'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import '@/styles/components/ui/Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-accent hover:bg-accent/90 text-white',
    outline: 'border-2 border-primary hover:bg-primary/10 text-primary',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  const buttonContent = (
    <motion.span
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-center"
    >
      {children}
    </motion.span>
  );
  
  if (href) {
    return (
      <Link href={href} className={allClasses}>
        {buttonContent}
      </Link>
    );
  }
  
  return (
    <button className={allClasses} {...props}>
      {buttonContent}
    </button>
  );
}
