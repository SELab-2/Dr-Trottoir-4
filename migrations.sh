#!/bin/bash

docker-compose exec backend-wsgi python manage.py makemigrations
docker-compose exec backend-wsgi python manage.py migrate
