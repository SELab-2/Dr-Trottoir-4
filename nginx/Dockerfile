FROM nginx:alpine

ARG ENVIRONMENT

COPY nginx.${ENVIRONMENT:-development}.conf /etc/nginx/nginx.conf