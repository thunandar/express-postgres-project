#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running migrations..."
npm run db:migrate

# Run seeders
echo "Running seeders..."
npm run db:seed

# Start the application
echo "Starting application..."
npm start
