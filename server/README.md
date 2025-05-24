# ===== README.md (Root directory) =====
# Name! Name!! Name!!! - Multiplayer Word Association Game

A real-time multiplayer word association game where players race against time to fill categories with words beginning with a specific letter.

## 🎮 Game Overview

**Name! Name!! Name!!!** is a digital adaptation of the classic word association game. Players take turns being the "round master" who either selects a letter or triggers a timed round with a randomly selected letter. The goal is to fill categories like "Animals," "Foods," and "Cities" with valid words that start with the given letter.

### Key Features

- **Real-time Multiplayer**: Up to 8 players can join a room and play together
- **Multiple Validation Methods**: Dictionary-based, AI-powered, or player voting validation
- **Flexible Game Modes**: Random letters vs. player-selected letters
- **Smart Scoring**: Points for valid answers, bonus points for unique answers
- **Custom Categories**: Create games with custom category sets
- **WebSocket Communication**: Instant synchronization across all players
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker & Docker Compose** (recommended for development)
- **MongoDB** (v7.0 or higher)
- **Redis** (v7.0 or higher)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd name-name-name-game
   ```

2. **Start with Docker (Recommended)**
   ```bash
   # Start all services (MongoDB, Redis, Backend, Frontend)
   npm run dev
   
   # Or manually with docker-compose
   docker-compose up --build
   ```

3. **Manual Setup (Alternative)**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Start MongoDB and Redis (install separately)
   # Then start backend and frontend in separate terminals
   npm run dev:backend
   npm run dev:frontend
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Documentation**: http://localhost:3001/api/docs

## 🏗 Architecture

### Technology Stack

**Backend:**
- **NestJS** - Node.js framework with TypeScript
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB** - Document database for persistent storage
- **Redis** - In-memory cache for game state and sessions
- **Swagger** - API documentation

**Frontend:**
- **React** with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Socket.IO Client** - Real-time communication

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │────│     Backend     │────│    Database     │
│   (React App)   │    │   (NestJS API)  │    │ (MongoDB/Redis) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
    WebSocket              Real-time Game              Persistent
  Communication              State Logic                  Storage
```

## 📁 Project Structure

```
name-name-name-game/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── room/       # Room management
│   │   │   ├── game/       # Game logic
│   │   │   ├── validation/ # Answer validation
│   │   │   ├── scoring/    # Scoring system
│   │   │   └── ...
│   │   ├── common/         # Shared utilities
│   │   └── config/         # Configuration
│   └── scripts/            # Database scripts
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
├── shared/                 # Shared TypeScript types
└── docker-compose.yml      # Development environment
```

## 🎯 Game Flow

1. **Room Creation**: A player creates a game room with custom settings
2. **Player Joining**: Other players join using a room code
3. **Game Configuration**: Room creator sets categories, time limits, validation method
4. **Round Master Rotation**: Players take turns controlling rounds
5. **Letter Selection**: Either random or player-selected letters
6. **Answer Submission**: Players fill categories with valid words
7. **Validation**: Answers are validated using chosen method
8. **Scoring**: Points awarded for valid and unique answers
9. **Results**: Round results displayed, then next round or game end

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in both backend and frontend directories:

**Backend (.env.local):**
```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/name-name-name-game?authSource=admin
REDIS_URL=redis://:redis123@localhost:6379

# Validation APIs (Optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Game Settings
ROOM_CODE_LENGTH=6
MAX_ROOMS=1000
PLAYER_TIMEOUT=300000
```

**Frontend (.env.local):**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
```

### Game Configuration Options

- **Max Players**: 2-8 players per room
- **Round Time**: 30-600 seconds per round
- **Validation Modes**:
  - Dictionary: Uses predefined word lists
  - AI: OpenAI/Anthropic validation
  - Voting: Players vote on answer validity
  - Hybrid: Combination of methods
- **Letter Selection**:
  - Random: Automatic letter selection
  - Player Choice: Round master selects
  - Round Robin: Systematic rotation

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services with Docker
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build           # Build all applications
npm run build:backend   # Build backend only
npm run build:frontend  # Build frontend only

# Database
npm run seed           # Seed database with sample data

# Utilities
npm run logs           # View all service logs
npm run clean          # Clean Docker containers and volumes
```

### API Documentation

When the backend is running, visit http://localhost:3001/api/docs for interactive API documentation powered by Swagger.

### WebSocket Events

Key real-time events:
- `joinRoom` / `leaveRoom` - Room management
- `startGame` / `gameStarted` - Game lifecycle
- `selectLetter` / `letterSelected` - Letter selection
- `submitAnswers` / `answersSubmitted` - Answer submission
- `roundEnded` / `scoresCalculated` - Round completion

## 🎲 Game Features

### Scoring System

- **Valid Answer**: 10 points
- **Unique Valid Answer**: 15 points (only one player gave this answer)
- **Invalid Answer**: 0 points
- **Empty Answer**: 0 points
- **Completion Bonus**: +5 points for filling all categories

### Validation Methods

1. **Dictionary Validation**: Checks against curated word lists
2. **AI Validation**: Uses language models for sophisticated validation
3. **Player Voting**: Community-driven validation through voting
4. **Hybrid**: Combines multiple methods for best accuracy

### Categories

Default categories include:
- Animals
- Foods
- Cities
- Countries
- Colors
- Sports
- Movies
- Books
- Professions
- Brands

Custom categories can be added per game.

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production containers
docker-compose -f docker-compose.prod.yml up
```

### Environment Setup

1. Set production environment variables
2. Configure MongoDB and Redis instances
3. Set up proper CORS origins
4. Configure SSL/TLS certificates
5. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure WebSocket events are properly handled

## 📝 API Reference

### REST Endpoints

#### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomCode` - Get room information
- `POST /api/rooms/:roomCode/join` - Join a room
- `PATCH /api/rooms/:roomCode/config` - Update room configuration

