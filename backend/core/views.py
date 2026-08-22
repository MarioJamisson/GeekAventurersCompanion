from rest_framework import viewsets
from .models import Attraction, Alert
from .serializers import AttractionSerializer, AlertSerializer

class AttractionViewSet(viewsets.ModelViewSet):
    queryset = Attraction.objects.all()
    serializer_class = AttractionSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
