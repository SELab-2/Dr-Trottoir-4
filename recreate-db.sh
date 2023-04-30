#!/bin/bash

CONTAINER_ID=$(docker ps -aqf "name=dr-trottoir-4-database-1")
docker exec -it $CONTAINER_ID psql -U django -d postgres -c "DROP DATABASE drtrottoir WITH (FORCE);"
docker exec -it $CONTAINER_ID psql -U django -d postgres -c "CREATE DATABASE drtrottoir;"
./migrations.sh
docker-compose exec backend python manage.py loaddata datadump.json
