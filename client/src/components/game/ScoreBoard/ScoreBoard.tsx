import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Award } from 'lucide-react';
import ScoreCard from './ScoreCard';
import { Player, GameState } from '@name-name-name/shared';

interface ScoreBoardProps {
  players: Record<string, Player>;
  gameState: GameState;
  currentPlayerId?: string;
  showRoundScores?: boolean;
  previousScores?: Record<string, number>;
  className?: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  gameState,
  currentPlayerId,
  showRoundScores = false,
  previousScores = {},
  className
}) => {
  const playerList = Object.values(players);
  const scores = gameState.scores || {};
  
  // Sort players by score (descending)
  const sortedPlayers = playerList.sort((a, b) => {
    const scoreA = scores[a.id] || 0;
    const scoreB = scores[b.id] || 0;
    return scoreB - scoreA;
  });

  const getRoundScore = (playerId: string): number => {
    if (!gameState.currentRound) return 0;
    return gameState.currentRound.scores?.[playerId] || 0;
  };

  const getPlayerRank = (playerId: string): number => {
    return sortedPlayers.findIndex(p => p.id === playerId) + 1;
  };

  const totalPlayers = playerList.length;
  const hasScores = Object.values(scores).some(score => score > 0);

  if (!hasScores) {
    return (
      <div className={className}>
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold">Scoreboard</h3>
            </div>
          </div>
          
          <div className="card-body">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Game hasn't started yet</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold">Scoreboard</h3>
            </div>
            
            {gameState.currentRound && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Round {gameState.currentRound.roundNumber}
              </span>
            )}
          </div>
        </div>
        
        <div className="card-body space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <ScoreCard
                  player={player}
                  currentScore={scores[player.id] || 0}
                  previousScore={previousScores[player.id] || 0}
                  rank={getPlayerRank(player.id)}
                  totalPlayers={totalPlayers}
                  roundScore={showRoundScores ? getRoundScore(player.id) : undefined}
                  isCurrentPlayer={player.id === currentPlayerId}
                  showTrend={Object.keys(previousScores).length > 0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {sortedPlayers.length > 0 && (
          <div className="card-footer">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {sortedPlayers.length} player{sortedPlayers.length !== 1 ? 's' : ''} • 
              Round {gameState.rounds.length}
              {gameState.config.maxRounds && ` of ${gameState.config.maxRounds}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;