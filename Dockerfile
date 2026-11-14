# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build both backend & frontend
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
COPY backend/package*.json ./backend/

RUN cd backend && npm install --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["npm", "start"]
