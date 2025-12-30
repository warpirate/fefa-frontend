// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, ActionCodeSettings } from 'firebase/auth';

// Firebase configuration with environment variable support for production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCs464lZD3J4MTPbTxKkpYXHisTAyOCLHk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fefa-jewelry-auth.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://fefa-jewelry-auth.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fefa-jewelry-auth",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fefa-jewelry-auth.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "673066816766",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:673066816766:web:03e31d8572f9c02a24c1af",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KF6L5QEQ30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign Out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Ensure reCAPTCHA container exists in DOM
const ensureRecaptchaContainer = (elementId: string = 'recaptcha-container'): HTMLElement => {
  let container = document.getElementById(elementId);
  
  if (!container) {
    // Create container if it doesn't exist
    container = document.createElement('div');
    container.id = elementId;
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }
  
  return container;
};

// Phone Authentication Functions
export const setupRecaptcha = (elementId: string = 'recaptcha-container') => {
  // Ensure the container exists and is in DOM
  const container = ensureRecaptchaContainer(elementId);
  
  // Verify container is actually in the DOM
  if (!container.parentNode || container.parentNode !== document.body) {
    // Re-append if somehow removed
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    document.body.appendChild(container);
  }

  // Clear any existing verifier in the container
  const existingVerifier = (container as any).recaptchaVerifier;
  if (existingVerifier) {
    try {
      existingVerifier.clear();
    } catch (e) {
      // Ignore cleanup errors
    }
    (container as any).recaptchaVerifier = null;
  }

  // Create verifier with proper error handling
  return new Promise<RecaptchaVerifier>((resolve, reject) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Double-check container is still in DOM
      const containerCheck = document.getElementById(elementId);
      if (!containerCheck || !containerCheck.parentNode) {
        reject(new Error('reCAPTCHA container was removed from DOM'));
        return;
      }

      try {
        // Note: Firebase may show a warning about Enterprise config failing
        // This is normal - it will automatically fall back to reCAPTCHA v2
        const verifier = new RecaptchaVerifier(auth, elementId, {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow phone sign-in
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            // Response expired, ask user to solve reCAPTCHA again
            console.warn('reCAPTCHA expired');
          }
        });

        // Store verifier reference for cleanup
        (containerCheck as any).recaptchaVerifier = verifier;
        
        console.log('reCAPTCHA verifier created successfully');
        resolve(verifier);
      } catch (error: any) {
        console.error('Error creating reCAPTCHA verifier:', error);
        // Provide more helpful error messages
        if (error.message && error.message.includes('removed')) {
          reject(new Error('reCAPTCHA container not found. Please refresh the page and try again.'));
        } else if (error.code === 'auth/argument-error') {
          reject(new Error('Invalid reCAPTCHA configuration. Please refresh the page.'));
        } else if (error.message) {
          reject(new Error(`reCAPTCHA error: ${error.message}`));
        } else {
          reject(new Error('Failed to initialize reCAPTCHA. Please refresh the page and try again.'));
        }
      }
    });
  });
};

export const sendOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    console.log('Firebase: Attempting to send OTP to:', phoneNumber);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    console.log('Firebase: OTP request accepted, confirmation result received');
    return confirmationResult;
  } catch (error: any) {
    console.error('Firebase Error sending OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format. Please use format: +91XXXXXXXXXX');
    } else if (error.code === 'auth/missing-phone-number') {
      throw new Error('Phone number is required');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('SMS quota exceeded. Please try again later or use a test phone number.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This phone number has been disabled. Please contact support.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Phone authentication is not enabled. Please contact support.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to send OTP. Please check your phone number and try again.');
    }
  }
};

export const verifyOTP = async (confirmationResult: any, code: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Email OTP Functions
export const sendEmailOTP = async (email: string) => {
  try {
    // Get the callback URL - use environment variable in production, fallback to current origin
    const callbackUrl = process.env.NEXT_PUBLIC_EMAIL_CALLBACK_URL || window.location.origin + '/auth/callback';
    
    const actionCodeSettings: ActionCodeSettings = {
      url: callbackUrl,
      handleCodeInApp: true,
      // iOS bundle ID (if you have an iOS app)
      // iOSBundleId: 'com.fefa.jewelry',
      // Android package name (if you have an Android app)
      // androidPackageName: 'com.fefa.jewelry',
      // Android install app flag
      // androidInstallApp: true,
      // Android minimum version
      // androidMinimumVersion: '12',
    };
    
    console.log('Sending email OTP to:', email);
    console.log('Callback URL:', callbackUrl);
    console.log('Action code settings:', JSON.stringify(actionCodeSettings, null, 2));
    
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Store email in localStorage for verification
    window.localStorage.setItem('emailForSignIn', email);
    
    console.log('Email OTP sent successfully');
    console.log('Note: Email may take a few minutes to arrive. Check spam/junk folder if not in inbox.');
    console.log('Email will be sent from: noreply@' + firebaseConfig.projectId + '.firebaseapp.com');
    console.log('Troubleshooting:');
    console.log('1. Check Firebase Console -> Authentication -> Sign-in method -> Email/Password is enabled');
    console.log('2. Check authorized domains in Firebase Console');
    console.log('3. Verify email address is correct');
    console.log('4. Check spam/junk folder');
    
    return { success: true, message: 'OTP sent to your email. Please check your inbox and click the link.' };
  } catch (error: any) {
    console.error('Error sending email OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email OTP';
    
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please enter a valid email.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This email address has been disabled. Please contact support.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'Email quota exceeded. Please try again later.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const verifyEmailOTP = async (email: string) => {
  try {
    const currentUrl = window.location.href;
    console.log('Verifying email OTP with URL:', currentUrl);
    
    // Check if the link is a sign-in link
    if (!isSignInWithEmailLink(auth, currentUrl)) {
      throw new Error('Invalid or expired sign-in link. Please request a new OTP.');
    }
    
    // Get the email from localStorage or parameter
    let emailForSignIn = email || window.localStorage.getItem('emailForSignIn');
    
    if (!emailForSignIn) {
      throw new Error('Email not found. Please enter your email again and request a new OTP.');
    }
    
    console.log('Verifying email OTP for:', emailForSignIn);
    
    // Sign in with the email link
    const result = await signInWithEmailLink(auth, emailForSignIn, currentUrl);
    
    // Clear the email from localStorage after successful verification
    window.localStorage.removeItem('emailForSignIn');
    
    console.log('Email OTP verified successfully');
    return result;
  } catch (error: any) {
    console.error('Error verifying email OTP:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Clear email from localStorage on error to allow retry
    window.localStorage.removeItem('emailForSignIn');
    
    // Provide more specific error messages
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
    
    throw new Error(errorMessage);
  }
};

export default app;