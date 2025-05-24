import { useEffect, useRef } from 'react';
import { useGame } from '@context/GameContext';
import { useWebSocket } from '@context/WebSocketContext';
import { useSound } from '@context/SoundContext';
import { GamePhase, WEBSOCKET_EVENTS } from '@name-name-name/shared';

export const useGameState = () => {
  const game = useGame();
  const { on, off } = useWebSocket();
  const { playSound } = useSound();
  
  const previousPhaseRef = useRef<GamePhase | null>(null);
  const previousPlayerCountRef = useRef(0);

  // Handle phase transitions and play appropriate sounds
  useEffect(() => {
    const currentPhase = game.gameState?.phase;
    const previousPhase = previousPhaseRef.current;

    if (currentPhase && currentPhase !== previousPhase) {
      switch (currentPhase) {
        case GamePhase.LETTER_SELECTION:
          if (previousPhase === GamePhase.WAITING) {
            playSound('gameStart');
          }
          break;
        case GamePhase.PLAYING:
          playSound('letterReveal');
          break;
        case GamePhase.ROUND_RESULTS:
          playSound('roundComplete');
          break;
        case GamePhase.GAME_ENDED:
          playSound('gameComplete');
          break;
      }
      
      previousPhaseRef.current = currentPhase;
    }
  }, [game.gameState?.phase, playSound]);

  // Handle player join/leave sounds
  useEffect(() => {
    const currentPlayerCount = game.room ? Object.keys(game.room.players).length : 0;
    const previousPlayerCount = previousPlayerCountRef.current;

    if (currentPlayerCount > previousPlayerCount && previousPlayerCount > 0) {
      playSound('playerJoin');
    }

    previousPlayerCountRef.current = currentPlayerCount;
  }, [game.room?.players, playSound]);

  // Set up additional WebSocket listeners
  useEffect(() => {
    const handleAnswersSubmitted = () => {
      playSound('answerSubmit');
    };

    const handleNotification = () => {
      playSound('notification');
    };

    on(WEBSOCKET_EVENTS.ANSWERS_SUBMITTED, handleAnswersSubmitted);
    on(WEBSOCKET_EVENTS.SYSTEM_MESSAGE, handleNotification);

    return () => {
      off(WEBSOCKET_EVENTS.ANSWERS_SUBMITTED, handleAnswersSubmitted);
      off(WEBSOCKET_EVENTS.SYSTEM_MESSAGE, handleNotification);
    };
  }, [on, off, playSound]);

  // Helper functions
  const isWaitingForPlayers = () => {
    return game.gameState?.phase === GamePhase.WAITING;
  };

  const isGameActive = () => {
    return game.gameState?.phase && game.gameState.phase !== GamePhase.WAITING && game.gameState.phase !== GamePhase.GAME_ENDED;
  };

  const isCurrentPlayerRoundMaster = () => {
    if (!game.gameState || !game.currentPlayer) return false;
    
    const { roundMasterRotation, currentRoundMasterIndex } = game.gameState;
    if (!roundMasterRotation?.length) return false;
    
    const currentRoundMasterId = roundMasterRotation[currentRoundMasterIndex || 0];
    return currentRoundMasterId === game.currentPlayer.id;
  };

  const getTimeLeftInRound = () => {
    if (!game.gameState?.currentRound) return 0;
    
    const { startTime, timeLimit } = game.gameState.currentRound;
    if (!startTime || !timeLimit) return 0;
    
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    return Math.max(0, timeLimit - elapsed);
  };

  const hasPlayerSubmittedAnswers = (playerId?: string) => {
    const targetPlayerId = playerId || game.currentPlayer?.id;
    if (!targetPlayerId || !game.gameState?.currentRound) return false;
    
    return game.gameState.currentRound.answers[targetPlayerId]?.isComplete || false;
  };

  return {
    ...game,
    isWaitingForPlayers,
    isGameActive,
    isCurrentPlayerRoundMaster,
    getTimeLeftInRound,
    hasPlayerSubmittedAnswers,
  };
};
