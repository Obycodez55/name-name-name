import { GameState, Room, Player } from '@name-name-name/shared';

export interface DatabaseInterface {
  // Game History
  saveGameHistory(gameState: GameState, room: Room): Promise<any>;
  getGameHistory(page: number, limit: number, filters?: any): Promise<{ games: any[]; total: number }>;
  getPlayerStats(playerId: string): Promise<any>;
  
  // Room Configuration
  saveRoomConfig(roomCode: string, config: any): Promise<any>;
  getRoomConfig(roomCode: string): Promise<any>;
  
  // Dictionary
  getDictionaryWords(category: string): Promise<string[]>;
  addDictionaryWords(category: string, words: string[]): Promise<any>;
  validateDictionaryWord(category: string, word: string): Promise<boolean>;
  
  // Utilities
  cleanup(): Promise<void>;
  getStats(): Promise<any>;
}