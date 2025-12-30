'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import LoginModal from '@/components/auth/LoginModal';
import { useLoginModal } from '@/contexts/LoginModalContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isLoginOpen, closeLoginModal, redirectTo } = useLoginModal();

  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="lg:min-h-screen pt-20 bg-white dark:bg-[#0a0a0a] transition-colors duration-300"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} redirectTo={redirectTo} />
    </>
  );
}
