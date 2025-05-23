import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      url: this.configService.get<string>('redis.url'),
      password: this.configService.get<string>('redis.password'),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // Basic key operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    if (ttl) {
      await this.client.setEx(prefixedKey, ttl, value);
    } else {
      await this.client.set(prefixedKey, value);
    }
  }

  async get(key: string): Promise<string | null> {
    const prefixedKey = this.getPrefixedKey(key);
    const result = await this.client.get(prefixedKey);
    if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
      return null;
    }
    return String(result);
  }

  async delete(key: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.del(prefixedKey);
  }

  async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    return (await this.client.exists(prefixedKey)) === 1;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    return (await this.client.expire(prefixedKey, seconds)) === 1;
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.hSet(prefixedKey, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    const prefixedKey = this.getPrefixedKey(key);
    const result = await this.client.hGet(prefixedKey, field);
    if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
      return null;
    }
    return String(result);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.hGetAll(prefixedKey);
  }

  async hDel(key: string, field: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.hDel(prefixedKey, field);
  }

  async hExists(key: string, field: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    return (await this.client.hExists(prefixedKey, field)) === 1;
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.sAdd(prefixedKey, member);
  }

  async sRem(key: string, member: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.sRem(prefixedKey, member);
  }

  async sMembers(key: string): Promise<string[]> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.sMembers(prefixedKey);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    return (await this.client.sIsMember(prefixedKey, member)) === 1;
  }

  // Sorted set operations
  async zAdd(key: string, score: number, member: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.zAdd(prefixedKey, { score, value: member });
  }

  async zRem(key: string, member: string): Promise<number> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.zRem(prefixedKey, member);
  }

  async zRangeWithScores(key: string, start: number, stop: number): Promise<Array<{ value: string; score: number }>> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.zRangeWithScores(prefixedKey, start, stop);
  }

  async zRevRangeWithScores(key: string, start: number, stop: number): Promise<Array<{ value: string; score: number }>> {
    const prefixedKey = this.getPrefixedKey(key);
    return await this.client.zRangeWithScores(prefixedKey, start, stop, { REV: true });
  }

  // JSON operations for complex objects
  async setObject(key: string, object: any, ttl?: number): Promise<void> {
    const value = JSON.stringify(object);
    await this.set(key, value, ttl);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Failed to parse JSON for key ${key}:`, error);
      return null;
    }
  }

  // Batch operations
  async multi() {
    return this.client.multi();
  }

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    const keys = await this.client.keys(prefixedPattern);
    // Remove prefix from returned keys
    const prefix = this.configService.get<string>('redis.keyPrefix');
    return keys.map(key => key.replace(prefix, ''));
  }

  async deletePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;
    
    const prefixedKeys = keys.map(key => this.getPrefixedKey(key));
    return await this.client.del(prefixedKeys);
  }

  // Game-specific utility methods
  async setRoomData(roomCode: string, data: any, ttl?: number): Promise<void> {
    await this.setObject(`room:${roomCode}`, data, ttl);
  }

  async getRoomData<T>(roomCode: string): Promise<T | null> {
    return await this.getObject<T>(`room:${roomCode}`);
  }

  async deleteRoomData(roomCode: string): Promise<number> {
    return await this.deletePattern(`room:${roomCode}*`);
  }

  async setPlayerData(playerId: string, data: any, ttl?: number): Promise<void> {
    await this.setObject(`player:${playerId}`, data, ttl);
  }

  async getPlayerData<T>(playerId: string): Promise<T | null> {
    return await this.getObject<T>(`player:${playerId}`);
  }

  async addPlayerToRoom(roomCode: string, playerId: string): Promise<number> {
    return await this.sAdd(`room:${roomCode}:players`, playerId);
  }

  async removePlayerFromRoom(roomCode: string, playerId: string): Promise<number> {
    return await this.sRem(`room:${roomCode}:players`, playerId);
  }

  async getRoomPlayers(roomCode: string): Promise<string[]> {
    return await this.sMembers(`room:${roomCode}:players`);
  }

  async setGameState(roomCode: string, gameState: any, ttl?: number): Promise<void> {
    await this.setObject(`room:${roomCode}:game`, gameState, ttl);
  }

  async getGameState<T>(roomCode: string): Promise<T | null> {
    return await this.getObject<T>(`room:${roomCode}:game`);
  }

  async setRoundAnswers(roomCode: string, roundNumber: number, playerId: string, answers: any): Promise<void> {
    await this.setObject(`room:${roomCode}:round:${roundNumber}:answers:${playerId}`, answers);
  }

  async getRoundAnswers<T>(roomCode: string, roundNumber: number, playerId: string): Promise<T | null> {
    return await this.getObject<T>(`room:${roomCode}:round:${roundNumber}:answers:${playerId}`);
  }

  async getAllRoundAnswers(roomCode: string, roundNumber: number): Promise<Record<string, any>> {
    const keys = await this.keys(`room:${roomCode}:round:${roundNumber}:answers:*`);
    const answers: Record<string, any> = {};
    
    for (const key of keys) {
      const playerId = key.split(':').pop();
      if (playerId) {
        answers[playerId] = await this.getObject(key);
      }
    }
    
    return answers;
  }

  private getPrefixedKey(key: string): string {
    const prefix = this.configService.get<string>('redis.keyPrefix');
    return `${prefix}${key}`;
  }

  // Health check
  async ping(): Promise<string> {
    return await this.client.ping();
  }
}