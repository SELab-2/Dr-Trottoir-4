# Load data to database using fixtures

**Fixtures** in django are a useful way to dump data and add the data to our database. 
An example of a fixtures is [dumpdata_1.json](../backend/dumpdata_1.json).

In order to create a dumpdata of our database file using docker, we can use the command:
```
docker-compose exec backend python manage.py dumpdata -o <name>.json
```
There are other file extension possible but this will do for our test data.

Then to load the data in the database, use the command:

```
docker-compose exec backend python manage.py loaddata <fixturename>
```

That is all you need to know. More info can be found [here](https://docs.djangoproject.com/en/4.1/howto/initial-data/).

