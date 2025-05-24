import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Twitter, Mail, Info } from 'lucide-react';
import { cn } from '@utils/helpers';

interface FooterProps {
  className?: string;
  showSocials?: boolean;
  showVersion?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  className,
  showSocials = true,
  showVersion = true
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto',
      className
    )}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Description */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">N³</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                Name! Name!! Name!!!
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              The fast-paced multiplayer word association game that brings friends together.
            </p>
          </div>

          {/* Social Links */}
          {showSocials && (
            <div className="flex items-center gap-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="GitHub"
              >
                <Github size={20} />
              </motion.a>
              
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </motion.a>
              
              <motion.a
                href="mailto:contact@example.com"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Email"
              >
                <Mail size={20} />
              </motion.a>
            </div>
          )}

          {/* Copyright and Version */}
          <div className="text-center md:text-right">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 justify-center md:justify-end mb-1">
              <span>Made with</span>
              <Heart size={14} className="text-red-500" />
              <span>by the N³ Team</span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              <span>&copy; {currentYear} Name! Name!! Name!!!. All rights reserved.</span>
              {showVersion && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Info size={12} />
                  v1.0.0
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <motion.a
              href="/privacy"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Privacy Policy
            </motion.a>
            
            <motion.a
              href="/terms"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Terms of Service
            </motion.a>
            
            <motion.a
              href="/support"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Support
            </motion.a>
            
            <motion.a
              href="/about"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              About
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;