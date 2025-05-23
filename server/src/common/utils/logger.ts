import { Logger } from '@nestjs/common';

export class GameLogger extends Logger {
  logRoomEvent(roomCode: string, event: string, data?: any) {
    this.log(`[${roomCode}] ${event}`, data ? JSON.stringify(data) : '');
  }

  logPlayerEvent(roomCode: string, playerId: string, event: string, data?: any) {
    this.log(`[${roomCode}][${playerId}] ${event}`, data ? JSON.stringify(data) : '');
  }

  logGameEvent(roomCode: string, round: number, event: string, data?: any) {
    this.log(`[${roomCode}][Round ${round}] ${event}`, data ? JSON.stringify(data) : '');
  }

  logError(context: string, error: Error, metadata?: any) {
    this.error(`${context}: ${error.message}`, error.stack, metadata ? JSON.stringify(metadata) : '');
  }
}