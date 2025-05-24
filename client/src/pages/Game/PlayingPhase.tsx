import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Send } from 'lucide-react';
import { GameState, Player } from '@name-name-name/shared';
import { cn } from '@utils/helpers';
import GameBoard from '@components/game/GameBoard';
import LetterDisplay from '@components/game/LetterDisplay';
import Timer from '@components/ui/Timer';
import PlayerList from '@components/game/PlayerList';

interface PlayingPhaseProps {
  gameState: GameState;
  players: Record<string, Player>;
  currentPlayerId: string;
  onSubmitAnswers: (answers: Record<string, string>) => void;
  className?: string;
}

const PlayingPhase: React.FC<PlayingPhaseProps> = ({
  gameState,
  players,
  currentPlayerId,
  onSubmitAnswers,
  className
}) => {
  const currentRound = gameState.currentRound;
  const submittedCount = currentRound ? Object.values(currentRound.answers).filter(a => a.isComplete).length : 0;
  const totalPlayers = Object.keys(players).length;
  const hasSubmitted = currentRound?.answers[currentPlayerId]?.isComplete || false;

  if (!currentRound) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-gray-500 dark:text-gray-400">Loading round...</p>
      </div>
    );
  }

  return (
    <div className={cn('game-layout', className)}>
      {/* Main Game Area */}
      <div className="game-main">
        <div className="space-y-6">
          {/* Round Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-2">
              Round {currentRound.roundNumber}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Fill each category with a word starting with the letter below
            </p>
          </motion.div>

          {/* Letter Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LetterDisplay
              letter={currentRound.letter}
              size="lg"
            />
          </motion.div>

          {/* Game Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GameBoard
              gameState={gameState}
              onSubmitAnswers={onSubmitAnswers}
              currentPlayerId={currentPlayerId}
            />
          </motion.div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="game-sidebar">
        <div className="space-y-4">
          {/* Progress */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Send size={18} />
                Progress
              </h3>
            </div>
            
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {submittedCount}/{totalPlayers}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Players submitted
                </p>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(submittedCount / totalPlayers) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              {hasSubmitted && (
                <motion.div
                  className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✓ Answers submitted!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
          </div>

          {/* Players */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <PlayerList
              players={players}
              gameState={gameState}
              currentPlayerId={currentPlayerId}
            />
          </motion.div>
        </div>
      </div>
  );
};

export default PlayingPhase;
