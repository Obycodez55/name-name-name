import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';

interface LetterDisplayProps {
  letter?: string;
  isRevealing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LetterDisplay: React.FC<LetterDisplayProps> = ({
  letter,
  isRevealing = false,
  size = 'lg',
  className
}) => {
  const sizeClasses = {
    sm: 'text-4xl p-6',
    md: 'text-6xl p-8', 
    lg: 'text-8xl p-12'
  };

  if (!letter) {
    return (
      <div className={cn('card flex items-center justify-center', sizeClasses[size], className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Waiting for letter...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'card flex items-center justify-center relative overflow-hidden',
        sizeClasses[size],
        className
      )}
      initial={isRevealing ? { scale: 0, rotate: -180 } : { scale: 1 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        duration: isRevealing ? 1 : 0
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
      </div>
      
      {/* Letter */}
      <motion.div
        className="letter-display relative z-10"
        initial={isRevealing ? { opacity: 0, y: 50 } : { opacity: 1 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isRevealing ? 0.5 : 0 }}
      >
        {letter}
      </motion.div>
      
      {/* Reveal effect */}
      {isRevealing && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <div className="text-2xl font-bold text-white">
              Letter Revealed!
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default LetterDisplay;
// This component displays a letter with an optional reveal animation.