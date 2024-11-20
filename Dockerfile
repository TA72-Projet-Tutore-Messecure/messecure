# ============================
# Base Stage: Install Dependencies
# ============================
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# ============================
# Development Stage
# ============================
FROM base AS development

# Set environment to development
ENV NODE_ENV=development

# Install development dependencies (optional if separate)
# RUN npm install --only=development

# Expose port for Next.js dev server
EXPOSE 3000

# Command to run the development server
CMD ["npm", "run", "dev"]

# ============================
# Production Stage
# ============================
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Expose port for the production server
EXPOSE 3000

# Command to start the Next.js production server
CMD ["npm", "start"]
