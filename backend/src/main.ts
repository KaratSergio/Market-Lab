import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createSwaggerConfig } from './shared/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Middleware
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8080', // For Swagger UI
      configService.get('FRONTEND_URL'),
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  // Global API prefix
  const globalPrefix = configService.get('GLOBAL_PREFIX', 'api');
  app.setGlobalPrefix(globalPrefix);

  // Swagger Configuration (only in non-production or if explicitly enabled)
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const enableSwagger = configService.get('ENABLE_SWAGGER', nodeEnv !== 'production') === 'true';

  if (enableSwagger) {
    createSwaggerConfig(app, {
      title: configService.get('SWAGGER_TITLE'),
      description: configService.get('SWAGGER_DESCRIPTION'),
      version: configService.get('API_VERSION'),
      path: configService.get('SWAGGER_PATH'),
    });
  }

  // Start application
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  // Log startup information
  console.log('\n🚀 Application Started Successfully');
  console.log('━'.repeat(50));
  console.log(`📦 Environment: ${nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${port}/${globalPrefix}`);
  console.log(`🌐 Frontend URL: ${configService.get('FRONTEND_URL') || 'Not configured'}`);

  if (enableSwagger) {
    const swaggerPath = configService.get('SWAGGER_PATH', 'api/docs');
    console.log(`📚 Swagger Docs: http://localhost:${port}/${swaggerPath}`);
  }

  console.log('━'.repeat(50));
  console.log('✅ Server is ready to handle requests\n');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});