#### Games
- `POST /api/games/start` - Start a game
- `GET /api/games/:roomCode/state` - Get game state
- `POST /api/games/submit-answers` - Submit answers
- `POST /api/games/select-letter` - Select letter for round

#### Validation
- `POST /api/validation/validate` - Validate a single answer
- `POST /api/validation/validate-batch` - Validate multiple answers
- `GET /api/validation/dictionary/:category` - Get dictionary words

### WebSocket Events

See the API documentation for complete WebSocket event reference.

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**
   - Check if MongoDB and Redis are running
   - Verify environment variables
   - Check Docker container status

2. **WebSocket Problems**
   - Ensure CORS is properly configured
   - Check firewall settings
   - Verify Socket.IO client/server versions

3. **Validation Errors**
   - Check AI API keys if using AI validation
   - Verify dictionary data is properly seeded
   - Check network connectivity for external APIs

### Debug Commands

```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Check container status
docker-compose ps

# Restart services
docker-compose restart backend
```

## 📄 License

This project is licensed under the ISC License. See LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the classic "Name! Name!! Name!!!" word association game
- Built with modern web technologies for real-time multiplayer experience
- Thanks to the open-source community for the amazing tools and libraries

---

**Happy Gaming! 🎮**

For questions or support, please open an issue on GitHub.

# ===== backend/scripts/health-check.js =====
// Health check script for monitoring
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3001,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Backend health check passed');
    process.exit(0);
  } else {
    console.error(`❌ Backend health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`❌ Backend health check failed with error: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Backend health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();

# ===== backend/src/app.controller.ts =====
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponse as CustomApiResponse } from '@name-name-name/shared';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        success: true,
        data: {
          status: 'healthy',
          timestamp: '2024-01-01T00:00:00.000Z',
          uptime: 123.456,
          version: '1.0.0'
        }
      }
    }
  })
  healthCheck(): CustomApiResponse {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({
    status: 200,
    description: 'API information',
  })
  getRoot(): CustomApiResponse {
    return {
      success: true,
      data: {
        name: 'Name! Name!! Name!!! Game API',
        version: '1.0.0',
        documentation: '/api/docs',
        status: 'running',
      },
      message: 'Welcome to the Name! Name!! Name!!! Game API',
      timestamp: new Date(),
    };
  }
}

# ===== backend/scripts/dev-setup.sh =====
#!/bin/bash

echo "🚀 Setting up Name! Name!! Name!!! development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f backend/.env.local ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env.local
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend environment file..."
    cat > frontend/.env.local << EOF
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build shared types
echo "🔧 Building shared types..."
npm run build:shared

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d mongodb redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Seed database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Development environment setup complete!"
echo ""
echo "🎮 To start the game:"
echo "   npm run dev              # Start all services"
echo "   npm run dev:backend      # Start backend only"
echo "   npm run dev:frontend     # Start frontend only"
echo ""
echo "🌐 Access points:"
echo "   Frontend:        http://localhost:3000"
echo "   Backend API:     http://localhost:3001"
echo "   API Docs:        http://localhost:3001/api/docs"
echo ""
echo "Happy gaming! 🎯"

# ===== backend/scripts/cleanup.sh =====
#!/bin/bash

echo "🧹 Cleaning up development environment..."

# Stop and remove containers
echo "🛑 Stopping Docker containers..."
docker-compose down

# Remove volumes (optional - commented out to preserve data)
# echo "🗑️ Removing Docker volumes..."
# docker-compose down -v

# Clean up Docker system (removes unused containers, networks, images)
echo "🧽 Cleaning Docker system..."
docker system prune -f

# Remove node_modules (optional)
read -p "🗂️ Remove node_modules folders? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing node_modules..."
    rm -rf node_modules
    rm -rf backend/node_modules
    rm -rf frontend/node_modules
    rm -rf shared/node_modules
fi

# Remove dist folders
echo "🗑️ Removing build artifacts..."
rm -rf backend/dist
rm -rf frontend/dist
rm -rf shared/dist

echo "✅ Cleanup complete!"

# ===== Makefile =====
.PHONY: help install dev build test clean seed logs

# Default target
help:
	@echo "Name! Name!! Name!!! - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  install     Install all dependencies"
	@echo "  setup       Setup development environment"
	@echo ""
	@echo "Development:"
	@echo "  dev         Start all services with Docker"
	@echo "  dev-local   Start services locally (requires MongoDB/Redis)"
	@echo "  build       Build all applications"
	@echo ""
	@echo "Database:"
	@echo "  seed        Seed database with sample data"
	@echo "  db-reset    Reset database (remove all data)"
	@echo ""
	@echo "Utilities:"
	@echo "  test        Run all tests"
	@echo "  lint        Run linting"
	@echo "  logs        View service logs"
	@echo "  clean       Clean Docker containers and build artifacts"
	@echo ""
	@echo "Health:"
	@echo "  health      Check service health"
	@echo "  status      Show container status"

install:
	npm run install:all

setup:
	chmod +x backend/scripts/dev-setup.sh
	./backend/scripts/dev-setup.sh

dev:
	docker-compose up --build

dev-local:
	npm run dev:backend &
	npm run dev:frontend

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

seed:
	npm run seed

db-reset:
	docker-compose exec mongodb mongo --eval "db.dropDatabase()" name-name-name-game
	npm run seed

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

health:
	node backend/scripts/health-check.js

status:
	docker-compose ps

clean:
	chmod +x backend/scripts/cleanup.sh
	./backend/scripts/cleanup.sh

stop:
	docker-compose down

restart:
	docker-compose restart

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend