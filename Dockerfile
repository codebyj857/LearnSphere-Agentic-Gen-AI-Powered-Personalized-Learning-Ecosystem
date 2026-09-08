# Multi-stage Dockerfile for LearnSphere
# Stage 1: Backend
FROM python:3.9-slim as backend

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/ || exit 1

# Start command
CMD ["python", "app_simple.py"]

# Stage 2: Frontend
FROM node:18-alpine as frontend

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 3: Production Frontend (Nginx)
FROM nginx:alpine as frontend-prod

# Copy built frontend from previous stage
COPY --from=frontend /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 4: Combined Production (Optional)
FROM python:3.9-slim as production

# Install nginx and dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ .

# Copy frontend build
COPY --from=frontend /app/dist /var/www/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script
COPY start-production.sh /start-production.sh
RUN chmod +x /start-production.sh

# Expose ports
EXPOSE 80 5001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/ && curl -f http://localhost:80/ || exit 1

# Start both services
CMD ["/start-production.sh"]
