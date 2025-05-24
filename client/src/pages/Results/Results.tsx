import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Share2 } from 'lucide-react';
import { useGameState } from '@hooks/useGameState';
import FinalScores from './FinalScores';
import GameSummary from './GameSummary';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const Results: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, gameState, currentPlayer, isLoading, error } = useGameState();

  const handleNewGame = () => {
    navigate('/');
  };

  const handlePlayAgain = () => {
    // TODO: Implement play again functionality
    console.log('Play again with same players');
  };

  const handleShare = async () => {
    if (!gameState || !currentPlayer) return;

    const winner = Object.entries(gameState.scores || {})
      .sort(([, a], [, b]) => b - a)[0];
    
    const winnerName = winner ? room?.players[winner[0]]?.name : 'Unknown';
    const playerScore = gameState.scores?.[currentPlayer.id] || 0;

    const shareText = `I just played Name! Name!! Name!!! 🎮\n` +
      `Winner: ${winnerName} with ${winner?.[1] || 0} points!\n` +
      `My score: ${playerScore} points in ${gameState.rounds.length} rounds.\n` +
      `Join us for the next game!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Name! Name!! Name!!! Game Results',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        // Could show a toast notification here
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  if (isLoading || !gameState || !room || !currentPlayer) {
    return (
      <div className="content-container">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading results..." />
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
                Error Loading Results
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

  return (
    <div className="content-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Final Scores */}
        <FinalScores
          gameState={gameState}
          players={room.players}
          currentPlayerId={currentPlayer.id}
        />

        {/* Game Summary */}
        <GameSummary
          gameState={gameState}
          players={room.players}
        />

        {/* Actions */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Button
            onClick={handleNewGame}
            icon={<Home size={16} />}
            size="lg"
          >
            New Game
          </Button>
          
          <Button
            variant="secondary"
            onClick={handlePlayAgain}
            icon={<RotateCcw size={16} />}
            size="lg"
          >
            Play Again
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleShare}
            icon={<Share2 size={16} />}
            size="lg"
          >
            Share Results
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;