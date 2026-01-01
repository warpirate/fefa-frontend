'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiPhone, FiArrowRight, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { MdClose as Close } from 'react-icons/md';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/components/auth/Login.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
  const router = useRouter();
  const { user, sendOTP, verifyOTPCode, loginWithGoogle, loginWithPassword, isLoading: authIsLoading, isOTPLoading, error, clearError, hasRole } = useAuth();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false); // Toggle between OTP and password
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpType, setOtpType] = useState<'phone' | 'email' | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Create reCAPTCHA container in document body on component mount
  // This container is required by Firebase for phone authentication (invisible reCAPTCHA)
  // Note: Container is also ensured in firebase.ts, but we create it early here for better UX
  useEffect(() => {
    // Create container in document body if it doesn't exist
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'recaptcha-container';
      container.style.position = 'absolute';
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
    }
    
    // Don't remove container on unmount - Firebase might still need it
    // It will be cleaned up by firebase.ts when verifier is cleared
  }, []);

  // Reset form when modal opens (but not when OTP is sent)
  useEffect(() => {
    if (isOpen && !otpSent) {
      // Only reset if modal just opened and OTP hasn't been sent yet
      setPhoneOrEmail('');
      setPassword('');
      setOtpCode(['', '', '', '', '', '']);
      setConfirmationResult(null);
      setOtpType(null);
      setResendTimer(0);
      setUsePassword(false); // Reset to OTP mode by default
      setShowPassword(false);
      setErrors({});
      clearError();
    }
  }, [isOpen]); // Removed clearError and otpSent from dependencies to prevent reset after OTP is sent

  // Handle role-based redirection after successful login
  useEffect(() => {
    if (user && !authIsLoading && !isOTPLoading && isOpen) {
      if (hasRole('admin') || hasRole('super_admin')) {
        onClose();
        router.push('/admin');
      } else if (hasRole('user')) {
        onClose();
        router.push(redirectTo || '/');
      }
    }
  }, [user, authIsLoading, isOTPLoading, router, hasRole, redirectTo, isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);


  const isPhoneNumber = (input: string): boolean => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const handlePhoneOrEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneOrEmail(value);
    if (errors.phoneOrEmail) {
      setErrors(prev => ({ ...prev, phoneOrEmail: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6);
      const newOtpCode = [...otpCode];
      for (let i = 0; i < 6; i++) {
        if (i < pastedValue.length) {
          newOtpCode[i] = pastedValue[i];
        }
      }
      setOtpCode(newOtpCode);
      // Focus last filled input
      const lastFilledIndex = Math.min(5, pastedValue.length - 1);
      otpInputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Clear errors
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const validatePhoneOrEmail = () => {
    if (!phoneOrEmail.trim()) {
      setErrors({ phoneOrEmail: 'Please enter your phone number or email' });
      return false;
    }

    const isPhone = isPhoneNumber(phoneOrEmail);
    if (!isPhone) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(phoneOrEmail)) {
        setErrors({ phoneOrEmail: 'Please enter a valid phone number or email address' });
        return false;
      }
    }

    return true;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!validatePhoneOrEmail()) return;

    setErrors({});
    clearError();

    try {
      const result = await sendOTP(phoneOrEmail);
      setOtpSent(true);
      setOtpType(result.type);
      
      if (result.type === 'phone') {
        setConfirmationResult(result.confirmationResult);
      } else {
        // For email, show message
        setErrors({ emailMessage: result.message || 'OTP sent to your email. Please check your inbox and click the link.' });
      }
      
      setResendTimer(60); // 60 seconds cooldown
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      // Display error to user
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX).';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (error.message?.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA error. Please refresh the page and try again.';
      }
      
      setErrors({ phoneOrEmail: errorMessage });
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setErrors({});
      clearError();
      
      const result = await sendOTP(phoneOrEmail);
      
      if (result.type === 'phone') {
        setConfirmationResult(result.confirmationResult);
        setOtpSent(true);
        setOtpType('phone');
      } else {
        // For email, show success message
        setOtpSent(true);
        setOtpType('email');
        // Don't set emailMessage in errors, let the UI component handle it
      }
      
      setResendTimer(60); // 60 seconds cooldown
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      if (otpType === 'email') {
        setErrors({ emailMessage: error.message || 'Failed to resend email. Please try again.' });
      } else {
        setErrors({ phoneOrEmail: error.message || 'Failed to resend OTP. Please try again.' });
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = otpCode.join('');
    if (code.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return;
    }

    // For phone OTP, confirmationResult is required
    // For email OTP, we don't need confirmationResult - it's handled via backend API
    if (otpType === 'phone' && !confirmationResult) {
      setErrors({ otp: 'OTP session expired. Please request a new OTP.' });
      return;
    }

    try {
      // For email OTP, pass null as confirmationResult (it's not used)
      // For phone OTP, pass the actual confirmationResult
      await verifyOTPCode(otpType === 'phone' ? confirmationResult : null, code, phoneOrEmail);
      // Role-based redirection will be handled by useEffect after user state updates
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setErrors({ otp: error.message || 'OTP verification failed. Please try again.' });
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phoneOrEmail || !emailRegex.test(phoneOrEmail)) {
      setErrors({ phoneOrEmail: 'Please enter a valid email address' });
      return;
    }

    if (!password || password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    setErrors({});
    clearError();

    try {
      await loginWithPassword(phoneOrEmail, password);
      // Role-based redirection will be handled by useEffect after user state updates
    } catch (error: any) {
      console.error('Password login error:', error);
      setErrors({ password: error.message || 'Login failed. Please check your email and password.' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setConfirmationResult(null);
    setOtpType(null);
    setResendTimer(0);
    setErrors({});
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="relative w-full max-w-[98vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl transform overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xl flex flex-col lg:flex-row min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] max-h-[98vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-20 lg:text-white lg:hover:text-pink-200 bg-white/80 lg:bg-transparent rounded-full p-1.5 lg:p-0 backdrop-blur-sm lg:backdrop-blur-none"
            aria-label="Close login modal"
          >
            <Close className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>

          {/* Left Side - Visual Area */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#4B006E] via-[#6B1A7A] to-[#4B006E] relative overflow-hidden items-center justify-center p-10 rounded-l-2xl">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Animated elements - same as before */}
              <motion.div
                initial={{ opacity: 0, scale: 0, y: -20 }}
                animate={{ opacity: 0.4, scale: 1, y: [0, -10, 0] }}
                transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-10 left-10 w-10 h-10 text-pink-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </motion.div>
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                className="mb-6"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="text-6xl mb-4"
                >
                  💎
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-3xl font-script text-white mb-2"
                >
                  Welcome to FEFA
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-pink-100 text-sm"
                >
                  {otpSent && otpType === 'phone' ? 'Enter the OTP sent to you' : otpSent && otpType === 'email' ? 'Check Your Email' : 'Login with phone or email'}
                </motion.p>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Form Area */}
          <div className="w-full lg:w-1/2 bg-white p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center rounded-r-lg sm:rounded-r-2xl">
            <div className="max-w-sm mx-auto w-full">
            {/* Header */}
            <div className="mb-3 sm:mb-4">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg sm:text-xl md:text-2xl font-serif text-gray-800 mb-1"
              >
                  {otpSent ? 'Enter OTP' : 'Welcome Back'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-600 text-xs sm:text-sm"
              >
                  {otpSent 
                    ? `Enter the 6-digit code sent to ${phoneOrEmail}`
                    : 'Enter your phone number or email to continue'}
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-4 text-xs"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}

              {/* Email OTP Success Message */}
              {otpSent && otpType === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-300 text-blue-700 px-3 py-2 rounded-lg mb-4 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>6-digit OTP sent to <strong>{phoneOrEmail}</strong>. Please check your inbox (including spam folder).</span>
                  </div>
                </motion.div>
              )}

              {/* reCAPTCHA Container is created in document body via useEffect */}

              {!otpSent ? (
                /* Phone/Email Input Form or Password Login Form */
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
                  onSubmit={usePassword ? handlePasswordLogin : handleSendOTP}
              className="space-y-2.5 sm:space-y-3"
            >
              {/* Toggle between OTP and Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mb-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(false);
                    setPassword('');
                    setErrors({});
                    clearError();
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    !usePassword
                      ? 'bg-primary text-white font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  OTP Login
                </button>
                <span className="text-gray-400 text-xs">or</span>
                <button
                  type="button"
                  onClick={() => {
                    setUsePassword(true);
                    setOtpSent(false);
                    setErrors({});
                    clearError();
                  }}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    usePassword
                      ? 'bg-primary text-white font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Password Login
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
              >
                <motion.label 
                      htmlFor="phone-or-email" 
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                  whileHover={{ scale: 1.02 }}
                >
                      {usePassword ? 'Email' : 'Phone Number or Email'}
                </motion.label>
                <div className="relative">
                      {!usePassword && isPhoneNumber(phoneOrEmail) ? (
                        <FiPhone className="absolute left-3 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-3.5 sm:h-3.5 pointer-events-none z-10" />
                      ) : (
                  <FiMail className="absolute left-3 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-3.5 sm:h-3.5 pointer-events-none z-10" />
                      )}
                  <motion.input
                        type="text"
                        id="phone-or-email"
                        value={phoneOrEmail}
                        onChange={handlePhoneOrEmailChange}
                    whileFocus={{ scale: 1.01 }}
                        className={`w-full pl-9 sm:pl-8 pr-3 py-2.5 sm:py-2 text-sm sm:text-xs bg-gray-50 border ${errors.phoneOrEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                        placeholder={usePassword ? "Enter your email" : "Enter phone number or email"}
                    required
                  />
                </div>
                    {errors.phoneOrEmail && (
                  <motion.p
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-red-600 text-[10px] sm:text-xs mt-1 flex items-center gap-1"
                  >
                    <span>⚠</span>
                        {errors.phoneOrEmail}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field (only shown when usePassword is true) */}
              {usePassword && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                >
                  <motion.label 
                    htmlFor="password" 
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
                    whileHover={{ scale: 1.02 }}
                  >
                    Password
                  </motion.label>
                  <div className="relative">
                    <FiLock className="absolute left-3 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-3.5 sm:h-3.5 pointer-events-none z-10" />
                    <motion.input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      whileFocus={{ scale: 1.01 }}
                      className={`w-full pl-9 sm:pl-8 pr-10 py-2.5 sm:py-2 text-sm sm:text-xs bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      ) : (
                        <FiEye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="text-red-600 text-[10px] sm:text-xs mt-1 flex items-center gap-1"
                    >
                      <span>⚠</span>
                      {errors.password}
                    </motion.p>
                  )}
                  {/* Forgot Password Link */}
                  <div className="mt-2 text-right">
                    <Link
                      href="/auth/forgot-password"
                      onClick={onClose}
                      className="text-xs text-primary hover:text-accent transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-xs font-medium py-3 sm:py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isOTPLoading || authIsLoading}
                  >
                        {isOTPLoading || authIsLoading ? (
                      <motion.div 
                        className="flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                            <span>{usePassword ? 'Logging in...' : 'Sending OTP...'}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center justify-center"
                        whileHover={{ x: 3 }}
                      >
                            <span>{usePassword ? 'Login' : 'Send OTP'}</span>
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FiArrowRight className="ml-2 w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
              ) : (
                /* OTP Verification Form */
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-2.5 sm:space-y-3"
                >
                  {(otpType === 'phone' || otpType === 'email') && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                        className="space-y-2"
                      >
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Enter 6-digit OTP
                        </label>
                        <div className="flex gap-2 justify-center">
                          {otpCode.map((digit, index) => (
                            <motion.input
                              key={index}
                              ref={(el) => { otpInputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOTPChange(index, e.target.value)}
                              onKeyDown={(e) => handleOTPKeyDown(index, e)}
                              whileFocus={{ scale: 1.1 }}
                              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                          ))}
                        </div>
                        {errors.otp && (
                          <motion.p
                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="text-red-600 text-[10px] sm:text-xs mt-1 flex items-center gap-1 text-center justify-center"
                          >
                            <span>⚠</span>
                            {errors.otp}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center"
                      >
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={resendTimer > 0}
                          className="text-[10px] text-primary hover:text-accent transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-xs font-medium py-3 sm:py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={authIsLoading || otpCode.join('').length !== 6}
                          >
                            {authIsLoading ? (
                              <motion.div 
                                className="flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <motion.div 
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <span>Verifying...</span>
                              </motion.div>
                            ) : (
                              'Verify OTP'
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-center"
                      >
                        <button
                          type="button"
                          onClick={handleBack}
                          className="text-[10px] text-gray-600 hover:text-primary transition-colors"
                        >
                          ← Change phone number
                        </button>
                      </motion.div>
                    </>
                  )}
                </motion.form>
              )}

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative my-3"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </motion.div>

              {/* Google Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  fullWidth
                  className="bg-white border-2 border-gray-300 text-gray-700 text-xs hover:bg-gray-50 hover:border-gray-400 py-2.5 sm:py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={handleGoogleLogin}
                    disabled={authIsLoading || isOTPLoading}
                >
                  <motion.div 
                    className="flex items-center justify-center"
                    whileHover={{ x: 2 }}
                  >
                    <motion.svg 
                      className="w-4 h-4 mr-2" 
                      viewBox="0 0 24 24"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </motion.svg>
                      {authIsLoading || isOTPLoading ? 'Connecting...' : 'Continue with Google'}
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
