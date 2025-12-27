# cinephoria-web/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Build de production
RUN npm run build -- --configuration production

# Stage 2: Serveur NGINX
FROM nginx:alpine

# Copie de la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copie des fichiers buildés
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
