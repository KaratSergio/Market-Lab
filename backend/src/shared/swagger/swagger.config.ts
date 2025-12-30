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
  const defaultDescription = 'Complete E-Commerce system with authentication, products, orders and payments';
  const defaultVersion = '1.0.0';
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
    .addServer(`/${configService.get('GLOBAL_PREFIX', 'api')}`, 'API Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const tagDescriptions = {
    'auth': 'User authentication and authorization endpoints',
    'test-oauth': 'OAuth2 testing and integration',
    'customers': 'Customer profiles and management',
    'suppliers': 'Supplier and vendor management',
    'products': 'Product catalog and inventory management',
    'admin': 'Administrative operations',
    'admin-management': 'System administration',
    'cart': 'Shopping cart operations',
    'orders': 'Order processing and management',
    'payments': 'Payment processing and transactions',
    'payment-webhooks': 'Payment webhook endpoints'
  };

  // Add descriptions only to existing tags
  const existingTags = new Set(document.tags?.map(tag => tag.name) || []);
  document.tags = Object.entries(tagDescriptions)
    .filter(([name]) => existingTags.has(name))
    .map(([name, description]) => ({
      name,
      description
    }));

  const swaggerPath = options?.path || configService.get('SWAGGER_PATH') || defaultPath;
  const siteTitle = options?.siteTitle || configService.get('SWAGGER_SITE_TITLE') || defaultTitle;

  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tagsSorter: (a: string, b: string) => {
        // Sort tags in logical order
        const order = [
          'auth',
          'test-oauth',
          'customers',
          'products',
          'suppliers',
          'cart',
          'orders',
          'payments',
          'payment-webhooks',
          'admin',
          'admin-management'
        ];

        const indexA = order.indexOf(a.toLowerCase());
        const indexB = order.indexOf(b.toLowerCase());

        // If the tag is not found in order, put it at the end
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      },
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
    },
    customCss: `
      /* Toolbar */
      .swagger-ui .topbar { 
        display: none; 
      }
      
      /* Title */
      .swagger-ui .information-container {
        background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        padding: 30px;
        border-radius: 10px;
        color: white;
        margin: 20px auto;
      }
      
      .swagger-ui .info .title {
        color: white !important;
        font-size: 2em !important;
        font-weight: 600;
        margin-bottom: 10px;
      }
      
      .swagger-ui .info .description {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 1.1em;
      }
      
      /* Authorization container */
      .swagger-ui .scheme-container {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        border: 1px solid #e9ecef;
      }
      
      /* style for tags */
      .swagger-ui .opblock-tag {
        font-size: 1.1em;
        font-weight: 600;
        padding: 12px 15px;
        margin: 8px 0;
        border-radius: 8px;
        background: #ffffff;
        border-left: 4px solid #667eea;
        transition: all 0.2s ease;
        text-transform: capitalize;
      }
      
      .swagger-ui .opblock-tag:hover {
        background: #f8f9fa;
        transform: translateX(3px);
      }
      
      .swagger-ui .opblock-tag small {
        font-weight: 400;
        opacity: 0.8;
        margin-left: 8px;
        font-size: 0.9em;
      }
      
      /* Colors for different tag groups */
      .swagger-ui .opblock-tag[data-tag="auth"],
      .swagger-ui .opblock-tag[data-tag="testoauth"] {
        border-left-color: #28a745;
      }
      
      .swagger-ui .opblock-tag[data-tag="customers"] {
        border-left-color: #17a2b8;
      }
      
      .swagger-ui .opblock-tag[data-tag="products"] {
        border-left-color: #007bff;
      }
      
      .swagger-ui .opblock-tag[data-tag="suppliers"] {
        border-left-color: #6f42c1;
      }
      
      .swagger-ui .opblock-tag[data-tag="cart"] {
        border-left-color: #fd7e14;
      }
      
      .swagger-ui .opblock-tag[data-tag="orders"] {
        border-left-color: #e83e8c;
      }
      
      .swagger-ui .opblock-tag[data-tag="payments"],
      .swagger-ui .opblock-tag[data-tag="payment-webhooks"] {
        border-left-color: #20c997;
      }
      
      .swagger-ui .opblock-tag[data-tag="admin"],
      .swagger-ui .opblock-tag[data-tag="admin-management"] {
        border-left-color: #dc3545;
      }
      
      /* Improving readability */
      .swagger-ui .opblock {
        border-radius: 6px;
        margin: 10px 0;
        border: 1px solid #e9ecef;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .swagger-ui .information-container {
          padding: 20px;
        }
        
        .swagger-ui .info .title {
          font-size: 1.6em !important;
        }
      }
    `,
    customSiteTitle: siteTitle,
  });

  console.log(`📚 Swagger документация доступна по адресу: http://localhost:${configService.get('PORT', 9022)}/${swaggerPath.replace(/^\//, '')}`);

  return swaggerPath;
}