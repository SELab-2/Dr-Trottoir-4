from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from base.permissions import IsAdmin, OwnerOfBuilding, OwnerAccount
from base.models import BuildingURL, Building
from base.serializers import BuildingUrlSerializer
from util.request_response_util import *
from drf_spectacular.utils import extend_schema

TRANSLATE = {"building": "building_id"}


class BuildingUrlDefault(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | OwnerOfBuilding]
    serializer_class = BuildingUrlSerializer

    @extend_schema(responses={201: BuildingUrlSerializer, 400: None})
    def post(self, request):
        """
        Create a new building url
        """
        data = request_to_dict(request.data)

        building_url_instance = BuildingURL()

        self.check_object_permissions(request, building_url_instance.building)

        # Below line is necessary since we use RandomIDModel
        # Without this line, we would have a ValidationError because we do not have an id yet
        # save() calls the function from the parent class RandomIDModel
        # The try is needed because the save will fail because there is no building etc. given
        # (It's a dirty fix, but it works)
        try:
            building_url_instance.save()
        except IntegrityError:
            pass

        set_keys_of_instance(building_url_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_url_instance):
            return r

        serializer = BuildingUrlSerializer(building_url_instance)
        return post_success(serializer)


class BuildingUrlIndividualView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | OwnerOfBuilding]
    serializer_class = BuildingUrlSerializer

    @extend_schema(responses={200: BuildingUrlSerializer, 400: None})
    def get(self, request, building_url_id):
        """
        Get info about a buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")

        self.check_object_permissions(request, building_url_instance.building)

        serializer = BuildingUrlSerializer(building_url_instance[0])
        return get_success(serializer)

    @extend_schema(responses={204: None, 400: None})
    def delete(self, request, building_url_id):
        """
        Delete buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")
        building_url_instance = building_url_instance[0]

        self.check_object_permissions(request, building_url_instance.building)

        building_url_instance.delete()
        return delete_success()

    @extend_schema(responses={200: BuildingUrlSerializer, 400: None})
    def patch(self, request, building_url_id):
        """
        Edit info about buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")

        building_url_instance = building_url_instance[0]
        self.check_object_permissions(request, building_url_instance.building)

        data = request_to_dict(request.data)

        set_keys_of_instance(building_url_instance, data, TRANSLATE)

        if r := try_full_clean_and_save(building_url_instance):
            return r

        serializer = BuildingUrlSerializer(building_url_instance)
        return patch_success(serializer)


class BuildingUrlSyndicView(APIView):
    """
    /syndic/<syndic_id>
    """

    permission_classes = [IsAuthenticated, IsAdmin | OwnerAccount]

    serializer_class = BuildingUrlSerializer

    def get(self, request, syndic_id):
        """
        Get all building urls of buildings where the user with given user id is syndic
        """
        id_holder = type("", (), {})()
        id_holder.id = syndic_id
        self.check_object_permissions(request, id_holder)

        # All building IDs where user is syndic
        building_ids = [building.id for building in Building.objects.filter(syndic=syndic_id)]

        building_urls_instances = BuildingURL.objects.filter(building__in=building_ids)
        serializer = BuildingUrlSerializer(building_urls_instances, many=True)
        return get_success(serializer)


class BuildingUrlBuildingView(APIView):
    """
    building/<building_id>
    """

    permission_classes = [IsAuthenticated, IsAdmin | OwnerOfBuilding]

    serializer_class = BuildingUrlSerializer

    def get(self, request, building_id):
        """
        Get all building urls of a given building
        """
        building_instance = Building.objects.filter(building_id=building_id)[0]
        if not building_instance:
            bad_request(building_instance)
        self.check_object_permissions(request, building_instance)

        building_url_instances = BuildingURL.objects.filter(building=building_id)
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return get_success(serializer)


class BuildingUrlAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = BuildingUrlSerializer

    def get(self, request):
        """
        Get all building urls
        """

        building_url_instances = BuildingURL.objects.all()
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return get_success(serializer)
