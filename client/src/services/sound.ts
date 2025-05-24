interface SoundConfig {
  volume: number;
  enabled: boolean;
  preload: boolean;
}

interface SoundMetadata {
  duration?: number;
  size?: number;
  loaded: boolean;
  error?: string;
}

class SoundService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private config: SoundConfig;
  private metadata: Map<string, SoundMetadata> = new Map();

  constructor() {
    this.config = {
      volume: parseFloat(localStorage.getItem('soundVolume') || '0.7'),
      enabled: JSON.parse(localStorage.getItem('soundEnabled') || 'true'),
      preload: true,
    };
  }

  // Initialize and preload sounds
  async initialize(soundFiles: Record<string, string>): Promise<void> {
    const loadPromises = Object.entries(soundFiles).map(([name, path]) => 
      this.loadSound(name, path)
    );

    try {
      await Promise.allSettled(loadPromises);
      console.log('Sound service initialized');
    } catch (error) {
      console.warn('Some sounds failed to load:', error);
    }
  }

  // Load a single sound
  private async loadSound(name: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(path);
      
      audio.addEventListener('loadedmetadata', () => {
        this.metadata.set(name, {
          duration: audio.duration,
          loaded: true,
        });
      });

      audio.addEventListener('canplaythrough', () => {
        this.sounds.set(name, audio);
        audio.volume = this.config.volume;
        resolve();
      });

      audio.addEventListener('error', (error) => {
        console.warn(`Failed to load sound: ${name}`, error);
        this.metadata.set(name, {
          loaded: false,
          error: `Failed to load: ${path}`,
        });
        reject(error);
      });

      if (this.config.preload) {
        audio.preload = 'auto';
        audio.load();
      }
    });
  }

  // Play a sound
  play(soundName: string, options?: { volume?: number; loop?: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.enabled) {
        resolve();
        return;
      }

      const audio = this.sounds.get(soundName);
      if (!audio) {
        console.warn(`Sound not found: ${soundName}`);
        reject(new Error(`Sound not found: ${soundName}`));
        return;
      }

      // Set options
      const volume = options?.volume !== undefined ? options.volume : this.config.volume;
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.loop = options?.loop || false;

      // Reset to beginning
      audio.currentTime = 0;

      // Play
      audio.play()
        .then(() => resolve())
        .catch((error) => {
          console.warn(`Failed to play sound: ${soundName}`, error);
          reject(error);
        });
    });
  }

  // Stop a sound
  stop(soundName: string): void {
    const audio = this.sounds.get(soundName);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Stop all sounds
  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Set global volume
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.config.volume.toString());
    
    // Update all loaded sounds
    this.sounds.forEach((audio) => {
      audio.volume = this.config.volume;
    });
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    localStorage.setItem('soundEnabled', JSON.stringify(enabled));
    
    if (!enabled) {
      this.stopAll();
    }
  }

  // Get current config
  getConfig(): SoundConfig {
    return { ...this.config };
  }

  // Get sound metadata
  getSoundMetadata(soundName: string): SoundMetadata | null {
    return this.metadata.get(soundName) || null;
  }

  // Get all loaded sounds info
  getAllSoundsInfo(): Array<{ name: string; metadata: SoundMetadata }> {
    return Array.from(this.metadata.entries()).map(([name, metadata]) => ({
      name,
      metadata,
    }));
  }

  // Check if a sound is loaded and ready
  isSoundReady(soundName: string): boolean {
    const audio = this.sounds.get(soundName);
    const metadata = this.metadata.get(soundName);
    return !!(audio && metadata?.loaded);
  }

  // Get loading progress
  getLoadingProgress(): { loaded: number; total: number; percentage: number } {
    const total = this.metadata.size;
    const loaded = Array.from(this.metadata.values()).filter(m => m.loaded).length;
    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 100;
    
    return { loaded, total, percentage };
  }

  // Preload additional sounds
  async preloadSound(name: string, path: string): Promise<void> {
    if (this.sounds.has(name)) {
      console.warn(`Sound already loaded: ${name}`);
      return;
    }

    return this.loadSound(name, path);
  }

  // Remove a sound from memory
  unloadSound(soundName: string): void {
    const audio = this.sounds.get(soundName);
    if (audio) {
      audio.pause();
      audio.src = '';
      this.sounds.delete(soundName);
      this.metadata.delete(soundName);
    }
  }

  // Test audio context (useful for handling browser autoplay policies)
  async testAudioContext(): Promise<boolean> {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return false;

      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      audioContext.close();
      return true;
    } catch (error) {
      console.warn('Audio context test failed:', error);
      return false;
    }
  }
}

export const soundService = new SoundService();
export default SoundService;