import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import PlayerCard from './PlayerCard';
import { Player, GameState } from '@name-name-name/shared';

interface PlayerListProps {
  players: Record<string, Player>;
  gameState?: GameState;
  currentPlayerId?: string;
  showScores?: boolean;
  className?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  gameState,
  currentPlayerId,
  showScores = false,
  className
}) => {
  const playerList = Object.values(players);
  const sortedPlayers = showScores && gameState?.scores
    ? playerList.sort((a, b) => (gameState.scores[b.id] || 0) - (gameState.scores[a.id] || 0))
    : playerList.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

  const getCurrentRoundMaster = () => {
    if (!gameState?.roundMasterRotation?.length) return null;
    const currentIndex = gameState.currentRoundMasterIndex || 0;
    return gameState.roundMasterRotation[currentIndex];
  };

  const roundMasterId = getCurrentRoundMaster();

  const getPlayerRank = (playerId: string): number => {
    if (!showScores || !gameState?.scores) return 0;
    
    const sortedByScore = Object.entries(gameState.scores)
      .sort(([, a], [, b]) => b - a);
    
    return sortedByScore.findIndex(([id]) => id === playerId) + 1;
  };

  const hasSubmittedAnswers = (playerId: string): boolean => {
    if (!gameState?.currentRound) return false;
    return !!gameState.currentRound.answers[playerId]?.isComplete;
  };

  return (
    <div className={className}>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold">
              Players ({playerList.length})
            </h3>
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
                transition={{ delay: index * 0.1 }}
              >
                <PlayerCard
                  player={player}
                  isRoundMaster={player.id === roundMasterId}
                  score={gameState?.scores?.[player.id] || 0}
                  rank={showScores ? getPlayerRank(player.id) : undefined}
                  hasSubmitted={hasSubmittedAnswers(player.id)}
                  isCurrentPlayer={player.id === currentPlayerId}
                  showScore={showScores}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {playerList.length === 0 && (
            <motion.div
              className="text-center py-8 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No players yet</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerList;