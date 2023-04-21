FROM node:18-alpine

ARG ENVIRONMENT
ENV NODE_ENV=$ENVIRONMENT

WORKDIR /app/frontend/

COPY package*.json /app/frontend/

RUN npm install

COPY . /app/frontend/

RUN npm run build

CMD if [ "$ENVIRONMENT" = "development" ]; then npm run dev; else npm start; fi

