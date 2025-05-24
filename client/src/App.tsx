import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { GameProvider } from '@context/GameContext';
import { WebSocketProvider } from '@context/WebSocketContext';
import { ThemeProvider } from '@context/ThemeContext';
import { SoundProvider } from '@context/SoundContext';
import Layout from '@components/layout/Layout';
import ConnectionStatus from '@components/game/ConnectionStatus';
import Home from '@pages/Home';
import Lobby from '@pages/Lobby';
import Game from '@pages/Game';
import Results from '@pages/Results';
import ErrorPage from '@pages/Error';
import NotFound from '@pages/Error/NotFound';
import { useGameState } from '@hooks/useGameState';

// Error boundary fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <ErrorPage error={error} resetError={resetErrorBoundary} />
);

// Main app content with providers
const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout
        headerProps={{
          showRoomInfo: false, // Will be overridden by individual pages
        }}
      >
        <ConnectionStatus />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
          <Route path="/game/:roomCode" element={<Game />} />
          <Route path="/results/:roomCode" element={<Results />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

// Main App component with all providers
const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Clear any cached state and reload
        window.location.href = '/';
      }}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Application error:', error, errorInfo);
      }}
    >
      <ThemeProvider>
        <SoundProvider>
          <WebSocketProvider>
            <GameProvider>
              <AppContent />
            </GameProvider>
          </WebSocketProvider>
        </SoundProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;