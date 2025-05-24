import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WaitingRoom from './WaitingRoom';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import { useGameState } from '@hooks/useGameState';
import { GamePhase, GAME_CONSTANTS } from '@name-name-name/shared';
import Button from '@/components/ui/Button';

const Lobby: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { 
    room, 
    gameState, 
    currentPlayer, 
    isLoading, 
    error,
    startGame,
    leaveRoom 
  } = useGameState();

  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // If game has started, redirect to game page
    if (gameState?.phase && gameState.phase !== GamePhase.WAITING) {
      navigate(`/game/${roomCode}`);
    }
  }, [roomCode, gameState?.phase, navigate]);

  const handleStartGame = () => {
    startGame();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  const canStartGame = () => {
    if (!room || !currentPlayer) return false;
    
    const playerCount = Object.keys(room.players).length;
    const isCreator = currentPlayer.role === 'creator';
    
    return isCreator && playerCount >= GAME_CONSTANTS.MIN_PLAYERS;
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Joining room..." />
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
                Error
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

  if (!room || !currentPlayer) {
    return (
      <div className="content-container">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading room..." />
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="max-w-4xl mx-auto">
        <WaitingRoom
          room={room}
          currentPlayer={currentPlayer}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
          canStartGame={canStartGame()}
        />
      </div>
    </div>
  );
};

export default Lobby;