# FROM node:alpine

# WORKDIR /usr/api

# COPY package.json .

# RUN npm install

# COPY . .

FROM node:alpine

WORKDIR /usr/app

COPY build .

COPY .env .

RUN npm ci --production
