'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoginModalContextType {
  isLoginOpen: boolean;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
  redirectTo?: string;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const openLoginModal = (redirect?: string) => {
    setRedirectTo(redirect);
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
    setRedirectTo(undefined);
  };

  return (
    <LoginModalContext.Provider value={{ 
      isLoginOpen, 
      openLoginModal, 
      closeLoginModal, 
      redirectTo 
    }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}

