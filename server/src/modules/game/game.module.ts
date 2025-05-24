import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { ValidationModule } from '@modules/validation/validation.module';
import { ScoringModule } from '@modules/scoring/scoring.module';
import { RoomModule } from '@modules/room/room.module';
import { GameController } from './game.controller';

@Module({
  imports: [ValidationModule, ScoringModule, RoomModule],
  providers: [GameService, GameGateway],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}