'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import authService from '@/services/authService';
import '@/styles/components/auth/ForgotPassword.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.requestPasswordReset(email);
      setIsSuccess(true);
      // Store reset token for development testing
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsSuccess(false);
    setEmail('');
    setError('');
    setResetToken('');
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-container">
        {/* Background decorative elements */}
        <div className="forgot-password-background">
          <div className="forgot-password-bg-circle-1"></div>
          <div className="forgot-password-bg-circle-2"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="forgot-password-card"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="success-icon-container"
            >
              <FiCheckCircle className="success-icon" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="forgot-password-title">Check Your Email</h1>
              <p className="forgot-password-subtitle">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="forgot-password-instructions">
                Please check your email and click the link to reset your password. 
                If you don't see the email, check your spam folder.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="forgot-password-button"
                onClick={handleBackToLogin}
              >
                <div className="flex items-center justify-center">
                  <FiArrowLeft className="mr-2 w-5 h-5" />
                  <span>Back to Login</span>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="resend-button"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                  setResetToken('');
                }}
              >
                <div className="flex items-center justify-center">
                  <FiMail className="mr-2 w-5 h-5" />
                  <span>Send to Different Email</span>
                </div>
              </Button>
            </motion.div>

            {/* Development Reset Link */}
            {resetToken && process.env.NODE_ENV === 'development' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  Development Mode - Reset Link:
                </h4>
                <p className="text-xs text-yellow-700 mb-2 break-all">
                  {`${window.location.origin}/auth/reset-password?token=${resetToken}`}
                </p>
                <button
                  onClick={() => {
                    window.open(`/auth/reset-password?token=${resetToken}`, '_blank');
                  }}
                  className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                >
                  Open Reset Page
                </button>
              </motion.div>
            )}

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-center mt-6"
            >
              <div className="forgot-password-help">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setResetToken('');
                  }}
                  className="resend-link"
                >
                  Resend
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      {/* Background decorative elements */}
      <div className="forgot-password-background">
        <div className="forgot-password-bg-circle-1"></div>
        <div className="forgot-password-bg-circle-2"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Forgot Password Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="forgot-password-card"
        >
          {/* Header */}
          <div className="forgot-password-header">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h1 className="forgot-password-title">Forgot Password?</h1>
              <p className="forgot-password-subtitle">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </motion.div>
          </div>

          {/* Forgot Password Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  className={`form-input ${error ? 'input-error' : ''}`}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="error-message"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                className="forgot-password-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner"></div>
                    <span className="ml-2">Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Send Reset Link</span>
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Back to Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-8"
          >
            <div className="forgot-password-help">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="back-to-login-link"
              >
                <div className="flex items-center justify-center">
                  <FiArrowLeft className="mr-1 w-4 h-4" />
                  <span>Back to Login</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
