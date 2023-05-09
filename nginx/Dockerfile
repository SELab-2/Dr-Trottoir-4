FROM nginx:alpine

ARG ENVIRONMENT

COPY nginx${ENVIRONMENT:+.$ENVIRONMENT}.conf /etc/nginx/nginx.conf