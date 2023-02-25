from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def send_some_data(request):
    # In urls.py, this function is mapped with '/test'
    return Response({
        "data": "Hello from django backend"
    })
