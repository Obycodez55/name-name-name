import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameState, Player, ValidationResults, AnswerValidation } from '@name-name-name/shared';
import { cn } from '@utils/helpers';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';

interface ScoringPhaseProps {
  gameState: GameState;
  players: Record<string, Player>;
  currentPlayerId: string;
  onVoteAnswer?: (playerId: string, category: string, answer: string, isValid: boolean) => void;
  className?: string;
}

const ScoringPhase: React.FC<ScoringPhaseProps> = ({
  gameState,
  players,
  currentPlayerId,
  onVoteAnswer,
  className
}) => {
  const currentRound = gameState.currentRound;
  const validationResults = currentRound?.validationResults;

  if (!currentRound) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <LoadingSpinner size="lg" text="Loading round results..." />
      </div>
    );
  }

  const getValidationIcon = (validation: AnswerValidation) => {
    if (validation.isValid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (validation.isValid === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getValidationColor = (validation: AnswerValidation) => {
    if (validation.isValid) return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    if (validation.isValid === false) return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
  };

  const categories = currentRound.categories;
  const playerIds = Object.keys(players);

  if (!validationResults) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <LoadingSpinner size="lg" text="Validating answers..." />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2">
          Round {currentRound.roundNumber} - Validation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review and validate the submitted answers
        </p>
      </motion.div>

      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category}
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
          </div>
          
          <div className="card-body space-y-3">
            {playerIds.map((playerId) => {
              const player = players[playerId];
              const answer = currentRound.answers[playerId]?.answers[category];
              const validation = validationResults[playerId]?.[category];

              if (!answer?.trim()) {
                return (
                  <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <span className="text-gray-500 italic">No answer</span>
                  </div>
                );
              }

              return (
                <motion.div
                  key={playerId}
                  className={cn(
                    'p-4 rounded-lg border-2',
                    validation ? getValidationColor(validation) : 'border-gray-200 dark:border-gray-700'
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">{player.name}</span>
                        {playerId === currentPlayerId && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">{answer}</span>
                      {validation && getValidationIcon(validation)}
                    </div>
                  </div>
                  
                  {validation && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Method: {validation.validationMethod}
                        </span>
                        {validation.confidence && (
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Confidence: {Math.round(validation.confidence * 100)}%
                          </span>
                        )}
                        {validation.reason && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {validation.reason}
                          </p>
                        )}
                      </div>
                      
                      {/* Voting buttons for questionable answers */}
                      {onVoteAnswer && validation.confidence && validation.confidence < 0.8 && playerId !== currentPlayerId && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ThumbsUp size={14} />}
                            onClick={() => onVoteAnswer(playerId, category, answer, true)}
                            className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                          >
                            Valid
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ThumbsDown size={14} />}
                            onClick={() => onVoteAnswer(playerId, category, answer, false)}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            Invalid
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ScoringPhase;
