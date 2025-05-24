interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiry?: number;
}

class StorageService {
  private prefix = 'nnn_game_';

  // Set item with optional expiry (in milliseconds)
  set<T>(key: string, value: T, expiry?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : undefined,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  // Get item and check expiry
  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;

      const item: StorageItem<T> = JSON.parse(stored);
      
      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  // Remove item
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  // Clear all game-related items
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Get all items with prefix
  getAll(): Record<string, any> {
    const items: Record<string, any> = {};
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const cleanKey = key.replace(this.prefix, '');
          items[cleanKey] = this.get(cleanKey);
        }
      });
    } catch (error) {
      console.warn('Failed to get all items from localStorage:', error);
    }
    return items;
  }

  // Save game draft
  saveDraft(gameId: string, roundNumber: number, answers: Record<string, string>): void {
    const key = `draft_${gameId}_${roundNumber}`;
    this.set(key, answers, 24 * 60 * 60 * 1000); // 24 hours expiry
  }

  // Get game draft
  getDraft(gameId: string, roundNumber: number): Record<string, string> | null {
    const key = `draft_${gameId}_${roundNumber}`;
    return this.get(key);
  }

  // Save player preferences
  savePlayerPreferences(preferences: {
    name?: string;
    avatar?: string;
    soundEnabled?: boolean;
    volume?: number;
    theme?: string;
  }): void {
    this.set('player_preferences', preferences);
  }

  // Get player preferences
  getPlayerPreferences() {
    return this.get('player_preferences') || {};
  }
}

export const storageService = new StorageService();
export default StorageService;
