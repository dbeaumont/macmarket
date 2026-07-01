# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
ARG NPM_REGISTRY_URL
ARG NPM_REGISTRY_HOST
ENV NPM_REGISTRY_URL=$NPM_REGISTRY_URL
ENV NPM_REGISTRY_HOST=$NPM_REGISTRY_HOST
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=npm_token,env=NPM_TOKEN npm ci --loglevel=info
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
