#!/bin/bash
docker-compose exec -T backend python manage.py test building/tests.py role/tests.py building_comment/tests.py building_on_tour/tests.py garbage_collection/tests.py manual/tests.py region/tests.py tour/tests.py picture_building/tests.py student_at_building_on_tour/tests.py --with-coverage --cover-package=building,building_on_tour,garbage_collection,manual,region,tour,building_comment,picture_building,student_at_building_on_tour,role

# wait script
echo "Press any key to continue"
while [ true ]; do
  read -t 3 -n 1
  if [ $? = 0 ]; then
    exit
  fi
done
