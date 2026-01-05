'use client';

import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail } from 'react-icons/fi';
import '@/styles/components/layout/Footer.css';

const footerLinks = {
  shop: [
    { name: 'Earrings', href: '/collections/earrings' },
    { name: 'Necklaces', href: '/collections/necklaces' },
    { name: 'Bangles', href: '/collections/bangles' },
    { name: 'Rings', href: '/collections/rings' },
    { name: 'Sets', href: '/collections/sets' },
    { name: 'Gifting', href: '/collections/gifting' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact Us', href: '/contact' },
  ],
  help: [
    { name: 'FAQs', href: '/faqs' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Size Guide', href: '/size-guide' },
  ],
  policies: [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
  ],
};

export default function Footer() {

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-3 xs:px-4 py-6 xs:py-8">
        {/* Footer Links */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 lg:gap-8 mb-6 xs:mb-8">
          <div>
            <h4 className="font-medium text-base xs:text-lg mb-3 xs:mb-4 text-accent">Shop</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent transition-colors text-sm xs:text-base">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-base xs:text-lg mb-3 xs:mb-4 text-accent">Company</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent transition-colors text-sm xs:text-base">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-base xs:text-lg mb-3 xs:mb-4 text-accent">Help</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent transition-colors text-sm xs:text-base">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-base xs:text-lg mb-3 xs:mb-4 text-accent">Policies</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent transition-colors text-sm xs:text-base">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/20 pt-4 xs:pt-6">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            <Link href="/" className="text-xl xs:text-2xl font-cormorant text-accent">FEFA</Link>
            <p className="mt-1 text-xs xs:text-sm opacity-80">A Celebration of Femininity</p>
          </div>
          <div className="flex space-x-2 xs:space-x-3 sm:space-x-4">
            <Link href="https://instagram.com" className="hover:text-accent transition-colors p-1.5 xs:p-2" aria-label="Instagram">
              <FiInstagram className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>
            <Link href="https://facebook.com" className="hover:text-accent transition-colors p-1.5 xs:p-2" aria-label="Facebook">
              <FiFacebook className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>
            <Link href="https://twitter.com" className="hover:text-accent transition-colors p-1.5 xs:p-2" aria-label="Twitter">
              <FiTwitter className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>
            <Link href="https://youtube.com" className="hover:text-accent transition-colors p-1.5 xs:p-2" aria-label="YouTube">
              <FiYoutube className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>
            <Link href="mailto:info@fefa.com" className="hover:text-accent transition-colors p-1.5 xs:p-2" aria-label="Email">
              <FiMail className="w-4 h-4 xs:w-5 xs:h-5" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs xs:text-sm mt-4 xs:mt-6 opacity-80">
          <p>&copy; {new Date().getFullYear()} FEFA Jewelry. All rights reserved.</p>
          <p className="mt-1">Designed with love for the modern woman.</p>
        </div>
      </div>
    </footer>
  );
}
