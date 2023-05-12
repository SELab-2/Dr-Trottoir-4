import re

from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.models import GarbageCollection, Building
from base.permissions import IsSuperStudent, IsAdmin, ReadOnlyStudent, ReadOnlyOwnerOfBuilding
from base.serializers import GarbageCollectionSerializer
from garbage_collection.serializers import GarbageCollectionDuplicateRequestSerializer
from util.duplication.view import DuplicationView
from util.request_response_util import *
from util.util import get_monday_of_current_week, get_sunday_of_current_week

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
        building_instance = Building.objects.filter(id=building_id)
        if not building_instance:
            return not_found("building")

        self.check_object_permissions(request, building_instance[0])

        filters = {
            "start-date": get_filter_object("date__gte"),
            "end-date": get_filter_object("date__lte"),
        }
        garbage_collection_instances = GarbageCollection.objects.filter(building=building_id)

        try:
            garbage_collection_instances = filter_instances(request, garbage_collection_instances, filters)
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
            "start-date": get_filter_object("date__gte"),
            "end-date": get_filter_object("date__lte"),
        }
        garbage_collection_instances = GarbageCollection.objects.all()

        try:
            garbage_collection_instances = filter_instances(request, garbage_collection_instances, filters)
        except BadRequest as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = GarbageCollectionSerializer(garbage_collection_instances, many=True)
        return get_success(serializer)


class GarbageCollectionDuplicateView(DuplicationView):
    serializer_class = GarbageCollectionDuplicateRequestSerializer

    @classmethod
    def transform_start_date_period(cls, start_date_period):
        return get_monday_of_current_week(start_date_period)

    @classmethod
    def transform_end_date_period(cls, end_date_period):
        return get_sunday_of_current_week(end_date_period)

    @classmethod
    def transform_start_date_copy(cls, start_date_copy):
        return get_monday_of_current_week(start_date_copy)

    def __init__(self):
        super().__init__(
            model=GarbageCollection,
            model_ids="building_ids",
            filter_on_ids_key="building__id__in",
            message="successfully duplicated garbage collection entries"
        )

    def filter_instances_to_duplicate(self, instances_to_duplicate, start_date_period: datetime,
                                      end_date_period: datetime, start_date_copy: datetime):
        remaining_garbage_collections = []
        for gc in instances_to_duplicate:
            # offset the date by the start date difference
            copy_date = (datetime.combine(gc.date, datetime.min.time()) + (
                    start_date_copy - start_date_period)).date()
            if not GarbageCollection.objects.filter(
                    date=copy_date,
                    building=gc.building,
                    garbage_type=gc.garbage_type
            ).exists():
                remaining_garbage_collections.append((gc, copy_date))
        return remaining_garbage_collections

    def create_instances(self, remaining_instances_with_copy_date):
        for remaining_gc, copy_date in remaining_instances_with_copy_date:
            GarbageCollection.objects.create(
                date=copy_date,
                building=remaining_gc.building,
                garbage_type=remaining_gc.garbage_type
            )


class GarbageCollectionBulkMoveView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsSuperStudent]
    serializer_class = GarbageCollectionSerializer

    @extend_schema(
        responses={200: serializer_class, 400: None},
        parameters=param_docs(
            {
                "garbage_type": ("The type of garbage to move", True, OpenApiTypes.STR),
                "date": ("The date of the garbage collection to move", True, OpenApiTypes.DATE),
                "move_to_date": ("The date to move the garbage collection to", True, OpenApiTypes.DATE),
                "region": ("The region of the garbage collection to move", False, OpenApiTypes.INT),
                "tour": ("The tour of the garbage collection to move", False, OpenApiTypes.INT),
                "buildings": ("A list of building id's of the garbage collection to move", False, OpenApiTypes.STR),
            }
        ),
    )
    def post(self, request):
        """
        Move a batch of garbage collections to a new date. The batch can be filtered by region, tour and/or buildings.
        """
        # we support params garbage_type, date, move_to_date and region

        # get the params

        # This is bad code, it should be possible to get "GFT", "GLS" ... from the model directly (a solution could be to put them in an it in the model)
        garbage_type = get_arbitrary_param(
            request, "garbage_type", allowed_keys={"GFT", "GLS", "GRF", "KER", "PAP", "PMD", "RES"}, required=True
        )
        date = get_date_param(request, "date", required=True)
        move_to_date = get_date_param(request, "move_to_date", required=True)

        # At least one of them should be given
        region = get_id_param(request, "region", required=False)
        tour = get_id_param(request, "tour", required=False)
        buildings = get_arbitrary_param(request, "buildings", required=False)

        if not region and not tour and not buildings:
            return bad_request_custom_error_message(
                _("The parameter(s) 'region' (id) and/or 'tour' (id) and/or 'buildings' (list of id's) should be given")
            )

        if buildings:
            invalid_building_error_message = _("The query param 'building' should be a list of ints")

            if not re.match(r"\[(\s*\d+\s*,?)+]", buildings):
                return bad_request_custom_error_message(invalid_building_error_message)

            try:
                buildings = [int(id_str.rstrip("]").lstrip("[")) for id_str in buildings.split(",")]
            except ValueError:
                return bad_request_custom_error_message(invalid_building_error_message)

        # Get all garbage collections with given garbage_type and date
        garbage_collections_instances = GarbageCollection.objects.filter(garbage_type=garbage_type, date=date)

        building_instances = Building.objects
        if region:
            building_instances = building_instances.filter(region_id=region)
        if tour:
            buildings_on_tour = Building.objects.filter(buildingontour__tour_id=tour)
            building_instances = building_instances.filter(id__in=buildings_on_tour)
        if buildings:
            building_instances = building_instances.filter(id__in=buildings)

        # Filter the garbage_collection_instances on the right buildings
        garbage_collections_instances = garbage_collections_instances.filter(building_id__in=building_instances)

        # For every garbage_collection in garbage_collection_instances, change the date to move_to_date
        ids = []
        for garbage_collection in garbage_collections_instances:
            garbage_collection.date = move_to_date.date()
            if r := try_full_clean_and_save(garbage_collection):
                return r
            ids.append(garbage_collection.id)

        updated_garbage_collection_instances = GarbageCollection.objects.filter(id__in=ids)
        return Response(
            self.serializer_class(updated_garbage_collection_instances, many=True).data, status=status.HTTP_200_OK
        )
