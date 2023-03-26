# Dr-Trottoir-4

## How to get started
This repository contains our solution for [Dr. Trottoir's](https://drtrottoir.be/) web application that will
be used to facilitate their workflow for both the employers and employees. To that end, we have decided to 
use the following software stack:
* Database: [PostgreSQL](https://www.postgresql.org/)
* Backend: [Django](https://www.djangoproject.com/)
* Frontend: [Next.js](https://nextjs.org/)

Our full-stack app is also containerized with [Docker](https://www.docker.com/). This means that you will have to
install [Docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) first. 
Another useful tool worth considering is [Docker Desktop](https://www.docker.com/products/docker-desktop/). This will
provide a GUI with lots of extra features that will make the docker experience more pleasant.

To run the docker container you can use the following command:
```bash
docker-compose up
```
Whenever you need to rebuild your containers, use:
```bash
docker-compose build
```

Or if you want to rebuild and then run at the same time, use:
```bash
docker-compose up --build -d
```

To stop the containers, run `docker-compose down` or press `Ctrl+C` if the process is running in the foreground.
Alternatively, you can use the stop button in Docker Desktop.

This covers the basics of how to run our code. For more detailed instructions and information about our implementations,
please check out our [wiki](https://github.com/SELab-2/Dr-Trottoir-4/wiki/)

## Members of Team 4
* [Emma Neirinck](https://github.com/emneirin)
* [Jonathan Casters](https://github.com/jonathancasters)
* [Sebastiaan de Oude](https://github.com/n00bS-oWn-m3)
* [Seppe Van Rijsselberghe](https://github.com/sevrijss)
* [Sheng Tao Tian](https://github.com/GashinRS)
* [Simon Van den Bussche](https://github.com/simvadnbu)
* [Tibo Stroo](https://github.com/TiboStr)