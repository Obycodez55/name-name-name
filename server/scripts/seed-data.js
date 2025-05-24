// Database seeding script for development
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/name-name-name-game';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Clear existing data in development
    console.log('Clearing existing data...');
    await db.collection('gamehistories').deleteMany({});
    await db.collection('roomconfigs').deleteMany({});
    
    // Seed sample game history
    console.log('Seeding sample game history...');
    const sampleGameHistory = {
      gameId: 'sample-game-1',
      roomCode: 'DEMO01',
      roomName: 'Sample Game Room',
      creatorId: 'player-1',
      config: {
        maxPlayers: 4,
        roundTimeLimit: 180,
        validationMode: 'dictionary',
        letterSelectionMode: 'random',
        categories: ['Animals', 'Foods', 'Cities'],
        maxRounds: 3,
        enableChat: true,
        allowSpectators: false
      },
      players: [
        {
          id: 'player-1',
          name: 'Alice',
          role: 'creator',
          status: 'online',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          isReady: true
        },
        {
          id: 'player-2',
          name: 'Bob',
          role: 'player',
          status: 'online',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          isReady: true
        },
        {
          id: 'player-3',
          name: 'Charlie',
          role: 'player',
          status: 'online',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          isReady: true
        }
      ],
      rounds: [
        {
          roundNumber: 1,
          letter: 'A',
          categories: ['Animals', 'Foods', 'Cities'],
          timeLimit: 180,
          startTime: new Date(Date.now() - 300000), // 5 minutes ago
          endTime: new Date(Date.now() - 120000),   // 2 minutes ago
          roundMasterId: 'player-1',
          answers: {
            'player-1': {
              playerId: 'player-1',
              answers: { 'Animals': 'Antelope', 'Foods': 'Apple', 'Cities': 'Amsterdam' },
              submittedAt: new Date(Date.now() - 150000),
              isComplete: true
            },
            'player-2': {
              playerId: 'player-2',
              answers: { 'Animals': 'Ant', 'Foods': 'Apple', 'Cities': 'Atlanta' },
              submittedAt: new Date(Date.now() - 140000),
              isComplete: true
            },
            'player-3': {
              playerId: 'player-3',
              answers: { 'Animals': 'Alligator', 'Foods': 'Avocado', 'Cities': 'Austin' },
              submittedAt: new Date(Date.now() - 130000),
              isComplete: true
            }
          },
          scores: {
            'player-1': 25,
            'player-2': 20,
            'player-3': 30
          }
        }
      ],
      finalScores: {
        'player-1': 25,
        'player-2': 20,
        'player-3': 30
      },
      winner: 'player-3',
      gameStartTime: new Date(Date.now() - 600000),
      gameEndTime: new Date(Date.now() - 60000),
      totalRounds: 1,
      gameDuration: 540,
      completedAt: new Date(Date.now() - 60000)
    };
    
    await db.collection('gamehistories').insertOne(sampleGameHistory);
    
    // Seed sample room configs
    console.log('Seeding sample room configurations...');
    const sampleConfigs = [
      {
        roomCode: 'QUICK1',
        config: {
          maxPlayers: 4,
          roundTimeLimit: 60,
          validationMode: 'dictionary',
          letterSelectionMode: 'random',
          categories: ['Animals', 'Foods'],
          maxRounds: 2,
          enableChat: true,
          allowSpectators: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roomCode: 'CUSTOM',
        config: {
          maxPlayers: 6,
          roundTimeLimit: 300,
          validationMode: 'voting',
          letterSelectionMode: 'player_choice',
          categories: ['Animals', 'Foods', 'Cities', 'Countries', 'Sports'],
          maxRounds: 5,
          enableChat: true,
          allowSpectators: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('roomconfigs').insertMany(sampleConfigs);
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
