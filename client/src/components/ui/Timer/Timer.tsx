import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/helpers';
import { formatTime } from '@name-name-name/shared';

export interface TimerProps {
  seconds: number;
  isActive?: boolean;
  showProgress?: boolean;
  totalSeconds?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  onComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Timer: React.FC<TimerProps> = ({
  seconds,
  isActive = true,
  showProgress = false,
  totalSeconds = 180,
  warningThreshold = 30,
  criticalThreshold = 10,
  onComplete,
  className,
  size = 'md'
}) => {
  const isWarning = seconds <= warningThreshold && seconds > criticalThreshold;
  const isCritical = seconds <= criticalThreshold;
  
  React.useEffect(() => {
    if (seconds === 0 && onComplete) {
      onComplete();
    }
  }, [seconds, onComplete]);

  const getTimerClass = () => {
    if (isCritical) return 'timer-critical';
    if (isWarning) return 'timer-warning';
    return 'timer-display';
  };

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const progressPercentage = totalSeconds > 0 ? ((totalSeconds - seconds) / totalSeconds) * 100 : 0;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <motion.div
        className={cn(getTimerClass(), sizeClasses[size])}
        animate={{
          scale: isCritical && isActive ? [1, 1.1, 1] : 1,
          color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : undefined
        }}
        transition={{
          scale: { duration: 1, repeat: isCritical ? Infinity : 0 },
          color: { duration: 0.3 }
        }}
      >
        {formatTime(seconds)}
      </motion.div>
      
      {showProgress && (
        <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={cn(
              'h-2 rounded-full transition-colors duration-300',
              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      
      {isCritical && isActive && (
        <motion.p
          className="text-sm text-red-600 dark:text-red-400 font-medium"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          Time's almost up!
        </motion.p>
      )}
    </div>
  );
};

export default Timer;