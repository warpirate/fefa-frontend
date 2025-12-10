'use client';

import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import '@/styles/components/auth/Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    icon, 
    isPassword = false, 
    showPassword = false, 
    onTogglePassword,
    className = '',
    ...props 
  }, ref) => {
    return (
      <div className="form-field">
        {label && (
          <label htmlFor={props.id} className="form-label">
            {label}
          </label>
        )}
        
        <div className="input-container">
          {icon && <div className="input-icon">{icon}</div>}
          
          <input
            ref={ref}
            type={isPassword && !showPassword ? 'password' : 'text'}
            className={`form-input ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
          
          {isPassword && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="password-toggle"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
