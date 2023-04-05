from datetime import timedelta, date

from drf_spectacular.types import OpenApiTypes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import GarbageCollection, Building
from base.permissions import IsSuperStudent, IsAdmin, ReadOnlyStudent, ReadOnlyOwnerOfBuilding, OwnerOfBuilding
from base.serializers import GarbageCollectionSerializer
from garbage_collection.serializers import GarbageCollectionDuplicateRequestSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.utils.translation import gettext_lazy as _

from util.util import get_monday_of_week, get_sunday_of_week

TRANSLATE = {"building": "building_id"}


class DefaultGarbageCollection(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = GarbageCollectionSerializer

    @extend_schema(responses=post_docs(GarbageCollectionSerializer))
    def post(self, request):
        """
        Create new garbage collection
        """
        data = request_to_dict(request.data)

        garbage_collection_instance = GarbageCollection()

        set_keys_of_instance(garbage_collection_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return post_success(serializer)


class GarbageCollectionIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = GarbageCollectionSerializer

    @extend_schema(responses=get_docs(GarbageCollectionSerializer))
    def get(self, request, garbage_collection_id):
        """
        Get info about a garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return not_found("GarbageCollection")
        garbage_collection_instance = garbage_collection_instance[0]

        self.check_object_permissions(request, garbage_collection_instance.building)

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return get_success(serializer)

    @extend_schema(responses=delete_docs())
    def delete(self, request, garbage_collection_id):
        """
        Delete garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return not_found("GarbageCollection")
        self.check_object_permissions(request, garbage_collection_instance[0].building)
        garbage_collection_instance[0].delete()
        return delete_success()

    @extend_schema(responses=patch_docs(GarbageCollectionSerializer))
    def patch(self, request, garbage_collection_id):
        """
        Edit garbage collection with given id
        """
        garbage_collection_instance = GarbageCollection.objects.filter(id=garbage_collection_id)
        if not garbage_collection_instance:
            return not_found("GarbageCollection")

        garbage_collection_instance = garbage_collection_instance[0]

        self.check_object_permissions(request, garbage_collection_instance.building)

        data = request_to_dict(request.data)

        set_keys_of_instance(garbage_collection_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(garbage_collection_instance):
            return r

        serializer = GarbageCollectionSerializer(garbage_collection_instance)
        return patch_success(serializer)


class GarbageCollectionIndividualBuildingView(APIView):
    """
    /building/<buildingid>
    """

    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent | ReadOnlyStudent | ReadOnlyOwnerOfBuilding]
    serializer_class = GarbageCollectionSerializer

    @extend_schema(
        parameters=param_docs(
            {
                "start-date": ("Filter entries starting from start-date", False, OpenApiTypes.DATE),
                "end-date": ("Filter entries up till end-date", False, OpenApiTypes.DATE),
            }
        )
    )
    def get(self, request, building_id):
        """
        Get info about all garbage collections of a building with given id
        """
        building_instance = Building.objects.filter(building_id=building_id)
        if not building_instance:
            return not_found("building")

        self.check_object_permissions(request, building_instance[0])

        filters = {
            "start-date": ("date__gte", False),
            "end-date": ("date__lte", False),
        }
        garbage_collection_instances = GarbageCollection.objects.filter(building=building_id)
        if r := filter_instances(request, garbage_collection_instances, filters):
            return r
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_success(serializer)


class GarbageCollectionAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = GarbageCollectionSerializer

    @extend_schema(
        parameters=param_docs(
            {
                "start-date": ("Filter entries starting from start-date", False, OpenApiTypes.DATE),
                "end-date": ("Filter entries up till end-date", False, OpenApiTypes.DATE),
            }
        )
    )
    def get(self, request):
        """
        Get all garbage collections
        """
        filters = {
            "start-date": ("date__gte", False),
            "end-date": ("date__lte", False),
        }
        garbage_collection_instances = GarbageCollection.objects.all()
        if r := filter_instances(request, garbage_collection_instances, filters):
            return r
        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_success(serializer)


def validate_duplication_period(start_period: datetime, end_period: datetime, start_copy: datetime) -> Response | None:
    # validate period itself
    if start_period > end_period:
        return Response(
            {"message": _("the start date of the period can't be in a later week than the week of the end date")},
            status=status.HTTP_400_BAD_REQUEST,
        )
    # validate interaction with copy period
    if start_copy <= end_period:
        return Response(
            {
                "message": _(
                    "the start date of the period to which you want to copy must be, at a minimum, in the week "
                    "immediately following the end date of the original period"
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class GarbageCollectionDuplicateView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = GarbageCollectionDuplicateRequestSerializer

    @extend_schema(
        description="POST body consists of a certain period",
        request=GarbageCollectionDuplicateRequestSerializer,
        responses={
            200: OpenApiResponse(
                description="The garbage collections were successfully copied.",
                examples={"message": "successfully copied the garbage collections"},
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
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        # transform them into the appropriate week-days:
        start_date_period = get_monday_of_week(validated_data.get("start-date-period"))
        end_date_period = get_sunday_of_week(validated_data.get("end-date-period"))
        start_date_copy = get_monday_of_week(validated_data.get("start-date-copy"))

        if r := validate_duplication_period(start_date_period, end_date_period, start_date_copy):
            return r

        # filter the GarbageCollections to duplicate
        garbage_collections_to_duplicate = GarbageCollection.objects.filter(
            date__range=[start_date_period, end_date_period]
        )
        # retrieve and apply the optional filtering on buildings
        building_ids = validated_data.get("building-ids", None)
        if building_ids:
            garbage_collections_to_duplicate = garbage_collections_to_duplicate.filter(building__id__in=building_ids)

        # loop through the GarbageCollections to duplicate and create a copy if it doesn't already exist
        for gc in garbage_collections_to_duplicate:
            # offset the date by the start date difference
            copy_date = (datetime.combine(gc.date, datetime.min.time()) + (start_date_copy - start_date_period)).date()
            if not GarbageCollection.objects.filter(date=copy_date, building=gc.building).exists():
                GarbageCollection.objects.create(date=copy_date, building=gc.building, garbage_type=gc.garbage_type)
        return Response({"message": _("successfully copied the garbage collections")}, status=status.HTTP_200_OK)
