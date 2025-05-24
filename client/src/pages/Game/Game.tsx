import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GamePhase } from '@name-name-name/shared';
import { useGameState } from '@hooks/useGameState';
import PlayingPhase from './PlayingPhase';
import ScoringPhase from './ScoringPhase';
import RoundResults from './RoundResults';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import LetterDisplay from '@components/game/LetterDisplay';
import Button from '@/components/ui/Button';

const Game: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { 
    room, 
    gameState, 
    currentPlayer, 
    isLoading, 
    error,
    submitAnswers,
    selectLetter 
  } = useGameState();

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Redirect based on game state
    if (gameState?.phase === GamePhase.WAITING) {
      navigate(`/lobby/${roomCode}`);
    } else if (gameState?.phase === GamePhase.GAME_ENDED) {
      navigate(`/results/${roomCode}`);
    }
  }, [roomCode, gameState?.phase, navigate]);

  const handleSubmitAnswers = (answers: Record<string, string>) => {
    submitAnswers(answers);
  };

  const handleVoteAnswer = (playerId: string, category: string, answer: string, isValid: boolean) => {
    // TODO: Implement voting logic through WebSocket
    console.log('Vote:', { playerId, category, answer, isValid });
  };

  const handleNextRound = () => {
    // The game will automatically progress when all players are ready
    // This could trigger a "ready for next round" event
  };

  if (isLoading || !gameState || !room || !currentPlayer) {
    return (
      <div className="content-container">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading game..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="max-w-md mx-auto">
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="card-body">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
                Game Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <Button onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderGamePhase = () => {
    switch (gameState.phase) {
      case GamePhase.LETTER_SELECTION:
        return (
          <div className="content-container">
            <div className="max-w-md mx-auto text-center">
              <LetterDisplay />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Waiting for letter selection...
              </p>
            </div>
          </div>
        );

      case GamePhase.PLAYING:
        return (
          <div className="content-container">
            <PlayingPhase
              gameState={gameState}
              players={room.players}
              currentPlayerId={currentPlayer.id}
              onSubmitAnswers={handleSubmitAnswers}
            />
          </div>
        );

      case GamePhase.VALIDATION:
      case GamePhase.SCORING:
        return (
          <div className="content-container">
            <div className="max-w-4xl mx-auto">
              <ScoringPhase
                gameState={gameState}
                players={room.players}
                currentPlayerId={currentPlayer.id}
                onVoteAnswer={handleVoteAnswer}
              />
            </div>
          </div>
        );

      case GamePhase.ROUND_RESULTS:
        const isLastRound = gameState.config.maxRounds 
          ? gameState.rounds.length >= gameState.config.maxRounds
          : false;

        return (
          <div className="content-container">
            <div className="max-w-4xl mx-auto">
              <RoundResults
                gameState={gameState}
                players={room.players}
                currentPlayerId={currentPlayer.id}
                onNextRound={handleNextRound}
                isLastRound={isLastRound}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="content-container">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text={`Game phase: ${gameState.phase}`} />
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameState.phase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderGamePhase()}
      </motion.div>
    </AnimatePresence>
  );
};

export default Game;
