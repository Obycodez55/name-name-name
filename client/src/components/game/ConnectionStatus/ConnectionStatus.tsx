import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@utils/helpers';
import { useWebSocket } from '@context/WebSocketContext';

interface ConnectionStatusProps {
  className?: string;
  showWhenConnected?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
  showWhenConnected = false
}) => {
  const { isConnected, isConnecting, error, reconnectAttempts } = useWebSocket();

  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        icon: <Wifi className="w-4 h-4 animate-spin" />,
        text: reconnectAttempts > 0 ? `Reconnecting... (${reconnectAttempts})` : 'Connecting...',
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      };
    }

    if (!isConnected) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: error || 'Disconnected from server',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      };
    }

    if (showWhenConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Connected',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed top-4 right-4 z-modal border rounded-lg px-3 py-2 shadow-lg',
          statusInfo.bg,
          className
        )}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={cn('flex items-center gap-2 text-sm font-medium', statusInfo.color)}>
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;
