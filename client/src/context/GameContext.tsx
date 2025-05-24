import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, Room, Player, Round, GamePhase } from '@name-name-name/shared';
import { useWebSocket } from './WebSocketContext';

interface GameContextState {
  room: Room | null;
  gameState: GameState | null;
  currentPlayer: Player | null;
  isLoading: boolean;
  error: string | null;
}

type GameAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ROOM'; payload: Room | null }
  | { type: 'SET_GAME_STATE'; payload: GameState | null }
  | { type: 'SET_CURRENT_PLAYER'; payload: Player | null }
  | { type: 'UPDATE_PLAYER'; payload: { playerId: string; updates: Partial<Player> } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UPDATE_ROUND'; payload: Partial<Round> }
  | { type: 'RESET'; payload: null };

const initialState: GameContextState = {
  room: null,
  gameState: null,
  currentPlayer: null,
  isLoading: false,
  error: null,
};

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload };
    
    case 'UPDATE_PLAYER':
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: {
            ...state.room.players,
            [action.payload.playerId]: {
              ...state.room.players[action.payload.playerId],
              ...action.payload.updates,
            },
          },
        },
      };
    
    case 'ADD_PLAYER':
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: {
            ...state.room.players,
            [action.payload.id]: action.payload,
          },
        },
      };
    
    case 'REMOVE_PLAYER':
      if (!state.room) return state;
      const { [action.payload]: removed, ...remainingPlayers } = state.room.players;
      return {
        ...state,
        room: {
          ...state.room,
          players: remainingPlayers,
        },
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

interface GameContextType extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswers: (answers: Record<string, string>) => void;
  selectLetter: (letter: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { emit, on, off, isConnected } = useWebSocket();

  // WebSocket event handlers
  useEffect(() => {
    const handlePlayerJoined = (data: { player: Player; room: Room }) => {
      dispatch({ type: 'SET_ROOM', payload: data.room });
      dispatch({ type: 'ADD_PLAYER', payload: data.player });
    };

    const handlePlayerLeft = (data: { playerId: string; room: Room }) => {
      dispatch({ type: 'REMOVE_PLAYER', payload: data.playerId });
      dispatch({ type: 'SET_ROOM', payload: data.room });
    };

    const handleGameStarted = (data: { gameState: GameState }) => {
      dispatch({ type: 'SET_GAME_STATE', payload: data.gameState });
    };

    const handleRoundStarted = (data: { round: Round; gameState: GameState }) => {
      dispatch({ type: 'SET_GAME_STATE', payload: data.gameState });
    };

    const handleGameError = (data: { error: string }) => {
      dispatch({ type: 'SET_ERROR', payload: data.error });
    };

    // Register event listeners
    on('playerJoined', handlePlayerJoined);
    on('playerLeft', handlePlayerLeft);
    on('gameStarted', handleGameStarted);
    on('roundStarted', handleRoundStarted);
    on('gameError', handleGameError);

    return () => {
      off('playerJoined', handlePlayerJoined);
      off('playerLeft', handlePlayerLeft);
      off('gameStarted', handleGameStarted);
      off('roundStarted', handleRoundStarted);
      off('gameError', handleGameError);
    };
  }, [on, off]);

  // Game actions
  const joinRoom = (roomCode: string, playerName: string) => {
    if (!isConnected) {
      dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    emit('joinRoom', { roomCode, playerName });
  };

  const leaveRoom = () => {
    if (state.room && state.currentPlayer) {
      emit('leaveRoom', { roomCode: state.room.code, playerId: state.currentPlayer.id });
    }
    dispatch({ type: 'RESET', payload: null });
  };

  const startGame = () => {
    if (state.room && state.currentPlayer) {
      emit('startGame', { roomCode: state.room.code, playerId: state.currentPlayer.id });
    }
  };

  const submitAnswers = (answers: Record<string, string>) => {
    if (state.room && state.currentPlayer) {
      emit('submitAnswers', {
        roomCode: state.room.code,
        playerId: state.currentPlayer.id,
        answers,
      });
    }
  };

  const selectLetter = (letter: string) => {
    if (state.room && state.currentPlayer) {
      emit('selectLetter', {
        roomCode: state.room.code,
        playerId: state.currentPlayer.id,
        letter,
      });
    }
  };

  const value: GameContextType = {
    ...state,
    dispatch,
    joinRoom,
    leaveRoom,
    startGame,
    submitAnswers,
    selectLetter,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};