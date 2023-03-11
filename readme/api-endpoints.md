# API endpoints

This is a temporary document that will be changed according to future needs.
For now, it can be used by both the backend team and the frontend team as a clear overview on how the API will look
like.
In the future, it might be useful to automatically generate API documentation.

#### Used HTTP response status codes

_Succesful_

* GET: 200 OK
* POST/DELETE: 204 No Content
* PATCH: 201 Created

_Unsuccessful_

* Not logged in: 401 Unauthorized
* Nonexistent id in URL: 400 Bad Request

An internal server error (500) after a request should never happen.

## Table of contents

- [/user](#user)
- [/region](#region)
- [/building](#building)
- [/buildingurl](#buildingurl)
- [/garbage_collection](#garbage_collection)
- [/tour](#tour)
- [/building_on_tour](#building_on_tour)
- [/student_at_building_on_tour](#student_at_building_on_tour)
- [/picture_building](#picture_building)
- [/manual](#manual)

## /user

### Get

* `/{id}`

> Gets all data about user with given id

* `/all`

> Get a list of URL's to all users in the database

TODO: perhaps it would be more wise to define `all_students`, `all_superstudents` ... According to the authorization
rights of the logged in user, the user might fetch `all_students`, but not `all_superstudents`  
However, we can also change the view depending on the authorization level of the requester

### Post

TODO: figure out how this will work with auth.  
I am guessing an admin needs to create an account for a superstudent, a superstudent or admin for a student ...

Perhaps we could do something like this:  
Everyone can make a user account, but won't be able to do much (except perhaps fill in more info, see the welcome
page, ... ). Then a superstudent/admin could give the right permissions / role to that user  
*To be continued ...*

| Parameter    | 
|--------------|
| email        | 
| first_name   |
| last_name    | 
| password     | 
| phone_number | 
| region       | 
| role         | 

After a post, the server could respond with the link to the newly created resource.

### Delete

* `/{id}`

> Deletes user with given id

### Patch

* `/{id}`

| Parameter    | 
|--------------|
| email        | 
| first_name   |
| last_name    | 
| password     | 
| phone_number | 
| region       | 
| role         | 

TODO: figure out how to change email, maybe this will be clear if we implement a password forgot feature.

## /region

### Get

* `/{id}`

> Get info about region with given id

* `/all`

> Get a list of URL's to all regions in the database

### Post

| Parameter | 
|-----------|
| name      |

### Delete

* `/{id}`

> Delete region with given id

### Patch

* `/{id}`

| Parameter | 
|-----------|
| name      |

## /building

### Get

* `/{id}`

> Get all info of building with given id

* `/all`

> Get links to all buildings

* `/owner/{userid}`

> Get all buildings owned by user with given userid


TODO: Is last URL necessary? No, but implementing this might speed up the app if there is a lot of
data to be fetched. If the frontend people would require more such detailed endpoints, it is easy for us to implement
them

### Post

| Parameter     |
|---------------|
| city          |
| postal_code   |
| street        | 
| house_number  | 
| client_number | 
| duration      | 
| syndic        |                                    
| region        |
| name          |

**NOTE**: fields like syndic and region are foreign keys (IDs). So make sure they are already present before trying to
patch

### Delete

* `/{id}`

> Deletes building with given id

### Patch

* `/{id}`

| Parameter     | 
|---------------|
| city          | 
| postal_code   | 
| street        |
| house_number  | 
| client_number | 
| duration      | 
| syndic        |
| region        |
| name          |

## /buildingurl

TODO: Isn't this an awkward name?
Maybe rename it to e.g. resident_building_info?

### Get

* `/{id}`

> Get info about the building url with the given id

* `/all`

> Get all links to building urls

* `/syndic/{userid}`

> Get all links of a syndic with given userid

* `/building/{buildingid}`

> Get all links of the building with given building id

### Post

| Parameter  | 
|------------|
| first_name |
| last_name  |
| building   |

### Delete

* `/{id}`

> Delete building url with given id

### Patch

* `/id`

| Parameter  |
|------------|
| first_name | 
| last_name  | 
| building   |

## /garbage_collection

### Get

* `/{id}`

> Get all info about the garbage collection with given id

* `/building/{buildingid}`

> Get all info about the garbage collection of the building with given buildingid

### Post

| Parameter    | Description                                                                |
|--------------|----------------------------------------------------------------------------|
| building     |                                                                            |
| date         |                                                                            |
| garbage_type | ∈ {"GFT", "GLAS", "GROF_VUIL", "KERSTBOMEN", "PAPIER", "PMD", "RESTAFVAL"} |

### Delete

* `/{id}`

> Delete garbage collection with given id

### Patch

* `/{id}`

| Parameter    | 
|--------------|
| building     | 
| date         |
| garbage_type | 

## /tour

### Get

* `/{id}`

> Get all info about a tour with given id

### Post

| Parameter   | 
|-------------|
| name        | 
| region      |
| modified_at | 

### Delete

* `/{id}`

> Delete tour with given id

### Patch

* `/{id}`

| Parameter   | 
|-------------|
| name        | 
| region      |
| modified_at | 

## /building_on_tour

### Get

* `/{id}`

> Get all info about a building on a tour with the given id

* `/all/{tourid}`

> Get all buildings on a tour with the given tourid

### Post

| Parameter | 
|-----------|
| tour      | 
| building  |
| index     | 

### Delete

* `/{id}`

> Deletes a building on a tour with given id

### Patch

* `/{id}`

| Parameter | 
|-----------|
| tour      | 
| building  |
| index     | 

## /student_at_building_on_tour

### Get

TODO: we could also work like this: `/{studentId}/{buildingId}/{tourId}`

* `/{id}`

> Get all info about a student at a building on a tour with given id

* `/{studentid}`

> Get all buildings in a tour where the student with given studentid has been

### Post

| Parameter | 
|-----------|
| tour      | 
| building  |
| index     | 

### Delete

* `/{id}`

> Delete a student at a building on a tour (delete entry in the database to be clear)

### Patch

* `/{id}`

| Parameter | 
|-----------|
| tour      | 
| building  |
| index     | 

## /picture_building

### Get

* `/{id}`

> Get the picture of a building with the given id

* `/{buildingid}`

> Get all pictures of a building, where id refers to the building

Optional parameters:

| Parameter | Description               |
|-----------|---------------------------|
| from      | Lower bound for timestamp |
| till      | Upper bound for timestamp |

### Post

| Parameters   | 
|--------------|
| building     | 
| picture_name |
| description  |
| timestamp    |

### Delete

* `/{id}`

> Delete the picture of a building with the given id

### Patch

* `/{id}`

| Parameters   | 
|--------------|
| building     | 
| picture_name |
| description  |
| timestamp    |

## /manual

### Get

* `/{id}`

> Get the manual with given id

* `{buildingId}`

> Get all manuals from the building with given buildingId

### Post

| Parameters     | Description                                                                                                |
|----------------|------------------------------------------------------------------------------------------------------------|
| building       |                                                                                                            |
| version_number | Integer field, if none is given, the version number will be the previous version number incremented by one |
| content        |                                                                                                            |

### Delete

* `/{id}`

> Delete the manual with given id

### Patch

* `/{id}`

| Parameters     |
|----------------|
| building       |
| version_number |
| content        |  





