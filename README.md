# Project Information


---

## **Tech Stack**
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │────▶    Backend API    ────▶ │   PostgreSQL    │
│   Next.js 14    │          NestJS               │   Database      │
│   (React)       │◀────   (TypeScript)    ◀──── │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌───────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Google OAuth    │     │   Redis Cache   │     │   TypeORM       │
│   Authentication  │     │   (Optional)    │     │   Migrations    │
└───────────────────┘     └─────────────────┘     └─────────────────┘
```

User → Frontend → Backend API → Database → Backend API → Frontend → User

```
📁 MARKET-LAB/
├── 📁 frontend/ (Next.js)
│ ├── 📁 src/
│ │ ├── 📁 app/           # App Router (pages)
│ │ ├── 📁 components/    # React components
│ │ ├── 📁 core/          # Business logic
│ │ └── 📁 shared/        # Resources
│ └── 📁 public/          # Statics
│
├── 📁 backend/ (NestJS)
│ ├── 📁 src/
│ │ ├── 📁 auth/             # Authentication
│ │ ├── 📁 domain/           # Domain logic
│ │ ├── 📁 infrastructure/   # Infrastructure
│ │ ├── 📁 module/           # Functional modules
│ │ ├── 📁 controller/       # API Controllers 
│ │ ├── 📁 system/           # System modules
│ │ └── 📁 shared/           # Sleeping utilities
│ └── 📁 migrations/         # Migrations DB
│
└── 📁 docker/               # Docker configuration
```

---

## **Features**



---

## **Getting Started**

### 1. Clone Repository

```
git clone https://github.com/KaratSergio/Market-Lab
cd Market-Lab
```


## **Backend Setup**
```
cd backend
npm install
```
### Environment
Create .env file:


## **Frontend Setup**
```
cd frontend
npm install
```
### Environment
Create .env.local file:

Frontend runs on http://localhost:3000

### API Endpoints

```
Project
├── backend/
│   ├── .env
│   └── package.json
└── frontend/
    ├── .env.local
    └── package.json

```

### Code Quality

- **ESLint + Prettier** configured for consistent formatting
- **TypeScript** for type safety
- **Modular and reusable React components** for maintainable code

### Notes

- **React Hook Form** is used for dynamic quiz creation and validation
- **Tailwind CSS** ensures responsive UI

### Error Handling

- **404** returned if a quiz is not found
- Validation errors return **meaningful messages** to the client


