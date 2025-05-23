import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameHistory, GameHistoryDocument } from './schemas/game-history.schema';
import { RoomConfig, RoomConfigDocument } from './schemas/room-config.schema';
import { Dictionary, DictionaryDocument } from './schemas/dictionary.schema';
import { GameState, Room, ValidationResult } from '@name-name-name/shared';
import { DatabaseInterface } from '../interfaces/database.interface';

@Injectable()
export class MongodbService implements DatabaseInterface {
  private readonly logger = new Logger(MongodbService.name);

  constructor(
    @InjectModel(GameHistory.name) private gameHistoryModel: Model<GameHistoryDocument>,
    @InjectModel(RoomConfig.name) private roomConfigModel: Model<RoomConfigDocument>,
    @InjectModel(Dictionary.name) private dictionaryModel: Model<DictionaryDocument>,
  ) {}

  // Game History operations
  async saveGameHistory(gameState: GameState, room: Room): Promise<GameHistory> {
    try {
      const gameHistory = new this.gameHistoryModel({
        gameId: gameState.gameId,
        roomCode: gameState.roomCode,
        roomName: room.name,
        creatorId: room.creatorId,
        config: gameState.config,
        players: Object.values(gameState.players),
        rounds: gameState.rounds,
        finalScores: gameState.scores,
        winner: gameState.winner,
        gameStartTime: gameState.gameStartTime,
        gameEndTime: gameState.gameEndTime,
        totalRounds: gameState.rounds.length,
        gameDuration: gameState.gameEndTime && gameState.gameStartTime 
          ? Math.floor((gameState.gameEndTime.getTime() - gameState.gameStartTime.getTime()) / 1000)
          : 0,
        completedAt: new Date(),
      });

      return await gameHistory.save();
    } catch (error) {
      this.logger.error('Failed to save game history:', error);
      throw error;
    }
  }

  async getGameHistory(
    page: number = 1,
    limit: number = 10,
    filters?: {
      playerId?: string;
      roomCode?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ games: GameHistory[]; total: number }> {
    try {
      const query: any = {};
      
      if (filters?.playerId) {
        query['players.id'] = filters.playerId;
      }
      
      if (filters?.roomCode) {
        query.roomCode = filters.roomCode;
      }
      
      if (filters?.dateFrom || filters?.dateTo) {
        query.completedAt = {};
        if (filters.dateFrom) query.completedAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.completedAt.$lte = filters.dateTo;
      }

      const [games, total] = await Promise.all([
        this.gameHistoryModel
          .find(query)
          .sort({ completedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
        this.gameHistoryModel.countDocuments(query).exec(),
      ]);

      return { games, total };
    } catch (error) {
      this.logger.error('Failed to get game history:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string): Promise<any> {
    try {
      const games = await this.gameHistoryModel
        .find({ 'players.id': playerId })
        .lean()
        .exec();

      const totalGames = games.length;
      const wins = games.filter(game => game.winner === playerId).length;
      const totalScore = games.reduce((sum, game) => sum + (game.finalScores[playerId] || 0), 0);
      const averageScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

      return {
        totalGames,
        wins,
        winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        totalScore,
        averageScore,
        favoriteCategories: [], // Could be calculated from rounds data
      };
    } catch (error) {
      this.logger.error('Failed to get player stats:', error);
      throw error;
    }
  }

  // Room Configuration operations
  async saveRoomConfig(roomCode: string, config: any): Promise<RoomConfig> {
    try {
      const roomConfig = await this.roomConfigModel.findOneAndUpdate(
        { roomCode },
        { 
          roomCode,
          config,
          updatedAt: new Date(),
        },
        { 
          upsert: true,
          new: true,
        }
      );

      return roomConfig;
    } catch (error) {
      this.logger.error('Failed to save room config:', error);
      throw error;
    }
  }

  async getRoomConfig(roomCode: string): Promise<RoomConfig | null> {
    try {
      return await this.roomConfigModel.findOne({ roomCode }).lean().exec();
    } catch (error) {
      this.logger.error('Failed to get room config:', error);
      throw error;
    }
  }

  // Dictionary operations
  async getDictionaryWords(category: string): Promise<string[]> {
    try {
      const dictionary = await this.dictionaryModel
        .findOne({ category: category.toLowerCase() })
        .lean()
        .exec();

      return dictionary?.words || [];
    } catch (error) {
      this.logger.error(`Failed to get dictionary for category ${category}:`, error);
      throw error;
    }
  }

  async addDictionaryWords(category: string, words: string[]): Promise<Dictionary> {
    try {
      const dictionary = await this.dictionaryModel.findOneAndUpdate(
        { category: category.toLowerCase() },
        { 
          $addToSet: { words: { $each: words.map(word => word.toLowerCase()) } },
          updatedAt: new Date(),
        },
        { 
          upsert: true,
          new: true,
        }
      );

      return dictionary;
    } catch (error) {
      this.logger.error(`Failed to add words to dictionary ${category}:`, error);
      throw error;
    }
  }

  async validateDictionaryWord(category: string, word: string): Promise<boolean> {
    try {
      const dictionary = await this.dictionaryModel
        .findOne({ 
          category: category.toLowerCase(),
          words: word.toLowerCase(),
        })
        .lean()
        .exec();

      return !!dictionary;
    } catch (error) {
      this.logger.error(`Failed to validate word ${word} in category ${category}:`, error);
      return false;
    }
  }

  // Utility methods
  async cleanup(): Promise<void> {
    try {
      // Clean up old game histories (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      await this.gameHistoryModel.deleteMany({
        completedAt: { $lt: ninetyDaysAgo }
      });

      this.logger.log('Cleanup completed successfully');
    } catch (error) {
      this.logger.error('Failed to perform cleanup:', error);
    }
  }

  async getStats(): Promise<any> {
    try {
      const [totalGames, totalPlayers, categoriesCount] = await Promise.all([
        this.gameHistoryModel.countDocuments().exec(),
        this.gameHistoryModel.distinct('players.id').exec(),
        this.dictionaryModel.countDocuments().exec(),
      ]);

      return {
        totalGames,
        totalPlayers: totalPlayers.length,
        categoriesCount,
      };
    } catch (error) {
      this.logger.error('Failed to get stats:', error);
      throw error;
    }
  }
}