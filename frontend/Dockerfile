# === Build Stage ===
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# === Production Stage ===
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
