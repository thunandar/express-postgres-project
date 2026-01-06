# Express PostgreSQL Product Management API

![CI/CD](https://github.com/thunandar/express-postgres-project/workflows/CI/CD%20Pipeline/badge.svg)

Production-ready RESTful API with 100% test coverage, demonstrating enterprise-level architecture, comprehensive testing, and DevOps best practices.

## Highlights

- 🎯 **100% Test Coverage** - Comprehensive unit and integration tests
- 🔒 **Security** - JWT authentication, bcrypt password hashing, input validation
- 🐳 **Docker Ready** - Containerized with docker-compose for easy deployment
- ⚡ **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions
- 📊 **Production Features** - Error handling, logging, database migrations, seeding

## Features

- ✅ **CRUD Operations** for products with image upload
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Role-Based Access Control** (Admin/User)
- ✅ **Advanced Filtering** (category, price range, stock status, sorting)
- ✅ **Pagination** support
- ✅ **Docker** containerization with docker-compose
- ✅ **Automated Testing** with Jest and Supertest
- ✅ **CI/CD Pipeline** with GitHub Actions

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Testing**: Jest, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions

## Quick Start

### Using Docker (Recommended)

```bash
# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

App runs at `http://localhost:3000`

### Local Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:create
npm run db:migrate
npm run db:seed

# Start dev server
npm run dev
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products (Public)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID

### Products (Admin Only)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Environment Variables

```env
NODE_ENV=development
PORT=3000

DB_NAME=product_management_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=30d
REFRESH_TOKEN_SECRET=your-refresh-secret
```

## Documentation

- [Docker Setup](docs/docker-note.md)
- [Testing Guide](docs/testing-note.md)

## CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on PostgreSQL database
2. Checks code quality
3. Builds Docker image
4. Ready for AWS deployment

## License

ISC
