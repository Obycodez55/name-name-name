import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Hash, Target } from 'lucide-react';
import { GameState, Player } from '@name-name-name/shared';
import { cn, formatTime } from '@utils/helpers';

interface GameSummaryProps {
  gameState: GameState;
  players: Record<string, Player>;
  className?: string;
}

const GameSummary: React.FC<GameSummaryProps> = ({
  gameState,
  players,
  className
}) => {
  const gameDuration = gameState.gameStartTime && gameState.gameEndTime
    ? Math.floor((new Date(gameState.gameEndTime).getTime() - new Date(gameState.gameStartTime).getTime()) / 1000)
    : 0;

  const totalAnswers = gameState.rounds.reduce((total, round) => {
    return total + Object.values(round.answers).reduce((roundTotal, playerAnswers) => {
      return roundTotal + Object.values(playerAnswers.answers).filter(answer => answer?.trim()).length;
    }, 0);
  }, 0);

  const categories = gameState.config.categories;
  const lettersUsed = gameState.rounds.map(round => round.letter);

  const formatGameDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <h3 className="text-xl font-bold">Game Summary</h3>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatGameDuration(gameDuration)}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Game Duration</p>
            </div>
            
            <div>
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Object.keys(players).length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Players</p>
            </div>
            
            <div>
              <Hash className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{gameState.rounds.length}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rounds</p>
            </div>
            
            <div>
              <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalAnswers}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Answers</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Letters Used */}
        <div className="card">
          <div className="card-header">
            <h4 className="text-lg font-semibold">Letters Used</h4>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {lettersUsed.map((letter, index) => (
                <motion.span
                  key={index}
                  className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="card">
          <div className="card-header">
            <h4 className="text-lg font-semibold">Categories</h4>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {category}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameSummary;