from abc import abstractmethod
from datetime import datetime

from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from base.permissions import IsAdmin, IsSuperStudent
from util.duplication.serializer import DuplicationSerializer
from util.request_response_util import validate_duplication_period


class DuplicationView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = DuplicationSerializer

    def __init__(self,
                 model,
                 model_ids: str,
                 filter_on_ids_key: str,
                 message: str):
        super().__init__()
        self.model = model
        self.model_ids = model_ids
        self.filter_on_ids_key = filter_on_ids_key.lower()
        self.message = message

    @classmethod
    @abstractmethod
    def transform_start_date_period(cls, start_date_period):
        """
        Transform the start date period to the corresponding day of that week (depending on the model being duplicated).
        """
        raise NotImplementedError

    @classmethod
    @abstractmethod
    def transform_end_date_period(cls, end_date_period):
        """
        Transform the end date period to the corresponding day of that week (depending on the model being duplicated).
        """
        raise NotImplementedError

    @classmethod
    @abstractmethod
    def transform_start_date_copy(cls, start_date_copy):
        """
        Transform the start date copy to the corresponding day of that week (depending on the model being duplicated).
        """
        raise NotImplementedError

    @abstractmethod
    def filter_instances_to_duplicate(self, instances_to_duplicate, start_date_period: datetime,
                                      end_date_period: datetime,
                                      start_date_copy: datetime):
        """
        Filter the model instances to duplicate only if there are no entries yet on that day
        """
        raise NotImplementedError

    @abstractmethod
    def create_instances(self, remaining_instances_with_copy_date):
        """
        Create the model instances
        """
        raise NotImplementedError

    @extend_schema(
        description="POST body consists of a certain period",
        request=serializer_class,
        responses={
            200: OpenApiResponse(
                description="The entries were successfully copied.",
                examples={"message": "successfully copied the entries"},
            ),
            400: OpenApiResponse(
                description="The request was invalid. The response will include an error message.",
                examples={
                    "message": "the start date of the period can't be in a later week than the week of the end date"
                },
            ),
        },
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        validated_data = serializer.validated_data
        # transform all the dates to the corresponding day of that week (depending on the model being duplicated)
        start_date_period = self.transform_start_date_period(validated_data["start_date_period"])
        end_date_period = self.transform_end_date_period(validated_data["end_date_period"])
        start_date_copy = self.transform_start_date_copy(validated_data["start_date_copy"])
        # validate the duplication period
        if r := validate_duplication_period(start_date_period, end_date_period, start_date_copy):
            return r

        # filter the model instances to duplicate
        instances_to_duplicate = self.model.objects.filter(
            date__range=[start_date_period, end_date_period]
        )
        # retrieve and apply the optional filtering on related models
        related_model_ids = validated_data.get(self.model_ids, None)
        if related_model_ids:
            instances_to_duplicate = instances_to_duplicate.filter(**{self.filter_on_ids_key: related_model_ids})

        # filter the model instances to duplicate
        remaining_instances_with_copy_date = self.filter_instances_to_duplicate(instances_to_duplicate,
                                                                                start_date_period,
                                                                                end_date_period, start_date_copy)
        self.create_instances(remaining_instances_with_copy_date)
        return Response({"message": _(self.message)}, status=status.HTTP_200_OK)
