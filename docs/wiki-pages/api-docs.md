## Introduction
We used [drf-spectacular](https://github.com/tfranzel/drf-spectacular#customization-by-using-extend_schema) to automatically
generate [OpenAPI 3.0/Swagger](https://spec.openapis.org/oas/v3.0.3) compliant documentation for our API. Drf-spectacular
will automatically update our documentation whenever something changes, so there is no need to run any extra commands or code.
This makes it a lot easier to maintain our documentation. To access our documentation, head over to http://localhost/api/docs/ui.

While it already generates a lot out of the box, it will still be necessary to add/edit some things ourselves.
This will be covered in the next section.

## How to expand and edit the schema
The [@extend_schema](https://drf-spectacular.readthedocs.io/en/latest/drf_spectacular.html#drf_spectacular.utils.extend_schema)
decorator from [drf-spectacular](https://github.com/tfranzel/drf-spectacular#customization-by-using-extend_schema) will cover most if not all use cases for customizing the documentation. Below is an example
of how to use it:

```python
from drf_spectacular.utils import extend_schema

class AllUsersView(APIView):
    serializer_class = UserSerializer

    @extend_schema(
        parameters=[OpenApiParameter(name='test', description='test parameter', required=False, type=str)],
        description="test description",
        responses={200: UserSerializer,
                   400: None}
    )
    def get(self, request):
        """
        Get all users
        """

        user_instances = User.objects.all()

        if not user_instances:
            return Response(
                {"res": "No users found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user_instances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
```

Before adding [@extend_schema](https://drf-spectacular.readthedocs.io/en/latest/drf_spectacular.html#drf_spectacular.utils.extend_schema),
the automatically generated documentation looks like this:
![user_before_extend](./img/user_before_extend.jpg)

Since the request from the example is a `GET` request, automatically generating the 200 response code is not an issue,
however, it's still missing the 400 response code. To fix this, use [@extend_schema](https://drf-spectacular.readthedocs.io/en/latest/drf_spectacular.html#drf_spectacular.utils.extend_schema)
like in the example above. You'll have to define this right before any request function if you want to change or expand the
default documentation. The most common fields you'll need are also used in the example. Please note that even though the documentation
for the 200 response code has already been generated without [@extend_schema](https://drf-spectacular.readthedocs.io/en/latest/drf_spectacular.html#drf_spectacular.utils.extend_schema),
we'll still need to respecify it since using the `responses` field will override all old responses. The documentation for `/user/all` now looks like this:

![user_after_extend](./img/user_after_extend.jpg)

Now note how we set `serializer_class = UserSerializer` without ever using `serializer_class`. This is there to help drf-spectacular
parse our code, so don't forget to include this is in every view with the right serializer! If you want to make sure you did everything correctly,
check out the next section to find out how you can get error and warning outputs.

For another (bigger) example, click [here](https://github.com/tfranzel/drf-spectacular#usage). For the full documentation of
[drf-spectacular](https://github.com/tfranzel/drf-spectacular#customization-by-using-extend_schema), click
[here](https://drf-spectacular.readthedocs.io/en/latest/).

## The schema
It's also possible to generate a general `schema.yml` file which will contain the documentation in a format that can be 
exported to other use cases. There are two ways to do this. The first one is just to head over to http://localhost/api/docs/.
This will automatically download the `schema.yml` file. The second one is to run the following command:
```bash
docker-compose exec backend python manage.py spectacular --file schema.yml
```
This method can be useful because it will also produce errors and warnings when generating the file. This means that this
is a good way to doublecheck whether drf-spectacular was used correctly.

