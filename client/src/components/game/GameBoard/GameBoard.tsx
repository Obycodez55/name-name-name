import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Save } from 'lucide-react';
import { cn } from '@utils/helpers';
import { GameState, Round } from '@name-name-name/shared';
import Button from '@components/ui/Button';
import AnswerInput from './AnswerInput';
import Timer from '@components/ui/Timer';

interface GameBoardProps {
  gameState: GameState;
  onSubmitAnswers: (answers: Record<string, string>) => void;
  currentPlayerId: string;
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onSubmitAnswers,
  currentPlayerId,
  className
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentRound = gameState.currentRound;
  const categories = currentRound?.categories || [];
  const letter = currentRound?.letter || '';

  // Initialize answers
  useEffect(() => {
    if (currentRound) {
      const existingAnswers = currentRound.answers[currentPlayerId]?.answers || {};
      setAnswers(existingAnswers);
      setIsSubmitted(currentRound.answers[currentPlayerId]?.isComplete || false);
    }
  }, [currentRound, currentPlayerId]);

  // Timer logic
  useEffect(() => {
    if (!currentRound?.startTime || !currentRound?.timeLimit) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const startTime = new Date(currentRound.startTime).getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, currentRound.timeLimit - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentRound]);

  const handleAnswerChange = (category: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const validateAnswer = (answer: string): boolean => {
    if (!answer.trim()) return false;
    return answer.toLowerCase().startsWith(letter.toLowerCase());
  };

  const getAnswerError = (category: string): string | undefined => {
    const answer = answers[category];
    if (!answer?.trim()) return undefined;
    
    if (!validateAnswer(answer)) {
      return `Answer must start with "${letter.toUpperCase()}"`;
    }
    
    return undefined;
  };

  const canSubmit = () => {
    return categories.some(category => {
      const answer = answers[category];
      return answer?.trim() && validateAnswer(answer);
    });
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    
    onSubmitAnswers(answers);
    setIsSubmitted(true);
  };

  const handleSave = () => {
    // Auto-save functionality
    localStorage.setItem(`draft-${gameState.gameId}-${currentRound?.roundNumber}`, JSON.stringify(answers));
  };

  if (!currentRound) {
    return (
      <div className={cn('card flex items-center justify-center p-12', className)}>
        <p className="text-gray-500 dark:text-gray-400">
          Waiting for round to start...
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Timer */}
      <div className="flex justify-center">
        <Timer
          seconds={timeLeft}
          totalSeconds={currentRound.timeLimit}
          showProgress
          size="lg"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category, index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnswerInput
              category={category}
              letter={letter}
              value={answers[category] || ''}
              onChange={(value) => handleAnswerChange(category, value)}
              disabled={isSubmitted || timeLeft === 0}
              error={getAnswerError(category)}
              isValid={answers[category] ? validateAnswer(answers[category]) : undefined}
            />
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="secondary"
          icon={<Save size={16} />}
          onClick={handleSave}
          disabled={Object.keys(answers).length === 0}
        >
          Save Draft
        </Button>

        <div className="flex gap-3">
          <Button
            variant="success"
            icon={<Send size={16} />}
            onClick={handleSubmit}
            disabled={!canSubmit() || isSubmitted || timeLeft === 0}
            size="lg"
          >
            {isSubmitted ? 'Submitted!' : 'Submit Answers'}
          </Button>
        </div>
      </div>

      {isSubmitted && (
        <motion.div
          className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-green-700 dark:text-green-400 font-medium">
            ✓ Answers submitted! Waiting for other players...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GameBoard;