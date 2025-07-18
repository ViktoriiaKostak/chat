FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

RUN ls -la dist/src/

EXPOSE 3000

CMD ["node", "dist/src/main.js"] 