import React from 'react';
import { motion } from 'framer-motion';
import Header from '../Header';
import { cn } from '@utils/helpers';

export interface LayoutProps {
  children: React.ReactNode;
  headerProps?: React.ComponentProps<typeof Header>;
  showHeader?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  headerProps,
  showHeader = true,
  className
}) => {
  return (
    <div className={cn('page-container', className)}>
      {showHeader && <Header {...headerProps} />}
      
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;