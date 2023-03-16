# How to get started

The software stack of this project is as follows:

* Database: [PostgreSQL](https://www.postgresql.org/)
* Backend: [Django](https://www.djangoproject.com/)
* Frontend: [React](https://reactjs.org/)

Our full-stack app is containerized with [Docker](https://www.docker.com/).

<br>

The initialization of this project is done by following this
tutorial: https://dev.to/anjalbam/dockerize-a-django-react-and-postgres-application-with-docker-and-docker-compose-by-anjal-bam-e0a

Another guide worth mentioning
is: https://stackpython.medium.com/how-to-start-django-project-with-a-database-postgresql-aaa1d74659d8

## How to run

### Run everything at once (with docker-compose)

Click [here](https://docs.docker.com/get-docker/) to install Docker, [here](https://docs.docker.com/compose/install/)
for docker-compose.

In the root of this directory, execute:

* `sudo docker-compose build`
* `sudo docker-compose up`

The frontend can be found at http://localhost:3000/, a visualization of our JSON API can be found
at http://localhost:8000/.

To stop the containers, run `docker-compose down` or press `Ctrl+C` if the process is running in the foreground.

### Run only the backend code

#### Activating virtual environment

In the root, you will find a directory [venv](venv).
Activating this virtual environment can be done by typing `source venv/bin/activate`.
Exiting the virtual environment can be done with the command `deactivate`.

If you use an IDE (e.g. [Pycharm](https://www.jetbrains.com/toolbox-app/)), this should happen automatically.

#### Running the backend

*The biggest problem with this method, is that you have to change 'web' to 'localhost'
in [settings.py](../backend/config/settings.py). Unless a solution is found, we will probably have to let go this option
of running.*

`sudo systemctl start postgresql` (or `enable`)

`sudo -u postgres psql`

```
postgres=# CREATE DATABASE drtrottoir ;
postgres=# CREATE USER django WITH PASSWORD 'password' ;
postgres=# ALTER ROLE django SET client_encoding TO 'utf-8' ;
postgres=# ALTER ROLE django SET default_transaction_isolation TO 'read committed' ;
postgres=# ALTER ROLE django SET timezone TO 'CET' ;
postgres=# GRANT ALL PRIVILEGES ON DATABASE drtrottoir TO django;
postgres=# ALTER DATABASE drtrottoir OWNER TO django ;
postgres=# \q
```

<div style="border: solid 1px yellow">
<span style="font-style: italic">TODO: add commands to make the database schema and fill with development data. Or link to file with the commands. Or maybe provide a dump file?</span>
We also might decide to not use this option at all and always run with docker-compose.
</div>


`python manage.py makemigrations`

`python manage.py migrate`

Finally, running the backend code can be done by typing:
`python manage.py runserver` in [backend](../backend).

`sudo systemctl stop postgresql` (optionally)

### Run only frontend code

Run `npm start` in the directory [frontend](../frontend). But of course, if the backend is not attached, you won't see any
data visualized.


