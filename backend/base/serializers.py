from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'email', 'firstname', 'lastname', 'phone_number', 'role', 'region')
        read_only_fields = ('id', 'email')
