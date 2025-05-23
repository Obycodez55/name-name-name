import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameConfig } from '@name-name-name/shared';

export type RoomConfigDocument = RoomConfig & Document;

@Schema({ timestamps: true })
export class RoomConfig {
  @Prop({ required: true, unique: true })
  roomCode: string;

  @Prop({ type: Object, required: true })
  config: GameConfig;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RoomConfigSchema = SchemaFactory.createForClass(RoomConfig);

// Create indexes
RoomConfigSchema.index({ roomCode: 1 }, { unique: true });
RoomConfigSchema.index({ createdAt: -1 });
