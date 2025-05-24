export interface RouteParams {
  roomCode?: string;
}

export interface NavigationState {
  from?: string;
  error?: string;
  details?: string;
}

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  version: string;
  environment: 'development' | 'production' | 'test';
}