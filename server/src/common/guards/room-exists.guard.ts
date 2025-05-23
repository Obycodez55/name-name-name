import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
// import { RoomService } from '@modules/room/room.service';

@Injectable()
export class RoomExistsGuard implements CanActivate {
//   constructor(private readonly roomService: RoomService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roomCode = request.params.roomCode;

    if (!roomCode) {
      throw new NotFoundException('Room code is required');
    }

    // const roomExists = await this.roomService.roomExists(roomCode);
    // if (!roomExists) {
    //   throw new NotFoundException(`Room with code ${roomCode} not found`);
    // }

    return true;
  }
}