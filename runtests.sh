#!/bin/bash
python backend/manage.py test email_template building role building_comment building_on_tour garbage_collection manual region tour picture_building student_at_building_on_tour --with-coverage --cover-package=building,building_on_tour,garbage_collection,manual,region,tour,building_comment,picture_building,student_at_building_on_tour,role,email_template

# wait script
echo "Press any key to continue"
while [ true ]; do
  read -t 3 -n 1
  if [ $? = 0 ]; then
    exit
  fi
done
