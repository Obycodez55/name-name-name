import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RoomCode = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.params.roomCode;
  },
);