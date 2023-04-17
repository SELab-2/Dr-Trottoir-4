#!/bin/bash -e
echo "Running tests..."
docker-compose exec -T backend python manage.py test building/tests.py role/tests.py building_comment/tests.py building_on_tour/tests.py garbage_collection/tests.py manual/tests.py region/tests.py tour/tests.py picture_building/tests.py student_at_building_on_tour/tests.py --with-coverage --cover-package=building,building_on_tour,garbage_collection,manual,region,tour,building_comment,picture_building,student_at_building_on_tour,role
echo "Tests completed."