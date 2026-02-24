FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# Generate Prisma client in container
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]