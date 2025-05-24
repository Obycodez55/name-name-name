import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Sparkles } from 'lucide-react';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';
import { useGame } from '@context/GameContext';
import { GameConfig } from '@name-name-name/shared';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { joinRoom, error, isLoading } = useGame();
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreateGame = async (config: Partial<GameConfig>, creatorName: string) => {
    try {
      // TODO: Call API to create room
      // For now, simulate room creation
      const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleJoinGame = (roomCode: string, playerName: string) => {
    setJoinError(null);
    
    try {
      joinRoom(roomCode, playerName);
      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      setJoinError('Failed to join game. Please check the room code and try again.');
    }
  };

  return (
    <div className="content-container">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl">
              <Gamepad2 className="h-12 w-12 text-white" />
            </div>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            Name! Name!! Name!!!
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            The fast-paced multiplayer word association game. Race against time to fill categories 
            with words starting with the chosen letter!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>2-8 Players</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time Multiplayer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Customizable Rules</span>
            </div>
          </div>
        </motion.div>

        {/* Game Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CreateGameForm
              onCreateGame={handleCreateGame}
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <JoinGameForm
              onJoinGame={handleJoinGame}
              isLoading={isLoading}
              error={joinError || error || undefined}
            />
          </motion.div>
        </div>

        {/* How to Play */}
        <motion.div
          className="mt-16 card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="card-header">
            <h2 className="text-2xl font-bold">How to Play</h2>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="font-semibold mb-2">Get a Letter</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A random letter is revealed (or chosen by the round master)
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="font-semibold mb-2">Fill Categories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Race against time to fill each category with words starting with that letter
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="font-semibold mb-2">Score Points</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get points for valid answers, bonus points for unique answers!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;