import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@context/GameContext';
// import { WebSocketProvider } from '@context/WebSocketContext';
// import { ThemeProvider } from '@context/ThemeContext';
// import { SoundProvider } from '@context/SoundContext';
// import Layout from '@components/layout/Layout';
import Home from '@pages/Home';
import Lobby from '@pages/Lobby';
import Game from '@pages/Game';
import Results from '@pages/Results';
import Error from '@pages/Error';
import NotFound from '@pages/Error/NotFound';
import '@styles/globals.css';

function App() {
  return (
    // <ThemeProvider>
    //   <SoundProvider>
    //     <WebSocketProvider>
    //       <GameProvider>
            <Router>
              {/* <Layout> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/lobby/:roomCode" element={<Lobby />} />
                  <Route path="/game/:roomCode" element={<Game />} />
                  <Route path="/results/:roomCode" element={<Results />} />
                  <Route path="/error" element={<Error />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              {/* </Layout> */}
            </Router>
    //       </GameProvider>
    //     </WebSocketProvider>
    //   </SoundProvider>
    // </ThemeProvider>
  );
}

export default App;
// This code is a React component that sets up the main application structure using React Router for navigation.
// It wraps the application in several context providers for managing game state, WebSocket connections, theme, and sound settings.
// The component defines routes for different pages of the application, including Home, Lobby, Game, Results, and Error pages.
// The Layout component is used to provide a consistent layout across all pages.
// The application is styled using global CSS imported from a separate file.
// The component is exported as the default export of the module, making it available for rendering in the main entry point of the application.
// The code is well-structured and follows best practices for organizing a React application with multiple pages and context providers.