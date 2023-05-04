FROM python:3.11-alpine

# prevents python from writing pyc files to disc
ENV PYTHONUNBUFFERED 1
# prevents python from buffering stdout and stderr
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app/backend

COPY requirements.txt /app/backend/

RUN pip install --upgrade pip

# Build psycopg2-binary from source -- add required required dependencies
RUN apk add --virtual .build-deps --no-cache postgresql-dev gcc python3-dev musl-dev && \
        pip install --no-cache-dir -r requirements.txt && \
        apk --purge del .build-deps

COPY . /app/backend/


