import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Settings } from 'lucide-react';
import { Room, Player } from '@name-name-name/shared';
import { cn } from '@utils/helpers';
import Button from '@components/ui/Button';
import PlayerList from '@components/game/PlayerList';

interface WaitingRoomProps {
  room: Room;
  currentPlayer: Player;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  canStartGame: boolean;
  className?: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  currentPlayer,
  onStartGame,
  onLeaveRoom,
  canStartGame,
  className
}) => {
  const [copied, setCopied] = React.useState(false);
  const isCreator = currentPlayer.role === 'creator';
  const playerCount = Object.keys(room.players).length;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy room code:', error);
    }
  };

  const shareRoom = () => {
    const url = `${window.location.origin}/lobby/${room.code}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my Name! Name!! Name!!! game',
        text: `Room code: ${room.code}`,
        url: url,
      });
    } else {
      copyRoomCode();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Room Info */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {room.name || 'Game Lobby'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Waiting for players to join...
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {room.code}
              </div>
              <p className="text-sm text-gray-500">Room Code</p>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              icon={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={copyRoomCode}
              size="sm"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            
            <Button
              variant="secondary"
              icon={<ExternalLink size={16} />}
              onClick={shareRoom}
              size="sm"
            >
              Share Room
            </Button>
            
            {isCreator && (
              <Button
                variant="ghost"
                icon={<Settings size={16} />}
                size="sm"
              >
                Game Settings
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Game Configuration */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold">Game Configuration</h3>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {playerCount}/{room.config.maxPlayers}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Players</p>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {room.config.roundTimeLimit}s
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Round Time</p>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {room.config.categories.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {room.config.validationMode}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Validation</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {room.config.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Players */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PlayerList
          players={room.players}
          currentPlayerId={currentPlayer.id}
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="secondary"
          onClick={onLeaveRoom}
        >
          Leave Room
        </Button>
        
        {isCreator && (
          <Button
            variant="success"
            size="lg"
            onClick={onStartGame}
            disabled={!canStartGame}
          >
            Start Game
          </Button>
        )}
      </motion.div>
      
      {isCreator && !canStartGame && (
        <motion.p
          className="text-center text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Need at least 2 players to start the game
        </motion.p>
      )}
    </div>
  );
};

export default WaitingRoom;