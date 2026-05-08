FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV REDIS_ENABLED=false
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "run", "server"]