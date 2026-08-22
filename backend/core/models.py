from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

class Attraction(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nome da Atração")
    description = models.TextField(blank=True, verbose_name="Descrição")
    start_time = models.DateTimeField(verbose_name="Horário de Início")
    end_time = models.DateTimeField(verbose_name="Horário de Término")
    location = models.CharField(max_length=100, blank=True, verbose_name="Local (Sala/Palco)")
    block = models.CharField(max_length=50, blank=True, verbose_name="Bloco")
    
    STATUS_CHOICES = [
        ('scheduled', 'Agendado'),
        ('started', 'Em Andamento'),
        ('delayed', 'Atrasado'),
        ('finished', 'Encerrado'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    class Meta:
        ordering = ['start_time']
        verbose_name = "Atração"
        verbose_name_plural = "Atrações"

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

class Alert(models.Model):
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(verbose_name="Descrição")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class PushSubscription(models.Model):
    endpoint = models.URLField(max_length=500)
    p256dh = models.CharField(max_length=200)
    auth = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    attractions = models.ManyToManyField(Attraction, blank=True, related_name="subscribers")

    class Meta:
        verbose_name = "Inscrição Push"
        verbose_name_plural = "Inscrições Push"

    def __str__(self):
        return f"Subscription {self.id}"

# Signals para WebSocket Broadcast
@receiver(post_save, sender=Attraction)
def attraction_saved(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "public_events",
        {
            "type": "send_event",
            "message": json.dumps({
                "type": "ATTRACTION_UPDATED",
                "id": instance.id,
                "name": instance.name,
                "message": f"A atração {instance.name} foi atualizada!"
            })
        }
    )

@receiver(post_save, sender=Alert)
def alert_saved(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "public_events",
            {
                "type": "send_event",
                "message": json.dumps({
                    "type": "NEW_ALERT",
                    "title": instance.title,
                    "description": instance.description
                })
            }
        )
