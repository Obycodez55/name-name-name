import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { GameState, Player, Round } from '@name-name-name/shared';
import { cn } from '@utils/helpers';
import Button from '@components/ui/Button';
import ScoreBoard from '@components/game/ScoreBoard';

interface RoundResultsProps {
  gameState: GameState;
  players: Record<string, Player>;
  currentPlayerId: string;
  onNextRound: () => void;
  isLastRound?: boolean;
  className?: string;
}

const RoundResults: React.FC<RoundResultsProps> = ({
  gameState,
  players,
  currentPlayerId,
  onNextRound,
  isLastRound = false,
  className
}) => {
  const currentRound = gameState.currentRound;
  const previousScores = gameState.rounds.length > 1 
    ? gameState.rounds[gameState.rounds.length - 2].scores 
    : {};

  if (!currentRound) {
    return null;
  }

  const getRoundWinner = () => {
    if (!currentRound.scores) return null;
    
    const topScore = Math.max(...Object.values(currentRound.scores));
    const winnerId = Object.entries(currentRound.scores).find(([_, score]) => score === topScore)?.[0];
    
    return winnerId ? players[winnerId] : null;
  };

  const getPlayerRoundScore = (playerId: string) => {
    return currentRound.scores?.[playerId] || 0;
  };

  const getUniqueAnswersCount = (playerId: string) => {
    if (!currentRound.answers[playerId]) return 0;
    
    const playerAnswers = currentRound.answers[playerId].answers;
    let uniqueCount = 0;
    
    Object.entries(playerAnswers).forEach(([category, answer]) => {
      if (!answer?.trim()) return;
      
      const otherAnswers = Object.values(currentRound.answers)
        .filter(a => a.playerId !== playerId)
        .map(a => a.answers[category]?.toLowerCase().trim())
        .filter(Boolean);
      
      if (!otherAnswers.includes(answer.toLowerCase().trim())) {
        uniqueCount++;
      }
    });
    
    return uniqueCount;
  };

  const roundWinner = getRoundWinner();
  const currentPlayerScore = getPlayerRoundScore(currentPlayerId);
  const currentPlayerUnique = getUniqueAnswersCount(currentPlayerId);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Round Summary */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-2">
          Round {currentRound.roundNumber} Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Letter: <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{currentRound.letter}</span>
        </p>
      </motion.div>

      {/* Round Winner */}
      {roundWinner && (
        <motion.div
          className="card text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-body">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Round Winner</h3>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {roundWinner.name}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {getPlayerRoundScore(roundWinner.id)} points this round
            </p>
          </div>
        </motion.div>
      )}

      {/* Player Performance */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="card text-center">
          <div className="card-body">
            <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Your Score</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{currentPlayerScore}
            </p>
            <p className="text-sm text-gray-500">points this round</p>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="card-body">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Unique Answers</h4>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentPlayerUnique}
            </p>
            <p className="text-sm text-gray-500">bonus points</p>
          </div>
        </div>
        
        <div className="card text-center">
          <div className="card-body">
            <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">Total Score</h4>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {gameState.scores?.[currentPlayerId] || 0}
            </p>
            <p className="text-sm text-gray-500">overall</p>
          </div>
        </div>
      </motion.div>

      {/* Detailed Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ScoreBoard
          players={players}
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          showRoundScores={true}
          previousScores={previousScores}
        />
      </motion.div>

      {/* Next Round Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          size="lg"
          onClick={onNextRound}
          icon={<ArrowRight size={20} />}
          iconPosition="right"
        >
          {isLastRound ? 'View Final Results' : 'Continue to Next Round'}
        </Button>
      </motion.div>
    </div>
  );
};

export default RoundResults;
