# Etha-Link Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## 🚀 Quick Start

Follow these steps **in order** to get the backend up and running:

### Prerequisites

- **Node.js** (v16 or higher)
- **Docker** and **Docker Compose**
- **npm** or **yarn**

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. **FIRST**: Start Database with Docker

⚠️ **Important**: Always start Docker services first before running migrations!

```bash
docker compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Any other required services

Wait for the database to be fully ready (you can check with `docker compose logs db`).

#### 3. **SECOND**: Run Database Migrations

After the database is running, initialize and migrate the database schema:

```bash
npx prisma migrate dev
```

This command will:
- Create the database if it doesn't exist
- Apply all pending migrations
- Generate the Prisma client

#### 4. **THIRD**: Start Development Server

Finally, start the NestJS development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### ⚡ One-Command Setup

You can also run all commands in sequence:

```bash
npm install && docker compose up -d && sleep 10 && npx prisma migrate dev && npm run start:dev
```

> **Note**: The `sleep 10` ensures the database is fully started before running migrations.

## 📚 Available Scripts

### Development
```bash
# Start development server with hot reload
npm run start:dev

# Start development server (no hot reload)
npm run start

# Build for production
npm run build

# Start production server
npm run start:prod
```

### Database Management
```bash
# Run database migrations
npx prisma migrate dev

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Docker Commands
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs

# Rebuild containers
docker compose up --build
```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# PostgreSQL
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_database_name
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Prisma
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
├── user/                 # User management
├── event/                # Event management
├── post/                 # Post management
├── comment/              # Comment system
├── upload/               # File upload handling
├── common/               # Shared utilities
├── guards/               # Route guards
├── decorators/           # Custom decorators
├── prisma/               # Database schema and client
└── main.ts               # Application entry point
```

## 🔐 API Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📖 API Documentation

Once the server is running, you can access:

- **API Endpoints**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api` (if configured)
- **Prisma Studio**: Run `npx prisma studio` for database GUI

## 🐳 Docker Development

The project includes Docker configuration for easy development:

### Services Included:
- **PostgreSQL**: Database server
- **Redis**: Caching (if configured)
- **Backend API**: NestJS application

### Docker Commands:
```bash
# Start all services in development mode
docker compose up -d

# View service logs
docker compose logs -f api

# Execute commands in containers
docker compose exec api npm run prisma:studio
```

## 🔄 Database Migrations

### Creating New Migrations:
```bash
# Create a new migration after schema changes
npx prisma migrate dev --name describe-your-changes

# Apply migrations to production
npx prisma migrate deploy
```

### Managing Schema:
```bash
# Reset database (development only)
npx prisma migrate reset

# Pull database schema changes
npx prisma db pull

# Push schema changes without migration
npx prisma db push
```

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   ```bash
   # Check if Docker containers are running
   docker compose ps
   
   # Restart database service
   docker compose restart db
   ```

2. **Prisma Client Issues**:
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   ```

3. **Port Already in Use**:
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill process or change PORT in .env
   ```

4. **Migration Errors**:
   ```bash
   # Reset migrations (development only)
   npx prisma migrate reset
   
   # Resolve migration conflicts
   npx prisma migrate resolve --applied "migration-name"
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- user.service.spec.ts

# Run e2e tests
npm run test:e2e
```

## 📦 Production Deployment

### Build and Deploy:
```bash
# Build the application
npm run build

# Run production build
npm run start:prod
```

### Environment Setup:
1. Set `NODE_ENV=production`
2. Use production database URL
3. Configure proper JWT secrets
4. Set up SSL certificates
5. Configure reverse proxy (nginx/Apache)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## 📝 License

This project is [MIT licensed](LICENSE).
