# Common Base
FROM node:22-alpine AS base

WORKDIR /app
COPY package.json ./
# Skip copying package-lock.json if it's not available
RUN npm install  # Install all dependencies with npm

# Development Stage (if needed)
FROM base AS development
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production Stage
FROM base AS production
WORKDIR /app
COPY . .

# Build the app
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production  # This will remove all dev dependencies, keeping only production dependencies.

EXPOSE 3000
CMD ["npm", "run", "start"]
