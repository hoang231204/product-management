FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000

USER node

CMD ["npm", "run", "start:docker"]