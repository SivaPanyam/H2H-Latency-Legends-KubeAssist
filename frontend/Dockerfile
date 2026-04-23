# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
# Inject env vars at build time if needed, or use runtime config
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if you have one, or use default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
