FROM node:alpine
WORKDIR /usr/app
COPY build .
COPY .env .
RUN npm ci --production
