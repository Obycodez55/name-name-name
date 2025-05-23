import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameHistory, GameHistorySchema } from './schemas/game-history.schema';
import { RoomConfig, RoomConfigSchema } from './schemas/room-config.schema';
import { MongodbService } from './mongodb.service';
import { Dictionary, DictionarySchema } from './schemas/dictionary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameHistory.name, schema: GameHistorySchema },
      { name: RoomConfig.name, schema: RoomConfigSchema },
      { name: Dictionary.name, schema: DictionarySchema },
    ]),
  ],
  providers: [MongodbService],
  exports: [MongodbService],
})
export class MongodbModule {}