### Build app
FROM node:18.6-alpine as build

WORKDIR /app

COPY *.json ./

RUN npm install --only=production

COPY . .

RUN npm run build


### Strip build files
FROM node:18.6-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/dist ./dist/
COPY --from=build /app/certificates ./certificates/
