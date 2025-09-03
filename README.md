# EtherLink
## 🚀 Quick Start Guide

This project consists of two main parts that need to be run **in order**:

1. **Backend API** (NestJS + PostgreSQL)
2. **Frontend App** (Next.js + React)

### 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js** (v16 or higher)
- **Docker** and **Docker Compose**
- **npm** or **yarn**
- **Git**

## 📋 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd etha-link-recurzive-v2
```

### Step 2: **FIRST** - Setup and Run Backend

⚠️ **Important**: Always start the backend first as the frontend depends on the API.

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start database with Docker Compose
docker compose up -d

# Wait for database to be ready (about 10-15 seconds)
# Then run database migrations
npx prisma migrate dev

# Start backend development server
npm run start:dev
```

✅ Backend will be running at: `http://localhost:3000`

### Step 3: **SECOND** - Setup and Run Frontend

**In a new terminal window/tab** (keep backend running):

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

✅ Frontend will be running at: `http://localhost:3001`

## 🎯 One-Command Setup

For advanced users, you can use these combined commands:

### Backend (Terminal 1):
```bash
cd backend && npm install && docker compose up -d && sleep 15 && npx prisma migrate dev && npm run start:dev
```

### Frontend (Terminal 2):
```bash
cd frontend && npm install && npm run dev
```

## 🏗️ Project Structure

```
etha-link-recurzive-v2/
├── backend/                 # NestJS API Server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema & migrations
│   ├── docker-compose.yml  # Database services
│   └── package.json
├── frontend/               # Next.js React App
│   ├── app/               # Next.js App Router
│   ├── components/        # Reusable components
│   ├── public/           # Static assets
│   └── package.json
└── README.md             # This file
```

## 🔗 Service URLs

Once both services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:3001` | Main application interface |
| **Backend API** | `http://localhost:3000` | REST API endpoints |
| **Database** | `localhost:5432` | PostgreSQL (via Docker) |
| **Prisma Studio** | `http://localhost:5555` | Database GUI (run `npx prisma studio` in backend/) |

## 🧪 Features

- **🎪 Event Management**: Create, join, and manage community events
- **📝 Social Posts**: Share updates and interact with the community  
- **💬 Comments System**: Engage in discussions on posts
- **👥 User Profiles**: Comprehensive user profiles with activity tracking
- **🏆 Gamification**: Event participation tracking and achievements
- **📱 Responsive Design**: Modern dark theme UI that works on all devices
- **🔐 Authentication**: Secure JWT-based authentication system

## 🔧 Development Commands

### Backend Commands (in `/backend` directory):

```bash
# Database management
npx prisma migrate dev      # Apply database migrations
npx prisma studio          # Open database GUI
npx prisma generate         # Generate Prisma client

# Development
npm run start:dev           # Start with hot reload
npm run start              # Start normally
npm run build              # Build for production

# Docker
docker compose up -d       # Start database services
docker compose down        # Stop all services
docker compose logs        # View logs
```

### Frontend Commands (in `/frontend` directory):

```bash
# Development
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Type checking
npm run type-check         # Check TypeScript types
```

## 🐳 Docker Services

The backend includes these Docker services:

- **PostgreSQL**: Main database
- **Redis**: Caching (if configured)

Check service status:
```bash
cd backend
docker compose ps
```

## 🔐 Environment Variables

### Backend (`.env` in `/backend`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/etha_link"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### Frontend (`.env.local` in `/frontend`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 🚨 Troubleshooting

### Common Issues:

1. **Backend won't start**:
   ```bash
   # Check if database is running
   cd backend
   docker compose ps
   
   # Restart database
   docker compose restart
   ```

2. **Frontend can't connect to API**:
   - Ensure backend is running on `http://localhost:3000`
   - Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

3. **Database connection errors**:
   ```bash
   # Reset database (WARNING: deletes all data)
   cd backend
   npx prisma migrate reset
   ```

4. **Port conflicts**:
   - Backend default: `3000`
   - Frontend default: `3001`
   - Database: `5432`
   
   Kill processes using these ports or change in config files.

5. **Prisma migration errors**:
   ```bash
   cd backend
   npx prisma generate        # Regenerate client
   npx prisma migrate reset   # Reset migrations (dev only)
   ```

## 📊 API Endpoints

Key API endpoints available at `http://localhost:3000`:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /event` - List all events
- `POST /event` - Create new event
- `GET /event/:id` - Get event details
- `GET /user/me` - Get current user profile

## 🧪 Testing

### Backend Tests:
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
```

### Frontend Tests:
```bash
cd frontend
npm run test              # Run tests
npm run test:watch        # Watch mode
```

## 🚀 Deployment

### Production Build:

1. **Backend**:
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   npm run start
   ```
