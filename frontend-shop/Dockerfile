# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────────────────────
# Étape 1 — Build : compilation Vite/React avec Node 22 (Alpine)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Arguments de build pour configurer le registre npm interne (ex : Artifactory)
ARG NPM_REGISTRY_URL
ARG NPM_REGISTRY_HOST
ENV NPM_REGISTRY_URL=$NPM_REGISTRY_URL
ENV NPM_REGISTRY_HOST=$NPM_REGISTRY_HOST

# Copier les manifestes de dépendances avant les sources pour profiter du cache Docker :
# cette couche est invalidée uniquement si package.json / package-lock.json changent
COPY package.json package-lock.json .npmrc ./

# Installer les dépendances via npm ci (installation déterministe depuis le lockfile)
# Le token npm est injecté via un secret BuildKit (jamais stocké dans l'image)
RUN --mount=type=secret,id=npm_token,env=NPM_TOKEN npm ci --loglevel=info

# Copier les sources et construire les assets statiques optimisés (Vite)
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Étape 2 — Runtime : serveur nginx minimaliste (Alpine)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Déployer les assets compilés dans le répertoire servi par nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Surcharger la configuration nginx par défaut (gestion du routing SPA, headers, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
