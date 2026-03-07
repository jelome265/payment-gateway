# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies needed for native modules (if any)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src/ src/
RUN npm run build
RUN npm prune --production

# Stage 2: Production Runtime
FROM node:20-alpine

# Use default non-root node user provided by the official node image
USER node

WORKDIR /usr/src/app

# Only copy over the built files and production node_modules
# from the builder to minimize attack surface
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package.json ./

# Environment overrides
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/app.js"]
