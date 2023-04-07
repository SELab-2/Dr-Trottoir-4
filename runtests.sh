#!/bin/bash
docker compose exec backend python manage.py test picture_of_remark/tests.py remark_at_building/tests.py lobby/tests.py email_template/tests.py building/tests.py role/tests.py building_comment/tests.py building_on_tour/tests.py garbage_collection/tests.py manual/tests.py region/tests.py tour/tests.py --with-coverage --cover-package=lobby,email_template,building,building_on_tour,garbage_collection,manual,region,tour,building_comment,role,remark_at_building,picture_of_remark

# wait script
echo "Press any key to continue"
while [ true ]; do
  read -t 3 -n 1
  if [ $? = 0 ]; then
    exit
  fi
done
