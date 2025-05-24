import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, generateInitials } from '@utils/helpers';
import { Player } from '@name-name-name/shared';

interface ScoreCardProps {
  player: Player;
  currentScore: number;
  previousScore?: number;
  rank: number;
  totalPlayers: number;
  roundScore?: number;
  isCurrentPlayer?: boolean;
  showTrend?: boolean;
  className?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  player,
  currentScore,
  previousScore = 0,
  rank,
  totalPlayers,
  roundScore = 0,
  isCurrentPlayer = false,
  showTrend = true,
  className
}) => {
  const scoreDiff = currentScore - previousScore;
  const isTop3 = rank <= 3;
  
  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const getTrendIcon = () => {
    if (!showTrend || scoreDiff === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    return scoreDiff > 0 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getRankColor = () => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-500 to-purple-600';
  };

  return (
    <motion.div
      className={cn(
        'card-hover p-4 relative',
        isCurrentPlayer && 'ring-2 ring-blue-500',
        isTop3 && 'shadow-lg',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex items-center justify-center min-w-[2rem]">
          {getRankIcon() || (
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
              #{rank}
            </span>
          )}
        </div>

        {/* Player Avatar */}
        <div className="relative">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
            `bg-gradient-to-br ${getRankColor()}`
          )}>
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              generateInitials(player.name)
            )}
          </div>
          
          {isCurrentPlayer && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">•</span>
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {player.name}
            </h4>
            {isCurrentPlayer && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                You
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="score-display">
              {currentScore.toLocaleString()}
            </span>
            
            {roundScore > 0 && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                +{roundScore}
              </span>
            )}
          </div>
        </div>

        {/* Trend */}
        {showTrend && (
          <div className="flex flex-col items-center gap-1">
            {getTrendIcon()}
            {scoreDiff !== 0 && (
              <span className={cn(
                'text-xs font-medium',
                scoreDiff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {scoreDiff > 0 ? '+' : ''}{scoreDiff}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Top 3 glow effect */}
      {isTop3 && (
        <div className={cn(
          'absolute inset-0 rounded-lg opacity-20 pointer-events-none',
          `bg-gradient-to-r ${getRankColor()}`
        )} />
      )}
    </motion.div>
  );
};

export default ScoreCard;