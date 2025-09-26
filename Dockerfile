# Установка базового образа Node.js
FROM node:18-alpine

# Создание директории приложения
WORKDIR /usr/src/app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Открытие порта
EXPOSE 3001

# Запуск приложения
CMD ["npm", "run", "start:prod"]