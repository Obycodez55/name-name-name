import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@utils/helpers';
import Input from '@components/ui/Input';

interface AnswerInputProps {
  category: string;
  letter: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string;
  isValid?: boolean;
  placeholder?: string;
  className?: string;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  category,
  letter,
  value,
  onChange,
  onSubmit,
  disabled = false,
  error,
  isValid,
  placeholder,
  className
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
      setIsTyping(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsTyping(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  const getValidationIcon = () => {
    if (isTyping) return null;
    if (error) return <X className="text-red-500" size={16} />;
    if (isValid) return <Check className="text-green-500" size={16} />;
    if (localValue.trim() && !localValue.toLowerCase().startsWith(letter.toLowerCase())) {
      return <AlertCircle className="text-yellow-500" size={16} />;
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      animals: 'border-l-red-500',
      foods: 'border-l-orange-500',
      places: 'border-l-yellow-500',
      movies: 'border-l-green-500',
      books: 'border-l-cyan-500',
      sports: 'border-l-blue-500',
      colors: 'border-l-purple-500',
      brands: 'border-l-pink-500',
      people: 'border-l-amber-500',
      objects: 'border-l-emerald-500',
    };
    
    return colors[category.toLowerCase() as keyof typeof colors] || 'border-l-gray-500';
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        'p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-800',
        getCategoryColor(category)
      )}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
            {category}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Starts with "{letter.toUpperCase()}"
            </span>
            {getValidationIcon()}
          </div>
        </div>
        
        <Input
          value={localValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          error={error}
          placeholder={placeholder || `Enter a ${category.toLowerCase()} starting with "${letter.toUpperCase()}"`}
          className="w-full"
          fullWidth
        />
      </div>
    </motion.div>
  );
};

export default AnswerInput;