import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { GAME_CONSTANTS } from '@name-name-name/shared';

@Injectable()
export class RoomCodeValidationPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('Room code is required');
    }

    if (value.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH) {
      throw new BadRequestException(
        `Room code must be ${GAME_CONSTANTS.ROOM_CODE_LENGTH} characters long`
      );
    }

    if (!/^[A-Z0-9]+$/.test(value.toUpperCase())) {
      throw new BadRequestException('Room code can only contain letters and numbers');
    }

    return value.toUpperCase();
  }
}