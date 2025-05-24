import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/helpers';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'btn focus-ring';
    
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary', 
      success: 'btn-success',
      danger: 'btn-danger',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
    };
    
    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg'
    };

    const widthClasses = fullWidth ? 'w-full' : '';
    
    const combinedClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClasses,
      loading ? 'opacity-75 cursor-wait' : '',
      className
    );

    const iconElement = icon && (
      <span className={cn(
        'flex items-center',
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
      )}>
        {icon}
      </span>
    );

    const loadingSpinner = (
      <svg 
        className={cn(
          'animate-spin',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
          fill="none"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <motion.button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props as Omit<HTMLMotionProps<"button">, "ref">}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && loadingSpinner}
          {!loading && icon && iconPosition === 'left' && iconElement}
          <span>{children}</span>
          {!loading && icon && iconPosition === 'right' && iconElement}
        </div>
      </motion.button>  
    );
  }
);

Button.displayName = 'Button';

export default Button;
