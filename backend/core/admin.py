from django.contrib import admin
from .models import Attraction, PushSubscription

@admin.register(Attraction)
class AttractionAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time', 'location', 'status')
    list_filter = ('status', 'location')
    search_fields = ('name', 'description')

@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'endpoint', 'created_at')
