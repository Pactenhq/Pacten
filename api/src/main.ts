import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  // bodyParser:false so we can mount a RAW parser on the Stripe webhook path
  // (Stripe signatures can only be verified against the raw bytes).
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Must come BEFORE the JSON parser: body-parser skips routes whose body
  // was already parsed (req._body), so the webhook keeps its raw Buffer.
  app.use(
    '/api/v1/payments/webhook',
    express.raw({ type: 'application/json' }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
