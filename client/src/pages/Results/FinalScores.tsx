import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { GameState, Player, ScoreBreakdown } from '@name-name-name/shared';
import { cn, generateInitials } from '@utils/helpers';

interface FinalScoresProps {
  gameState: GameState;
  players: Record<string, Player>;
  currentPlayerId: string;
  className?: string;
}

const FinalScores: React.FC<FinalScoresProps> = ({
  gameState,
  players,
  currentPlayerId,
  className
}) => {
  const calculateScoreBreakdowns = (): ScoreBreakdown[] => {
    const playerIds = Object.keys(players);
    
    return playerIds.map((playerId) => {
      const player = players[playerId];
      const totalScore = gameState.scores?.[playerId] || 0;
      const roundScores = gameState.rounds.map(round => round.scores?.[playerId] || 0);
      
      // Calculate stats
      let validAnswers = 0;
      let uniqueAnswers = 0;
      
      gameState.rounds.forEach(round => {
        if (round.answers[playerId]) {
          Object.entries(round.answers[playerId].answers).forEach(([category, answer]) => {
            if (answer?.trim()) {
              validAnswers++;
              
              // Check if unique in this round
              const otherAnswers = Object.values(round.answers)
                .filter(a => a.playerId !== playerId)
                .map(a => a.answers[category]?.toLowerCase().trim())
                .filter(Boolean);
              
              if (!otherAnswers.includes(answer.toLowerCase().trim())) {
                uniqueAnswers++;
              }
            }
          });
        }
      });

      return {
        playerId,
        playerName: player.name,
        roundScores,
        totalScore,
        validAnswers,
        uniqueAnswers,
        rank: 0, // Will be set after sorting
      };
    }).sort((a, b) => b.totalScore - a.totalScore)
      .map((breakdown, index) => ({ ...breakdown, rank: index + 1 }));
  };

  const scoreBreakdowns = calculateScoreBreakdowns();
  const winner = scoreBreakdowns[0];
  const currentPlayerBreakdown = scoreBreakdowns.find(s => s.playerId === currentPlayerId);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2: return <Medal className="w-8 h-8 text-gray-400" />;
      case 3: return <Award className="w-8 h-8 text-amber-600" />;
      default: return <Star className="w-8 h-8 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-400 to-amber-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-20';
      default: return 'h-16';
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Winner Announcement */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">🎉 Game Complete! 🎉</h1>
        <h2 className="text-2xl text-yellow-600 dark:text-yellow-400 font-bold mb-2">
          {winner.playerName} Wins!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          With {winner.totalScore.toLocaleString()} points across {gameState.rounds.length} rounds
        </p>
      </motion.div>

      {/* Podium */}
      <motion.div
        className="flex items-end justify-center gap-4 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {scoreBreakdowns.slice(0, 3).map((breakdown, index) => {
          const actualRank = breakdown.rank;
          const podiumOrder = actualRank === 1 ? 1 : actualRank === 2 ? 0 : 2; // 2nd, 1st, 3rd
          
          return (
            <motion.div
              key={breakdown.playerId}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + podiumOrder * 0.1 }}
              style={{ order: podiumOrder }}
            >
              {/* Player */}
              <div className="mb-4 text-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2',
                  `bg-gradient-to-br ${getRankColor(actualRank)}`
                )}>
                  {players[breakdown.playerId].avatar ? (
                    <img 
                      src={players[breakdown.playerId].avatar} 
                      alt={breakdown.playerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    generateInitials(breakdown.playerName)
                  )}
                </div>
                <h3 className="font-bold">{breakdown.playerName}</h3>
                <p className="text-2xl font-bold">{breakdown.totalScore}</p>
                {getRankIcon(actualRank)}
              </div>
              
              {/* Podium */}
              <div className={cn(
                'w-24 rounded-t-lg flex items-end justify-center pb-2',
                getPodiumHeight(actualRank),
                `bg-gradient-to-t ${getRankColor(actualRank)}`
              )}>
                <span className="text-white font-bold text-lg">#{actualRank}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Detailed Rankings */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="card-header">
          <h3 className="text-xl font-bold">Final Standings</h3>
        </div>
        
        <div className="card-body space-y-3">
          {scoreBreakdowns.map((breakdown, index) => (
            <motion.div
              key={breakdown.playerId}
              className={cn(
                'p-4 rounded-lg border',
                breakdown.playerId === currentPlayerId 
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getRankIcon(breakdown.rank)}
                    <div>
                      <h4 className="font-bold text-lg">{breakdown.playerName}</h4>
                      {breakdown.playerId === currentPlayerId && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">You</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{breakdown.totalScore.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {breakdown.validAnswers} answers, {breakdown.uniqueAnswers} unique
                  </div>
                </div>
              </div>
              
              {/* Round breakdown */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Round scores:</span>
                <div className="flex gap-1">
                  {breakdown.roundScores.map((score, roundIndex) => (
                    <span
                      key={roundIndex}
                      className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono"
                    >
                      {score}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Personal Stats */}
      {currentPlayerBreakdown && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="card-header">
            <h3 className="text-xl font-bold">Your Performance</h3>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  #{currentPlayerBreakdown.rank}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Final Rank</p>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {currentPlayerBreakdown.totalScore}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {currentPlayerBreakdown.validAnswers}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid Answers</p>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentPlayerBreakdown.uniqueAnswers}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unique Answers</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FinalScores;
