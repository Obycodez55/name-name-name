import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis-yet';

import { RoomModule } from './modules/room/room.module';
import { GameModule } from './modules/game/game.module';
import { ValidationModule } from './modules/validation/validation.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { PersistenceModule } from './modules/persistence/persistence.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import config from './config'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [config],
      cache: true,
    }),
    
    // MongoDB
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    
    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get<string>('redis.url'),
        ttl: 300, // 5 minutes default TTL
      }),
      inject: [ConfigService],
    }),
    
    // Game modules
    RoomModule,
    GameModule,
    ValidationModule,
    ScoringModule,
    PersistenceModule,
    WebsocketModule,
  ],
})
export class AppModule {}
