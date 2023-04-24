FROM node:18-alpine

WORKDIR /app/frontend/

COPY package*.json /app/frontend/

RUN npm install

COPY . /app/frontend/

RUN npm run build

CMD if [ "$ENVIRONMENT" = "development" ]; then npm run dev; else npm start; fi

