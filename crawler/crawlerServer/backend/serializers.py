from rest_framework import serializers
from backend import models
from django_q.models import Schedule

class ScheduleSerializers(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

# class ResultSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = models.Result
#         fields = '__all__'

# class JobSerializers(serializers.ModelSerializer):
#     class Meta:
#         model = models.Job
#         fields = '__all__'