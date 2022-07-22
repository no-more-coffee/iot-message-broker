###
FROM node:18.6-alpine as base

WORKDIR /app

COPY *.json ./

RUN npm install --only=production

COPY . .

###
FROM base as build

RUN npm run build
