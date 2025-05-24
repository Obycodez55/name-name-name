import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Wifi, WifiOff, User, Check, Clock } from 'lucide-react';
import { cn, generateInitials } from '@utils/helpers';
import { Player, PlayerStatus } from '@name-name-name/shared';

interface PlayerCardProps {
  player: Player;
  isRoundMaster?: boolean;
  score?: number;
  rank?: number;
  hasSubmitted?: boolean;
  isCurrentPlayer?: boolean;
  showScore?: boolean;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isRoundMaster = false,
  score = 0,
  rank,
  hasSubmitted = false,
  isCurrentPlayer = false,
  showScore = false,
  className
}) => {
  const getStatusColor = (status: PlayerStatus) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'typing': return 'text-yellow-500';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: PlayerStatus) => {
    switch (status) {
      case 'online': return <Wifi size={12} />;
      case 'offline': return <WifiOff size={12} />;
      default: return <Wifi size={12} />;
    }
  };

  return (
    <motion.div
      className={cn(
        'card-hover p-4 relative',
        isCurrentPlayer && 'ring-2 ring-blue-500',
        isRoundMaster && 'round-master-indicator',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              generateInitials(player.name)
            )}
          </div>
          
          {/* Status indicator */}
          <div className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center',
            getStatusColor(player.status)
          )}>
            {getStatusIcon(player.status)}
          </div>
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {player.name}
            </h4>
            
            {isRoundMaster && (
              <span title="Round Master">
                <Crown className="w-4 h-4 text-yellow-500" />
              </span>
            )}
            
            {isCurrentPlayer && (
              <span title="You">
                <User className="w-4 h-4 text-blue-500" />
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            {showScore && (
              <span className="font-mono font-semibold">
                {score.toLocaleString()} pts
              </span>
            )}
            
            {rank && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                #{rank}
              </span>
            )}
          </div>
        </div>

        {/* Submission status */}
        <div className="flex flex-col items-center gap-1">
          {hasSubmitted ? (
            <div className="text-green-500" title="Submitted answers">
              <Check size={16} />
            </div>
          ) : (
            <div className="text-gray-400" title="Waiting for answers">
              <Clock size={16} />
            </div>
          )}
          
          {player.status === 'typing' && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
