# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Build frontend
RUN npm run build

# Serve stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the frontend
RUN npm install -g serve

# Copy built frontend from builder
COPY --from=builder /app/build ./build

# Copy package file for reference
COPY package*.json ./

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
