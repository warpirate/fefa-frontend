'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import { signInWithGoogle, signOutUser, setupRecaptcha, sendOTP as sendPhoneOTP, verifyOTP, sendEmailOTP, verifyEmailOTP } from '@/config/firebase';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  sendOTP: (phoneOrEmail: string) => Promise<any>;
  verifyOTPCode: (confirmationResult: any, code: string, phoneOrEmail: string) => Promise<void>;
  handleEmailOTPCallback?: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean; // For initial auth check only
  isOTPLoading: boolean; // Separate loading state for OTP operations
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: 'user' | 'admin' | 'super_admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial auth check
  const [isOTPLoading, setIsOTPLoading] = useState(false); // Separate state for OTP operations
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const { accessToken } = authService.getStoredTokens();
        if (accessToken) {
          // Verify token and get user profile
          const response = await authService.getProfile(accessToken);
          const userData = response.user;
          
          // Convert backend user data to frontend format
          const user: User = {
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            avatar: userData.profileImage,
            role: userData.role || 'user',
            isEmailVerified: true,
          };
          
          setUser(user);
          localStorage.setItem('fefa_user', JSON.stringify(user));
          
          // Ensure cookies are set for middleware
          const isProduction = process.env.NODE_ENV === 'production';
          const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
          document.cookie = `fefa_access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid tokens
        authService.clearTokens();
        localStorage.removeItem('fefa_user');
        
        // Clear cookies
        document.cookie = 'fefa_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'fefa_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Helper function to detect if input is phone or email
  const isPhoneNumber = (input: string): boolean => {
    // Remove all non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    // Check if it's a valid phone number (at least 10 digits, can have country code)
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  // Helper function to format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If it doesn't start with +, assume it's Indian number and add +91
    if (!phone.startsWith('+')) {
      // If it starts with 0, remove it
      const cleaned = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
      return `+91${cleaned}`;
    }
    
    return phone;
  };

  // Send OTP to phone or email
  const sendOTP = async (phoneOrEmail: string): Promise<any> => {
    try {
      setIsOTPLoading(true); // Use separate OTP loading state
      setError(null);

      const isPhone = isPhoneNumber(phoneOrEmail);
      
      if (isPhone) {
        // Phone OTP
        const formattedPhone = formatPhoneNumber(phoneOrEmail);
        
        console.log('Setting up reCAPTCHA for phone:', formattedPhone);
        
        // Setup reCAPTCHA verifier (this will ensure container exists)
        const recaptchaVerifier = await setupRecaptcha('recaptcha-container');
        
        console.log('reCAPTCHA verifier ready, sending OTP...');
        
        // Send OTP via SMS
        const confirmationResult = await sendPhoneOTP(formattedPhone, recaptchaVerifier);
        
        console.log('OTP sent successfully');
        console.log('Note: If you don\'t receive SMS, check:');
        console.log('1. Is this a test phone number configured in Firebase Console?');
        console.log('2. Is billing enabled in Firebase for production SMS?');
        console.log('3. Check spam/junk folder for SMS');
        
        return {
          type: 'phone',
          confirmationResult,
          phone: formattedPhone
        };
      } else {
        // Email OTP - use backend API
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(phoneOrEmail)) {
          throw new Error('Please enter a valid email address');
        }
        
        console.log('Sending email OTP via backend API to:', phoneOrEmail);
        const result = await authService.sendEmailOTP(phoneOrEmail);
        
        console.log('Email OTP sent successfully via backend');
        
        return {
          type: 'email',
          email: phoneOrEmail,
          message: 'OTP sent to your email. Please check your inbox for the 6-digit code.'
        };
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      let errorMessage = 'Failed to send OTP';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please enter a valid phone number with country code.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please enter a valid email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'Email quota exceeded. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This email address has been disabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsOTPLoading(false); // Use separate OTP loading state
    }
  };

  // Verify OTP code
  const verifyOTPCode = async (confirmationResult: any, code: string, phoneOrEmail: string): Promise<void> => {
    try {
      setIsOTPLoading(true); // Use separate OTP loading state
      setError(null);

      const isPhone = isPhoneNumber(phoneOrEmail);

      if (isPhone) {
        // Verify phone OTP via Firebase
        if (!confirmationResult) {
          throw new Error('OTP session expired. Please request a new OTP.');
        }
        
        let firebaseUser;
        let idToken: string;
        
        const result = await verifyOTP(confirmationResult, code);
        firebaseUser = result.user;
        idToken = await firebaseUser.getIdToken();

        // Verify with backend
        const formattedPhone = formatPhoneNumber(phoneOrEmail);
        const response = await authService.verifyOTP(idToken, formattedPhone, undefined);
        const userData = response.user;

        // Store tokens
        authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);

        // Also store in cookies for middleware access
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
        document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
        document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;

        // Convert backend user data to frontend format
        const user: User = {
          id: userData.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone,
          avatar: userData.profileImage,
          role: userData.role || 'user',
          isEmailVerified: true,
        };

        setUser(user);
        localStorage.setItem('fefa_user', JSON.stringify(user));
      } else {
        // Verify email OTP via backend API
        console.log('Verifying email OTP via backend API');
        const response = await authService.verifyEmailOTP(phoneOrEmail, code);
        const userData = response.user;

        // Store tokens
        authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);

        // Also store in cookies for middleware access
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
        document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
        document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;

        // Convert backend user data to frontend format
        const user: User = {
          id: userData.id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone,
          avatar: userData.profileImage,
          role: userData.role || 'user',
          isEmailVerified: true,
        };

        setUser(user);
        localStorage.setItem('fefa_user', JSON.stringify(user));
      }
    } catch (error: any) {
      let errorMessage = 'OTP verification failed';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new OTP.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many verification attempts. Please wait a few minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsOTPLoading(false); // Use separate OTP loading state
    }
  };

  // Handle email OTP callback (when user clicks link in email)
  const handleEmailOTPCallback = async (email: string): Promise<void> => {
    try {
      setIsOTPLoading(true); // Use separate OTP loading state
      setError(null);

      const result = await verifyEmailOTP(email);
      const idToken = await result.user.getIdToken();

      // Verify with backend
      const response = await authService.verifyOTP(idToken, undefined, email);
      const userData = response.user;

      // Store tokens
      authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);

      // Also store in cookies
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
      document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
      document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;

      // Convert backend user data to frontend format
      const user: User = {
        id: userData.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone,
        avatar: userData.profileImage,
        role: userData.role || 'user',
        isEmailVerified: true,
      };

      setUser(user);
      localStorage.setItem('fefa_user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Email OTP callback error:', error);
      
      let errorMessage = 'Email verification failed';
      
      if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid or expired verification link. Please request a new OTP.';
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage = 'The verification link has expired. Please request a new OTP.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please try again.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This email address has been disabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsOTPLoading(false); // Use separate OTP loading state
    }
  };

  // Login with email and password
  const loginWithPassword = async (email: string, password: string): Promise<void> => {
    try {
      setIsOTPLoading(true); // Use separate OTP loading state
      setError(null);

      console.log('Logging in with email and password');

      // Call backend API to login
      const response = await authService.login(email, password);
      const userData = response.user;

      // Store tokens
      authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);

      // Also store in cookies for middleware access
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
      document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
      document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;

      // Convert backend user data to frontend format
      const user: User = {
        id: userData.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone,
        avatar: userData.profileImage,
        role: userData.role || 'user',
        isEmailVerified: true,
      };

      setUser(user);
      localStorage.setItem('fefa_user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Password login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Too many')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsOTPLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsOTPLoading(true); // Use separate OTP loading state instead of global isLoading
      setError(null);
      
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      
      // Verify the token with our backend
      const response = await authService.verifyGoogleToken(idToken);
      const userData = response.user;
      
      // Store tokens in localStorage and cookies
      authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
      
      // Also store in cookies for middleware access
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
      document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
      document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;
      
      // Convert backend user data to frontend format
      const user: User = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.profileImage,
        role: userData.role || 'user',
        isEmailVerified: true,
      };
      
      setUser(user);
      localStorage.setItem('fefa_user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Google authentication failed';
      
      if (error.message?.includes('Too many authentication attempts')) {
        errorMessage = 'Too many Google login attempts. Please wait 15 minutes before trying again.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.message?.includes('non-JSON response')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('popup_closed_by_user')) {
        errorMessage = 'Google sign-in was cancelled. Please try again.';
      } else if (error.message?.includes('access_denied')) {
        errorMessage = 'Google sign-in was denied. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsOTPLoading(false); // Use separate OTP loading state
    }
  };

  const logout = async () => {
    try {
      const { accessToken, refreshToken } = authService.getStoredTokens();
      
      if (accessToken) {
        await authService.logout(accessToken, refreshToken);
      }
      
      // Also sign out from Firebase
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      authService.clearTokens();
      
      // Clear cookies
      document.cookie = 'fefa_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'fefa_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Role checking functions
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const hasRole = (role: 'user' | 'admin' | 'super_admin') => user?.role === role;

  const value = {
    user,
    isAuthenticated: !!user,
    sendOTP,
    verifyOTPCode,
    handleEmailOTPCallback,
    loginWithGoogle,
    loginWithPassword,
    logout,
    isLoading, // For initial auth check
    isOTPLoading, // For OTP operations
    error,
    clearError,
    isAdmin,
    isSuperAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
