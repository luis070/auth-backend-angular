import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  app.useGlobalPipes( 
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );
  // en este va la salida de lpuerte este se da por el equipo aqui no existe port pero es para adelantar
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
