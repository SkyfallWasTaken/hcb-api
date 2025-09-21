# Multi-stage build for SvelteKit application using Bun
FROM oven/bun:1 AS base

# Install dependencies for building
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
# Install dependencies using bun
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the SvelteKit application
RUN bun run build

# Production runtime
FROM base AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 bun
RUN adduser --system --uid 1001 sveltekit

# Copy the built application
COPY --from=builder --chown=sveltekit:bun /app/build ./build
COPY --from=builder --chown=sveltekit:bun /app/package.json ./package.json
COPY --from=deps --chown=sveltekit:bun /app/node_modules ./node_modules

# Switch to non-root user
USER sveltekit

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application using Bun
CMD ["bun", "run", "build/index.js"]