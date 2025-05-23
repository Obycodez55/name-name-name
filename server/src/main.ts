import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get config service
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api/v1')
  
  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));
  const port = configService.get('app.port', 3001);
  
  // Swagger Documentation Setup
    const config = new DocumentBuilder()
      .setTitle('Name! Name!! Name!!! Game API')
      .setDescription('Multiplayer word association game API documentation')
      .setVersion('1.0')
      .addTag('rooms', 'Room management endpoints')
      .addTag('games', 'Game logic and round management')
      .addTag('validation', 'Answer validation endpoints')
      .addTag('scoring', 'Scoring system endpoints')
      .addTag('websocket', 'Real-time communication events')
      .addServer(`http://localhost:${configService.get('PORT', 3001)}`, 'Development server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });
    
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        syntaxHighlight: {
          activate: true,
          theme: 'arta'
        },
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #3b82f6; }
      `,
      customSiteTitle: 'Name! Name!! Name!!! API Documentation',
    });

    console.log(`📚 Swagger documentation available at: ${configService.get('app.url', `http://localhost:${port}`)}/api/docs`);
  
  // Start server
  await app.listen(port);

  console.log(`🚀 Application is running on: ${configService.get('app.url', `http://localhost:${port}`)}`);
}
bootstrap();