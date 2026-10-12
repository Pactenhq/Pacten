import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [
      frontendUrl,
      'https://pacten-mahmadv3101-cpus-projects.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Pacten API running on port ${port}`);
}
bootstrap();
