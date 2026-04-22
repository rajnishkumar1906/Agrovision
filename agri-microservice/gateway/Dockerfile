FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV REDIS_ENABLED=false
EXPOSE 3000
CMD ["npm", "run", "server"]