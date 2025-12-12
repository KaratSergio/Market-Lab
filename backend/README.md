```
src/
├── app.module.ts                          # Root application module
├── main.ts                                # Application entry point
│
├── system/                                # SYSTEM MODULES
│   ├── database/                          # Database configuration
│   │   └── database.module.ts             # Database connection module
│   └── cache/                             # Cache configuration
│       └── cache.module.ts                # Cache module
│
├── auth/                                  # Authentication & authorization module
│   ├── config/
│   │   └── auth-jwt.config.ts             # JWT configuration
│   ├── encrypt/
│   │   ├── encrypt.module.ts              # Encryption module
│   │   └── encrypt.service.ts             # Password encryption service
│   ├── guard/
│   │   ├── auth-jwt.guard.ts              # JWT authentication guard
│   │   └── auth-local.guard.ts            # Local authentication guard
│   ├── strategy/
│   │   ├── auth-jwt.strategy.ts           # JWT strategy
│   │   └── auth-local.strategy.ts         # Local authentication strategy
│   ├── types/
│   │   └── auth.type.ts                   # Authentication types
│   ├── auth.controller.ts                 # Authentication controller
│   ├── auth.module.ts                     # Authentication module
│   └── auth.service.ts                    # Authentication service
│
├── shared/                                # SHARED UTILITIES
│   ├── interfaces/
│   │   ├── repository.interface.ts        # Universal repository contracts
│   │   └── entity.interface.ts            # Entity interfaces
│   ├── utils/
│   │   └── mapper.ts                      # Data mapping utilities
│   ├── filters/                           # Exception filters
│   │   └── all-exceptions.filter.ts       # Global exception handler
│   └── pipes/                             # Custom pipes
│
├── domain/                                # DOMAIN LAYER (business logic)
│   ├── users/                             # Users domain
│   │   ├── user.entity.ts                 # User business entity
│   │   ├── user.repository.ts             # User repository interface
│   │   ├── user.service.ts                # User business logic
│   │   └── types/
│   │       ├── user.dto.ts
│   │       └── user.type.ts
│   ├── products/                          # Products domain
│   │   ├── product.entity.ts              # Product business entity
│   │   ├── product.repository.ts          # Product repository interface
│   │   ├── product.service.ts             # Product business logic
│   │   └── types/
│   │       ├── product.dto.ts             # Product DTOs
│   │       └── product.type.ts            # Product types
│   ├── customers/                         # Customers domain
│   │   ├── customer.entity.ts             # Customer business entity
│   │   ├── customer.repository.ts         # Customer repository interface
│   │   ├── customer.service.ts            # Customer business logic
│   │   └── types/
│   │       ├── customer.dto.ts            # Customer DTOs
│   │       └── customer.type.ts           # Customer types
│   └── suppliers/                         # Suppliers domain
│       ├── supplier.entity.ts             # Supplier business entity
│       ├── supplier.repository.ts         # Supplier repository interface
│       ├── supplier.service.ts            # Supplier business logic
│       └── types/
│           ├── supplier.dto.ts            # Supplier DTOs
│           └── supplier.type.ts           # Supplier types
│
├── infrastructure/                        # INFRASTRUCTURE LAYER
│   ├── database/                          # DATABASE IMPLEMENTATIONS
│   │   ├── mongodb/                       # MongoDB implementation
│   │   └── postgres/                      # PostgreSQL implementation
│   │       ├── users/                     
│   │       │   ├── user.entity.ts         # TypeORM user entity
│   │       │   └── user.repository.ts     # PostgreSQL user repository
│   │       ├── products/
│   │       │   ├── product.entity.ts      # TypeORM product entity
│   │       │   └── product.repository.ts  # PostgreSQL product repository
│   │       ├── customers/
│   │       │   ├── customer.entity.ts     # TypeORM customer entity
│   │       │   └── customer.repository.ts # PostgreSQL customer repository
│   │       └── suppliers/
│   │           ├── supplier.entity.ts     # TypeORM supplier entity
│   │           └── supplier.repository.ts # PostgreSQL supplier repository
│   │
│   ├── oauth/                             # OAuth providers
│   │   ├── facebook/                      # Facebook OAuth implementation
│   │   │
│   │   └── google/                        # Google OAuth implementation
│   │       ├── google-oauth.service.ts    # Google OAuth service implementation
│   │       ├── google-oauth.module.ts     # NestJS module for Google OAuth
│   │       ├── google-oauth.config.ts     # Configuration for Google OAuth
│   │       ├── google-user.mapper.ts      # Mapper: Google user ↔ Domain user
│   │       ├── google-user.type.ts        # TypeScript types for Google OAuth
│   │       └── google-oauth.controller.ts # Test controller for Google OAuth
│   │
│   └── redis/                             # Redis implementations
│       └── redis-cache.service.ts         # Redis cache service
│
├── modules/                               # FEATURE MODULES
│   ├── products.module.ts                 # Products module
│   ├── suppliers.module.ts                # Suppliers module
│   └── customers.module.ts                # Customers module
│
└── controllers/                           # API CONTROLLERS
    ├── products.controller.ts             # REST API for products
    ├── suppliers.controller.ts            # REST API for Suppliers
    ├── customers.controller.ts            # REST API for Customers
    └── health.controller.ts               # Health check controller
```
