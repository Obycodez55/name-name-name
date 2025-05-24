import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Hash } from 'lucide-react';
import { cn } from '@utils/helpers';
import { GAME_CONSTANTS } from '@name-name-name/shared';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';

interface JoinGameFormProps {
  onJoinGame: (roomCode: string, playerName: string) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

const JoinGameForm: React.FC<JoinGameFormProps> = ({
  onJoinGame,
  isLoading = false,
  error,
  className
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !playerName.trim()) return;
    
    onJoinGame(roomCode.trim().toUpperCase(), playerName.trim());
  };

  const formatRoomCode = (value: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    return value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, GAME_CONSTANTS.ROOM_CODE_LENGTH);
  };

  return (
    <div className={cn('card', className)}>
      <div className="card-header">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Join Existing Game
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="card-body space-y-6">
        <Input
          label="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(formatRoomCode(e.target.value))}
          placeholder="Enter 6-character room code"
          icon={<Hash size={16} />}
          maxLength={GAME_CONSTANTS.ROOM_CODE_LENGTH}
          required
          fullWidth
          helpText="Ask the game creator for the room code"
          error={error}
        />

        <Input
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={GAME_CONSTANTS.MAX_PLAYER_NAME_LENGTH}
          required
          fullWidth
        />

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!roomCode.trim() || !playerName.trim() || roomCode.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH}
        >
          Join Game
        </Button>
      </form>
    </div>
  );
};

export default JoinGameForm;