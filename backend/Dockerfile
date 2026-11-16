# syntax=docker/dockerfile:1

# Step 1: all dependencies, even dev (-> needed for build)
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci  
# npm ci: clean install -> only reads package-lock.json

# Step 2: compile TS to dist/ 
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# step 3: only production-dependecies
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# step 4: slim runtime-image
# Stufe 4: schlankes Laufzeit-Image
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]