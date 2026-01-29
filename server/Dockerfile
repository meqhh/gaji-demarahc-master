# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 5000

# Start backend
CMD ["npm", "start"]
