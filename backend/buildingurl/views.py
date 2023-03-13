from rest_framework.views import APIView

from base.models import BuildingURL, Building
from base.serializers import BuildingUrlSerializer
from util.request_response_util import *


class BuildingUrlDefault(APIView):

    def post(self, request):
        """
        Create a new building url
        """
        data = request_to_dict(request.data)

        building_url_instance = BuildingURL()

        # Below line is necessary since we use RandomIDModel
        # Without this line, we would have a ValidationError because we do not have an id yet
        # save() calls the function from the parent class RandomIDModel
        # The try is needed because the save will fail because there is no building etc. given
        # (It's a dirty fix, but it works)
        try:
            building_url_instance.save()
        except IntegrityError:
            pass

        if "building" in data.keys():
            data["building_id"] = data["building"]

        for key in data.keys():
            if key in vars(building_url_instance):
                setattr(building_url_instance, key, data[key])

        if r := try_full_clean_and_save(building_url_instance):
            return r

        serializer = BuildingUrlSerializer(building_url_instance)
        return post_success(serializer)


class BuildingUrlIndividualView(APIView):

    def get(self, request, building_url_id):
        """
        Get info about a buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")

        serializer = BuildingUrlSerializer(building_url_instance[0])
        return get_success(serializer)

    def delete(self, request, building_url_id):
        """
        Delete buildingurl with given id
        """
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")

        building_url_instance[0].delete()
        return delete_success()

    def patch(self, request, building_url_id):
        building_url_instance = BuildingURL.objects.filter(id=building_url_id)
        if not building_url_instance:
            return bad_request("BuildingUrl")

        building_url_instance = building_url_instance[0]
        data = request_to_dict(request.data)

        if "building" in data.keys():
            data["building_id"] = data["building"]

        print("DATA")
        print(data)

        for key in data.keys():
            if key in vars(building_url_instance):
                setattr(building_url_instance, key, data[key])

        if r := try_full_clean_and_save(building_url_instance):
            return r

        serializer = BuildingUrlSerializer(building_url_instance)
        return patch_success(serializer)


class BuildingUrlSyndicView(APIView):
    """
    /syndic/<syndic_id>
    """

    def get(self, request, syndic_id):
        """
        Get all building urls of buildings where the user with given user id is syndic
        """

        # All building IDs where user is syndic
        building_ids = [building.id for building in Building.objects.filter(syndic=syndic_id)]

        building_urls_instances = BuildingURL.objects.filter(building__in=building_ids)
        serializer = BuildingUrlSerializer(building_urls_instances, many=True)
        return get_success(serializer)


class BuildingUrlBuildingView(APIView):
    """
    building/<building_id>
    """

    def get(self, request, building_id):
        """
        Get all building urls of a given building
        """
        building_url_instances = BuildingURL.objects.filter(building=building_id)
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return get_success(serializer)


class BuildingUrlAllView(APIView):

    def get(self, request):
        """
        Get all building urls
        """
        building_url_instances = BuildingURL.objects.all()
        serializer = BuildingUrlSerializer(building_url_instances, many=True)
        return get_success(serializer)
