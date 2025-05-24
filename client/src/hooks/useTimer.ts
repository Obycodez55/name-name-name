import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime?: number;
  interval?: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  stop: () => void;
  setTime: (time: number) => void;
}

export const useTimer = ({
  initialTime = 0,
  interval = 1000,
  onComplete,
  onTick,
  autoStart = false
}: UseTimerOptions = {}): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          
          // Call onTick callback
          if (onTickRef.current) {
            onTickRef.current(newTime);
          }
          
          // Check if timer completed
          if (newTime <= 0) {
            setIsActive(false);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
          
          return newTime;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft, interval]);

  const start = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTimeLeft(newTime ?? initialTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(0);
  }, []);

  const setTime = useCallback((time: number) => {
    setTimeLeft(time);
  }, []);

  return {
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    reset,
    stop,
    setTime
  };
};
