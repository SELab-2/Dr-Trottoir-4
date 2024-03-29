# Authentication

## Update secrets.py

There is a new `secrets.py` file, don't forget to update yours!

## Clean up

Since authentication brings alot of changes to the structure of the database,
we need a clean start. Follow these steps to get a clean start.

### Step 1: Get postgres container ID

Execute the following command:

```bash
docker ps
```

This will give you the `CONTAINER_ID` for the `postgres:15-alpine` image.

### Step 2: Drop / Create the database

Execute following commands:

```
docker exec -it <CONTAINER_ID> psql -U django -d postgres -c "DROP DATABASE drtrottoir WITH(FORCE);"   
```

and

```
docker exec -it <CONTAINER_ID> psql -U django -d postgres -c "CREATE DATABASE drtrottoir;"   
```

### Step 3: Migrate database

```bash
../migrations.sh
```

## Testing the flow

### Step 1: Create a superuser

To be able to access the admin website, we need a super user! This can be done with the following command:

```bash
docker-compose exec backend python manage.py createsuperuser   
```

You will be prompted with several questions. Feel free to play around.
By convention, we will always use an `@test.com` email address for test accounts. Be sure to remember your password!

![create superuser](./img/create_superuser.png)

### Step 2: Admin page

Now we are able to log in into the [admin](http://localhost:2002/admin) page with the superuser credentials.
On this page you can add/remove users, regions, ...

### Step 3: Test login/logout/... in backend

When you surf to http://localhost:2002/users, you shouldn't be able to see all the users (401 Unauthorized).
Now we'll create a user.

Before we can test the 'production' workflow, you should adapt the code temporarily and set `DEBUG = False`. This is
needed
because e-mail verification is set `'optional'` in development and only in production it is set to `'mandatory'`.

- Get a temporary e-mail box on this website: https://temp-mail.org/
- Use this e-mail on the following page: http://localhost:2002/authentication/signup
    - You don't need to add a username, since we don't use that.
    - You should receive an e-mail in the mailbox once you've hit `POST`
    - Before verifying with the link, try to log in with the email and password on this
      page: http://localhost:2002/authentication/login
        - This shouldn't work, since you haven't verified yet.
        - Now continue with verification
    - The e-mail link is not a valid one, since the port isn't in it. This will be correct once we are in production.
    - Use the link but add the port `:2002` in the domain.
    - You can now see the verification, by adding the key (part after /account-confirm-email/) in the key input field,
      you will see the verification status
- Login on the following page with your created account: http://localhost:2002/authentication/login/
- You should have received an access token and a refresh token.
    - For security reasons we store the tokens in `HTTP-Only` cookies.
    - You can check them out if you `inspect` the page (dev, go to `application` and check out the
      cookies `auth-refresh-token` and `auth-access-token`
- Because you are authorized, you should see a list of users here: http://localhost:2002/users/
- Try resetting your password of your newly created account
    - Surf to: http://localhost:2002/authentication/password/reset/
    - Fill in your e-mail
    - You should have received a reset password link, add the port `:2002` to the domain name and go to this link
        - Fill in your new password.
        - Your Uid will be 2 (if you haven't created another user except superuser, otherwise
          check http://localhost:2002/admin/base/user/ and use the id = number of users, otherwise you can just look at
          the URL where the Uid is visible before the token)
        - Use the token from the link (final part of the path)
        - `POST` and you should now see: a success message in detail.
        - Logout on the following page by posting an empty message: http://localhost:2002/authentication/logout/
        - Log back in with the new password: http://localhost:2002/authentication/login
- Finally, try to change your password
    - Surf to: http://localhost:2002/authentication/password/change/
    - Fill in your new password
    - Logout by doing a POST on http://localhost:2002/authentication/logout/
    - Login with your new password

Nicely done! You've completed a user-authentication/authorization flow in our back-end system.

## Next step in authentication

- Update the user-manager/serializer/testing.
- Have a more elaborate signup (first-name, role, ...)
- Setup coupling with front-end
    - Important read for security: https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
    - Blog with code example (Next.js + Django): https://jeff.roche.cool/articles/django-next-auth
        - Here back-end and front-end will need to work together!

