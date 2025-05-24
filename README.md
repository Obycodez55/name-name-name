# Name! Name!! Name!!! - Docker Setup Guide

This guide provides everything you need to run the multiplayer word game using Docker containers.

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

- Docker 20.10+ and Docker Compose 2.0+
- Git
- At least 4GB RAM available for containers

### Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd name-name-name-game
   cp .env.example .env
   ```

2. **Start Development Environment**
   ```bash
   # Using the provided script
   chmod +x scripts/dev.sh
   ./scripts/dev.sh

   # Or using make
   make dev

   # Or using docker-compose directly
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - MongoDB: localhost:27017
   - Redis: localhost:6379

## 📦 Container Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │     MongoDB     │
│   React/Vite    │◄──►│     NestJS      │◄──►│   Persistence   │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │   Cache/Sessions│
                       │   Port: 6379    │
                       └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Application
NODE_ENV=development
PORT=3001

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DB_NAME=namegame
MONGODB_URI=mongodb://admin:password123@mongodb:27017/namegame?authSource=admin

# Cache
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000

# External APIs (Optional)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=Name! Name!! Name!!!
```

### Service Configuration

Each service can be configured independently:

- **Backend**: `backend/src/config/`
- **Frontend**: `frontend/vite.config.ts`
- **Database**: `mongodb/init/01-init.js`
- **Proxy**: `nginx/nginx.conf`

## 🐳 Docker Commands

### Development Commands

```bash
# Start all services
make dev
# or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start specific service
docker-compose up backend
docker-compose up frontend

# View logs
make logs
docker-compose logs -f
docker-compose logs -f backend

# Open shell in container
make shell-backend
docker-compose exec backend sh

# Restart services
make restart
docker-compose restart
```

### Production Commands

```bash
# Deploy to production
make prod
# or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Update production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Maintenance Commands

```bash
# Clean up
make clean
docker-compose down -v

# Remove all containers and images
./scripts/cleanup.sh

# View resource usage
docker
```

Files are mounted as volumes, so changes reflect immediately.

### Adding Dependencies

```bash
# Backend dependencies
docker-compose exec backend npm install package-name
# or rebuild
docker-compose build backend

# Frontend dependencies  
docker-compose exec frontend npm install package-name
# or rebuild
docker-compose build frontend
```

### Database Operations

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Connect to Redis
docker-compose exec redis redis-cli

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Import data
docker-compose exec mongodb mongorestore /backup
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission Issues**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER .
   
   # Make scripts executable
   chmod +x scripts/*.sh
   ```

3. **Out of Memory**
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop
   # Or reduce container memory in docker-compose.yml
   ```

4. **Database Connection Failed**
   ```bash
   # Check if MongoDB is healthy
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   
   # Restart database
   docker-compose restart mongodb
   ```

5. **WebSocket Connection Issues**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Verify proxy configuration
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3001/socket.io/
   ```

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3001/health
curl http://localhost:3000/health
```

### Debugging

```bash
# Enable debug mode
export LOG_LEVEL=debug

# View detailed logs
docker-compose logs --tail=100 -f backend

# Connect to container for debugging
docker-compose exec backend sh
npm run start:debug
```

## 📊 Monitoring

### Container Monitoring

```bash
# Resource usage
docker stats

# Disk usage
docker system df

# Network usage
docker network ls
docker network inspect name-name-name-game_name-game-network
```

### Application Monitoring

- **API Documentation**: http://localhost:3001/api/docs
- **Backend Health**: http://localhost:3001/health
- **Frontend Health**: http://localhost:3000/health

### Log Aggregation

Logs are stored in:
- Backend: `backend/logs/`
- Frontend: Browser console
- Nginx: `/var/log/nginx/` (in production)

## 🔒 Security

### Development Security

- Default passwords are used for development
- CORS is configured for localhost
- No HTTPS in development mode

### Production Security

- Change all default passwords
- Use environment variables for secrets
- Enable HTTPS with SSL certificates
- Configure proper CORS origins
- Enable rate limiting

### Secrets Management

```bash
# Create secrets file (don't commit!)
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.secrets
echo "MONGO_ROOT_PASSWORD=$(openssl rand -base64 16)" >> .env.secrets

# Load secrets in production
source .env.secrets
```

## 🚀 Deployment

### Local Production Test

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Test production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Cloud Deployment

The Docker setup is ready for cloud deployment:

- **AWS ECS**: Use the production compose file
- **Google Cloud Run**: Individual service containers
- **DigitalOcean App Platform**: Direct container deployment
- **Kubernetes**: Convert compose to k8s manifests

### Scaling

```bash
# Scale specific services
docker-compose up --scale backend=2
docker-compose up --scale frontend=2

# Load balancing is handled by nginx
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [React Production Build](https://create-react-app.dev/docs/deployment/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [Redis Docker](https://hub.docker.com/_/redis)

## 🤝 Contributing

When contributing:

1. Test changes in development environment
2. Update documentation if needed
3. Ensure all health checks pass
4. Test production build

```bash
# Run full test suite
make test

# Verify production build
make prod
curl http://localhost/health
```

---

**Next Steps**: Once Docker is running, you can start implementing the game features using the provided architecture and guidelines!
