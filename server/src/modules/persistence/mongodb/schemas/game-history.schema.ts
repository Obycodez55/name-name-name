import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameConfig, Player, Round } from '@name-name-name/shared';

export type GameHistoryDocument = GameHistory & Document;

@Schema({ timestamps: true })
export class GameHistory {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  roomCode: string;

  @Prop()
  roomName?: string;

  @Prop({ required: true })
  creatorId: string;

  @Prop({ type: Object, required: true })
  config: GameConfig;

  @Prop([{ type: Object }])
  players: Player[];

  @Prop([{ type: Object }])
  rounds: Round[];

  @Prop({ type: Object })
  finalScores: Record<string, number>;

  @Prop()
  winner?: string;

  @Prop()
  gameStartTime?: Date;

  @Prop()
  gameEndTime?: Date;

  @Prop({ required: true })
  totalRounds: number;

  @Prop({ required: true, default: 0 })
  gameDuration: number; // in seconds

  @Prop({ required: true, default: Date.now })
  completedAt: Date;
}

export const GameHistorySchema = SchemaFactory.createForClass(GameHistory);

// Create indexes for common queries
GameHistorySchema.index({ roomCode: 1 });
GameHistorySchema.index({ 'players.id': 1 });
GameHistorySchema.index({ completedAt: -1 });
GameHistorySchema.index({ creatorId: 1 });
GameHistorySchema.index({ winner: 1 });