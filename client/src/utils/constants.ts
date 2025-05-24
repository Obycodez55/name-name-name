export const APP_CONFIG = {
  name: 'Name! Name!! Name!!!',
  version: '1.0.0',
  description: 'Fast-paced multiplayer word association game',
  
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  
  // WebSocket Configuration
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'http://localhost:3001',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  
  // Storage keys
  storage: {
    prefix: 'nnn_game_',
    keys: {
      playerPreferences: 'player_preferences',
      theme: 'theme',
      soundSettings: 'sound_settings',
      draftPrefix: 'draft_',
    },
  },
  
  // Default settings
  defaults: {
    theme: 'system' as const,
    soundEnabled: true,
    soundVolume: 0.7,
    gameSettings: {
      maxPlayers: 6,
      roundTimeLimit: 180,
      categories: ['Animals', 'Foods', 'Cities', 'Movies', 'Books', 'Sports'],
    },
  },
  
  // Feature flags
  features: {
    enableChat: true,
    enableVoice: false,
    enableSpectators: true,
    enableCustomCategories: true,
    enableAIValidation: true,
  },
} as const;

export default APP_CONFIG;