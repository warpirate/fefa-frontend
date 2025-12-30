'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleEmailOTPCallback } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get email from localStorage (set when OTP was sent)
        const email = localStorage.getItem('emailForSignIn');
        
        if (!email) {
          setStatus('error');
          setErrorMessage('Email not found. Please try logging in again.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
          return;
        }

        console.log('Verifying email OTP for:', email);
        
        // Verify email OTP
        if (!handleEmailOTPCallback) {
          throw new Error('Email verification handler not available. Please refresh the page.');
        }
        
        await handleEmailOTPCallback(email);
        
        setStatus('success');
        
        // Redirect to home after successful verification
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        
        // Provide more specific error messages
        let errorMsg = 'Email verification failed. Please try again.';
        
        if (error.message) {
          errorMsg = error.message;
        } else if (error.code === 'auth/invalid-action-code') {
          errorMsg = 'Invalid or expired verification link. Please request a new OTP.';
        } else if (error.code === 'auth/expired-action-code') {
          errorMsg = 'The verification link has expired. Please request a new OTP.';
        }
        
        setErrorMessage(errorMsg);
        
        setTimeout(() => {
          router.push('/');
        }, 4000); // Give user more time to read the error
      }
    };

    verifyEmail();
  }, [handleEmailOTPCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#1F2937] rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Email verified successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecting you to the home page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Verification failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting you to the home page...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

