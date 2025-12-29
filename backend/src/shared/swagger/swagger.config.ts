import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export interface SwaggerOptions {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  siteTitle?: string;
}

export function createSwaggerConfig(app: INestApplication, options?: SwaggerOptions) {
  const configService = app.get(ConfigService);

  const defaultTitle = 'E-Commerce API';
  const defaultDescription = 'E-Commerce system API documentation';
  const defaultVersion = '1.0';
  const defaultPath = 'api/docs';

  const config = new DocumentBuilder()
    .setTitle(options?.title || configService.get('SWAGGER_TITLE') || defaultTitle)
    .setDescription(options?.description || configService.get('SWAGGER_DESCRIPTION') || defaultDescription)
    .setVersion(options?.version || configService.get('API_VERSION') || defaultVersion)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    }, 'JWT-auth')
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
      description: 'Refresh token cookie for authentication'
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management')
    .addTag('customers', 'Customer management')
    .addTag('suppliers', 'Supplier management')
    .addTag('admin', 'Admin operations')
    .addTag('cart', 'Shopping cart operations')
    .addTag('orders', 'Order management')
    .addTag('payments', 'Payment processing')
    .addServer(`/${configService.get('GLOBAL_PREFIX', 'api')}`, 'API Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerPath = options?.path || configService.get('SWAGGER_PATH') || defaultPath;
  const siteTitle = options?.siteTitle || configService.get('SWAGGER_SITE_TITLE') || defaultTitle;

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { 
        display: none; 
      }
      .swagger-ui .information-container { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 10px;
        color: white;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .swagger-ui .info .title { 
        color: white !important;
        font-size: 2em !important;
      }
      .swagger-ui .info .description { 
        color: rgba(255,255,255,0.9) !important;
      }
      .swagger-ui .scheme-container { 
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .swagger-ui .opblock-tag {
        font-size: 1.2em;
        padding: 10px 0;
        border-bottom: 2px solid #667eea;
      }
    `,
    customSiteTitle: siteTitle,
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-standalone-preset.js',
    ],
  });

  return swaggerPath;
}