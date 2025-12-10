'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/services/authService';
import { signInWithGoogle, signOutUser } from '@/config/firebase';

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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: 'user' | 'admin' | 'super_admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
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
      // Provide more specific error messages for rate limiting
      let errorMessage = 'Login failed';
      
      if (error.message?.includes('Too many authentication attempts')) {
        errorMessage = 'Too many login attempts. Please wait 15 minutes before trying again.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      const userResponse = response.user;
      
      // Store tokens in localStorage and cookies
      authService.storeTokens(response.tokens.accessToken, response.tokens.refreshToken);
      
      // Also store in cookies for middleware access
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction ? 'secure; samesite=strict' : 'samesite=lax';
      document.cookie = `fefa_access_token=${response.tokens.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; ${cookieOptions}`;
      document.cookie = `fefa_refresh_token=${response.tokens.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; ${cookieOptions}`;
      
      // Convert backend user data to frontend format
      const user: User = {
        id: userResponse.id,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        email: userResponse.email,
        phone: userResponse.phone,
        avatar: userResponse.profileImage,
        role: userResponse.role || 'user',
        isEmailVerified: true,
      };
      
      setUser(user);
      localStorage.setItem('fefa_user', JSON.stringify(user));
    } catch (error: any) {
      // Provide more specific error messages for rate limiting
      let errorMessage = 'Registration failed';
      
      if (error.message?.includes('Too many authentication attempts')) {
        errorMessage = 'Too many registration attempts. Please wait 15 minutes before trying again.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      } else if (error.message?.includes('Email already exists') || error.message?.includes('User already exists')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
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
    login,
    register,
    loginWithGoogle,
    logout,
    isLoading,
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
