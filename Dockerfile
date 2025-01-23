# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json* ./

# Install dependencies without devDependencies
RUN npm ci --include=dev

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all files to the container
COPY . .

# Copy node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Build the Next.js application
RUN npm run build

# Stage 3: Run the application
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
