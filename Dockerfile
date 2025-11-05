ARG NODE_VERSION=20.18.1

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env* ./
ARG VITE_API_BASE_URL
ARG VITE_WEBRTC_URL
ARG VITE_ICE_SERVERS_JSON
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WEBRTC_URL=${VITE_WEBRTC_URL}
ENV VITE_ICE_SERVERS_JSON=${VITE_ICE_SERVERS_JSON}
RUN npm run build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENV NODE_ENV=production
CMD ["nginx", "-g", "daemon off;"]
