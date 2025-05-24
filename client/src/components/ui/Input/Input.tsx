import React from 'react';
import { cn } from '@utils/helpers';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  helpText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    icon, 
    iconPosition = 'left',
    fullWidth = false,
    helpText,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    
    const inputClasses = cn(
      hasError ? 'form-input-error' : 'form-input',
      icon && iconPosition === 'left' && 'pl-10',
      icon && iconPosition === 'right' && 'pr-10',
      fullWidth ? 'w-full' : '',
      className
    );

    const iconClasses = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
      iconPosition === 'left' ? 'left-3' : 'right-3'
    );

    return (
      <div className={cn('form-group', fullWidth ? 'w-full' : '')}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {icon && (
            <div className={iconClasses}>
              {icon}
            </div>
          )}
        </div>
        {error && (
          <motion.p 
            className="form-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;