import factory
import factory.fuzzy as ff

from .models import Region
from .serializers import RegionSerializer


class RegionFactory(factory.Factory):
    region = ff.FuzzyChoice(choices=[
        "Gent",
        "Brugge",
        "Antwerpen"
    ])

    class Meta:
        model = Region

    @staticmethod
    def getRegion(**kwargs):
        instance = RegionFactory.create(**kwargs)
        serializer = RegionSerializer(instance)
        data = serializer.data
        # we are not interested in the id
        del data["id"]
        return dict(data)
