import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { ValidationModule } from '@modules/validation/validation.module';
import { ScoringModule } from '@modules/scoring/scoring.module';
import { RoomModule } from '@modules/room/room.module';
import { GameController } from './game.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [ValidationModule, ScoringModule, RoomModule, WebsocketModule],
  providers: [GameService, GameGateway],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}