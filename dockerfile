FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

HEALTHCHECK --interval=1m --timeout=3s CMD [ "node", "dist/healthcheck.js" ]

CMD ["node", "."]