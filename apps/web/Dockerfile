# FROM node:20-alpine

# WORKDIR /app

# COPY package.json tsconfig.json vite.config.ts ./
# RUN npm install

# COPY src ./src

# EXPOSE 5173
# CMD ["npm", "run", "dev"]

FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
