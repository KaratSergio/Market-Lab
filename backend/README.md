```
BACKEND

📁 backend/
├── 📁 src/
│   ├── 📄 app.module.ts                          # Root application module
│   ├── 📄 main.ts                                # Application entry point
│   │
│   ├── 📁 system/                                # SYSTEM MODULES
│   │   ├── 📁 database/                          # Database configuration
│   │   │   └── 📄 database.module.ts             # Database connection module
│   │   ├── 📁 scripts/                           # DEPLOYMENT & BUILD SCRIPTS
│   │   │   ├── 📄 seed.ts                        # Database seeding
│   │   │   ├── 📄 migrate.ts                     # Database migrations
│   │   │   └── 📄 super-admin.init.ts            # Super admin initializer service
│   │   └── 📁 cache/                             # Cache configuration
│   │       └── 📄 cache.module.ts                # Cache module
│   │
│   ├── 📁 auth/                                  # AUTHENTICATION & AUTHORIZATION MODULE
│   │   ├── 📁 config/
│   │   │   └── 📄 auth-jwt.config.ts             # JWT configuration
│   │   ├── 📁 encrypt/
│   │   │   ├── 📄 encrypt.module.ts              # Encryption module
│   │   │   └── 📄 encrypt.service.ts             # Password encryption service
│   │   ├── 📁 decorators/
│   │   │   ├── 📄 user.decorator.ts              # User decorator for extracting a user
│   │   │   ├── 📄 auth.decorator.ts              # Combined decorator for protecting routes
│   │   │   ├── 📄 permission.decorator.ts        # Permission decorator for access restriction
│   │   │   ├── 📄 roles.decorator.ts             # Roles decorator for role check
│   │   │   └── 📄 index.ts                       # Export of decorators
│   │   ├── 📁 guard/
│   │   │   ├── 📄 auth-jwt.guard.ts              # JWT token verification
│   │   │   ├── 📄 roles.guard.ts                 # Checking user roles
│   │   │   ├── 📄 permissions.guard.ts           # Checking access permissions
│   │   │   ├── 📄 auth-local.guard.ts            # Local authentication login/password verification
│   │   │   └── 📄 index.ts                       # Export of guards
│   │   ├── 📁 strategy/
│   │   │   ├── 📄 auth-jwt.strategy.ts           # JWT verification and processing
│   │   │   └── 📄 auth-local.strategy.ts         # Checking login and password
│   │   ├── 📁 tokens/
│   │   │   ├── 📄 token.service.ts               # Managing temporary tokens
│   │   │   └── 📄 token.module.ts                # Registering a token service
│   │   ├── 📁 types/
│   │   │   ├── 📄 auth.dto.ts                    # Authentication DTO
│   │   │   ├── 📄 auth.swagger.dto.ts            # Authentication swagger DTO
│   │   │   ├── 📄 auth.type.ts                   # Authentication types
│   │   │   └── 📄 index.ts                       # Export of types
│   │   ├── 📁 types/
│   │   │   ├── 📄 auth.dto.ts                    # Authentication DTO
│   │   │   ├── 📄 auth.swagger.dto.ts            # Authentication swagger DTO
│   │   │   ├── 📄 auth.type.ts                   # Authentication types
│   │   │   └── 📄 index.ts                       # Export of types
│   │   ├── 📁 services/
│   │   │   ├── 📄 auth.service.ts                # Main authentication coordination service
│   │   │   ├── 📄 email-verification.service.ts  # Email verification and confirmation logic
│   │   │   ├── 📄 google-auth.service.ts         # Google OAuth authentication implementation
│   │   │   ├── 📄 password-reset.service.ts      # Password reset and recovery functionality
│   │   │   ├── 📄 permissions.service.ts         # Role-based permissions management
│   │   │   ├── 📄 registration.service.ts        # User registration and role assignment
│   │   │   └── 📄 user.service.ts                # Core user management operations
│   │   ├── 📄 auth.controller.ts                 # Receiving and processing authentication requests
│   │   └── 📄 auth.module.ts                     # Organization of authentication components
│   │
│   ├── 📁 shared/                                # SHARED UTILITIES
│   │   ├── 📁 interfaces/
│   │   │   ├── 📄 repository.interface.ts        # Universal repository contracts
│   │   │   ├── 📄 product-item.interface.ts      # Universal product interface
│   │   │   └── 📄 entity.interface.ts            # Entity interfaces
│   │   ├── 📁 utils/
│   │   │   └── 📄 mapper.ts                      # Data mapping utilities
│   │   ├── 📁 filters/                           # Exception filters
│   │   │   └── 📄 all-exceptions.filter.ts       # Global exception handler
│   │   └── 📁 pipes/                             # Custom pipes
│   │
│   ├── 📁 domain/                                # DOMAIN LAYER (business logic)
│   │   ├── 📁 users/                             # Users domain
│   │   │   ├── 📄 user.entity.ts                 # User business entity
│   │   │   ├── 📄 user.repository.ts             # User repository interface
│   │   │   ├── 📄 user.service.ts                # User business logic
│   │   │   └── 📁 types/
│   │   │       ├── 📄 user.dto.ts
│   │   │       └── 📄 user.type.ts
│   │   ├── 📁 products/                          # Products domain
│   │   │   ├── 📄 product.entity.ts              # Product business entity
│   │   │   ├── 📄 product.repository.ts          # Product repository interface
│   │   │   ├── 📄 product.service.ts             # Product business logic
│   │   │   └── 📁 types/
│   │   │       ├── 📄 product.dto.ts             # Product DTOs
│   │   │       └── 📄 product.type.ts            # Product types
│   │   ├── 📁 customers/                         # Customers domain
│   │   │   ├── 📄 customer.entity.ts             # Customer business entity
│   │   │   ├── 📄 customer.repository.ts         # Customer repository interface
│   │   │   ├── 📄 customer.service.ts            # Customer business logic
│   │   │   └── 📁 types/
│   │   │       ├── 📄 customer.dto.ts            # Customer DTOs
│   │   │       └── 📄 customer.type.ts           # Customer types
│   │   └── 📁 suppliers/                         # Suppliers domain
│   │       ├── 📄 supplier.entity.ts             # Supplier business entity
│   │       ├── 📄 supplier.repository.ts         # Supplier repository interface
│   │       ├── 📄 supplier.service.ts            # Supplier business logic
│   │       └── 📁 types/
│   │           ├── 📄 supplier.dto.ts            # Supplier DTOs
│   │           └── 📄 supplier.type.ts           # Supplier types
│   │
│   ├── 📁 infrastructure/                        # INFRASTRUCTURE LAYER
│   │   ├── 📁 database/                          # DATABASE IMPLEMENTATIONS
│   │   │   ├── 📁 mongodb/                       # MongoDB implementation
│   │   │   │   └── 📄 ...                        # MongoDB files
│   │   │   └── 📁 postgres/                      # PostgreSQL implementation
│   │   │       ├── 📁 users/                     
│   │   │       │   ├── 📄 user.entity.ts         # TypeORM user entity
│   │   │       │   └── 📄 user.repository.ts     # PostgreSQL user repository
│   │   │       ├── 📁 products/
│   │   │       │   ├── 📄 product.entity.ts      # TypeORM product entity
│   │   │       │   └── 📄 product.repository.ts  # PostgreSQL product repository
│   │   │       ├── 📁 customers/
│   │   │       │   ├── 📄 customer.entity.ts     # TypeORM customer entity
│   │   │       │   └── 📄 customer.repository.ts # PostgreSQL customer repository
│   │   │       └── 📁 suppliers/
│   │   │           ├── 📄 supplier.entity.ts     # TypeORM supplier entity
│   │   │           └── 📄 supplier.repository.ts # PostgreSQL supplier repository
│   │   │
│   │   ├── 📁 mail/                              # Mail providers
│   │   │   ├── 📄 mail.module.ts                 # Mail module
│   │   │   └── 📄 mail.service.ts/               # Mail service
│   │   │
│   │   ├── 📁 oauth/                             # OAuth providers
│   │   │   ├── 📁 facebook/                      # Facebook OAuth implementation
│   │   │   │   └── 📄 ...                        # Facebook OAuth files
│   │   │   └── 📁 google/                        # Google OAuth implementation
│   │   │       ├── 📄 google-oauth.service.ts    # Google OAuth service implementation
│   │   │       ├── 📄 google-oauth.module.ts     # NestJS module for Google OAuth
│   │   │       ├── 📄 google-oauth.config.ts     # Configuration for Google OAuth
│   │   │       ├── 📄 google-user.mapper.ts      # Mapper: Google user ↔ Domain user
│   │   │       ├── 📄 google-user.type.ts        # TypeScript types for Google OAuth
│   │   │       └── 📄 google-oauth.controller.ts # Test controller for Google OAuth
│   │   │
│   │   └── 📁 redis/                             # Redis implementations
│   │       └── 📄 redis-cache.service.ts         # Redis cache service
│   │
│   ├── 📁 module/                                # FEATURE MODULES
│   │   ├── 📄 admin.module.ts                    # Admin module
│   │   ├── 📄 cart.module.ts                     # Cart module
│   │   ├── 📄 order.module.ts                    # Order module
│   │   ├── 📄 payment.module.ts                  # Payment module
│   │   ├── 📄 product.module.ts                  # Products module
│   │   ├── 📄 suppliers.module.ts                # Suppliers module
│   │   ├── 📄 users.module.ts                    # Users module
│   │   └── 📄 customers.module.ts                # Customers module
│   │
│   └── 📁 controller/                            # API CONTROLLERS
│       ├── 📁 admin/                             # REST API for admin panel
│       ├── 📁 payment/                           # REST API for payments
│       ├── 📄 products.controller.ts             # REST API for products
│       ├── 📄 suppliers.controller.ts            # REST API for Suppliers
│       ├── 📄 customers.controller.ts            # REST API for Customers
│       └── 📄 health.controller.ts               # Health check controller
│
├── 📁 test/                                     # TEST FILES
│   ├── 📁 unit/                                 # Unit tests
│   ├── 📁 e2e/                                  # End-to-end tests
│   └── 📄 jest.config.ts                        # Jest configuration
│
├── 📁 docs/                                     # DOCUMENTATION
│   ├── 📄 api.md                                # API documentation
│   ├── 📄 architecture.md                       # Architecture overview
│   └── 📄 deployment.md                         # Deployment guide
│
├── 📄 .env.example                              # Environment variables example
├── 📄 .env.development                          # Development environment
├── 📄 .env.production                           # Production environment
├── 📄 .env.test                                 # Test environment
├── 📄 package.json                              # Dependencies & scripts
├── 📄 tsconfig.json                             # TypeScript configuration
├── 📄 nest-cli.json                             # NestJS CLI configuration
├── 📄 dockerfile                                # Docker configuration
├── 📄 docker-compose.yml                        # Docker compose setup
└── 📄 README.md                                 # Project documentation
```
