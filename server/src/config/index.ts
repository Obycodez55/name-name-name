
export default () => ({
  app: {
    port: parseInt(process.env.PORT!, 10) || 3001,
    url: process.env.APP_URL || 'http://localhost:3001',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/name-name-name-game',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT!, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'name-game:',
    db: parseInt(process.env.REDIS_DB!, 10) || 0,
  },
  validation: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    wordnikApiKey: process.env.WORDNIK_API_KEY || '',
  },
});