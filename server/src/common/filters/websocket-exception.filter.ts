import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    
    let error = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    
    if (exception instanceof WsException) {
      error = exception.message;
      code = 'WS_ERROR';
    } else if (exception instanceof Error) {
      error = exception.message;
      code = 'ERROR';
    }

    client.emit('error', {
      success: false,
      error: code,
      message: error,
      timestamp: new Date(),
    });
  }
}
