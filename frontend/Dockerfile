FROM node:18-alpine

WORKDIR /app/frontend/

COPY package*.json /app/frontend/
RUN npm install
RUN npm install axios
RUN npm install dotenv

COPY . /app/frontend/

RUN npm run build

CMD ["npm", "run", "dev"]

