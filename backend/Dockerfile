FROM node:22-alpine

WORKDIR /mentor-backend

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node" , "index.js"]