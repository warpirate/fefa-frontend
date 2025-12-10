// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCs464lZD3J4MTPbTxKkpYXHisTAyOCLHk",
  authDomain: "fefa-jewelry-auth.firebaseapp.com",
  databaseURL: "https://fefa-jewelry-auth.firebaseio.com",
  projectId: "fefa-jewelry-auth",
  storageBucket: "fefa-jewelry-auth.firebasestorage.app",
  messagingSenderId: "673066816766",
  appId: "1:673066816766:web:03e31d8572f9c02a24c1af",
  measurementId: "G-KF6L5QEQ30"
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

export default app;