import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Settings, Users, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@utils/helpers';
import Button from '@components/ui/Button';

export interface HeaderProps {
  roomCode?: string;
  playerCount?: number;
  isConnected?: boolean;
  onSettings?: () => void;
  showRoomInfo?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  roomCode,
  playerCount = 0,
  isConnected = true,
  onSettings,
  showRoomInfo = true,
  className
}) => {
  return (
    <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Name! Name!! Name!!!
              </h1>
              {roomCode && showRoomInfo && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Room: <span className="font-mono font-semibold">{roomCode}</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Status and Controls */}
          <div className="flex items-center gap-4">
            {showRoomInfo && (
              <motion.div 
                className="hidden sm:flex items-center gap-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Player Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users size={16} />
                  <span>{playerCount} player{playerCount !== 1 ? 's' : ''}</span>
                </div>

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="relative">
                        <Wifi size={16} />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full connection-pulse" />
                      </div>
                      <span className="text-sm hidden md:inline">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <WifiOff size={16} />
                      <span className="text-sm hidden md:inline">Disconnected</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Settings Button */}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                icon={<Settings size={16} />}
                className="hidden sm:flex"
              >
                Settings
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
