FROM node:22.14.0 AS build
WORKDIR /build
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY ./webpack.config.js ./
COPY ./public_html/ ./public_html/
COPY ./cards/ ./cards/
COPY ./server/ ./server/
ENV NODE_ENV=production
ENV tokaido_port=3000
EXPOSE $tokaido_port
RUN npm run build
CMD ["node", "server/server.js"]
