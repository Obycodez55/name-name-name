import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  playSound: (soundName: string) => void;
  preloadSounds: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

const SOUND_FILES = {
  letterReveal: '/sounds/letter-reveal.mp3',
  timerTick: '/sounds/timer-tick.mp3',
  roundComplete: '/sounds/round-complete.mp3',
  gameComplete: '/sounds/game-complete.mp3',
  playerJoin: '/sounds/player-join.mp3',
  answerSubmit: '/sounds/answer-submit.mp3',
  notification: '/sounds/notification.mp3',
} as const;

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem('soundEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('soundVolume');
    return stored !== null ? parseFloat(stored) : 0.7;
  });

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const preloadSounds = () => {
    Object.entries(SOUND_FILES).forEach(([name, path]) => {
      if (!audioRefs.current[name]) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = volume;
        audioRefs.current[name] = audio;
      }
    });
  };

  const playSound = (soundName: string) => {
    if (!isEnabled || !audioRefs.current[soundName]) {
      return;
    }

    const audio = audioRefs.current[soundName];
    audio.volume = volume;
    audio.currentTime = 0;
    
    // Play with error handling
    audio.play().catch(error => {
      console.warn('Failed to play sound:', soundName, error);
    });
  };

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem('soundVolume', volume.toString());
    
    // Update volume for all loaded sounds
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = volume;
    });
  }, [volume]);

  const value: SoundContextType = {
    isEnabled,
    volume,
    setEnabled,
    setVolume,
    playSound,
    preloadSounds,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};