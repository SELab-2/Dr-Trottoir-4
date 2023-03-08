# Load data to database using fixtures

**Fixtures** in django are a useful way to dump data and add the data to our database. 
An example of a fixtures is [dump-data.json](../backend/dumpdata_1.json).

In order to create a data dump of our database file using docker, we can use the command:
```bash
docker-compose exec backend python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 -o <output_name>.json
```
There are other file extension possible but this will do for our test data.

Before loading the data in the database, please make sure that it is empty. Follow the 
[clean up](https://github.com/SELab-2/Dr-Trottoir-4/blob/develop/readme/authentication.md#clean-up) steps 
to drop and create the database.

To load the data in the database, use the command:

```bash
docker-compose exec backend python manage.py loaddata <fixturename>
```

The example fixtures we have provided will serve as a good initial batch of data for testing purposes.
There are currently 22 users, all of whom share the same password `drtrottoir123`.
The names of these users have been chosen to make it easier to recognize what role they have:
<ul>
    <li>Users whose name start with <code>Ad</code> are admins </li>
    <li>Users whose name start with <code>St</code> are students </li>
    <li>Users whose name start with <code>Su</code> are superstudents </li>
    <li>Users whose name start with <code>Sy</code> are syndics </li>
</ul>

Additionally, male names indicate that the user's region is set to `Gent`, whereas female names indicate that a user's
region is set to `Antwerpen`.

To make logging into the [admin](http://localhost:2002/admin) page easier with these users, there is also an admin/superuser whose email address is set
to `admin@test.com`.


More information about fixtures can be found [here](https://docs.djangoproject.com/en/4.1/howto/initial-data/).