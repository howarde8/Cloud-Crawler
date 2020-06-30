from django.db import models
from django_q.models import Schedule

# Create your models here.

# class Job(models.Model):
#     job = models.CharField(max_length=100, null=False)
#     class Meta:
#         app_label = "backend"
#         db_table = "Job"


# class Result(models.Model):
#     schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
#     xpath =  models.CharField(max_length=100, null=False)
#     url = models.CharField(max_length=100, null=False)
#     result = models.CharField(max_length=1000, null=False)
#     class Meta:
#         app_label = "backend"
#         db_table = "result"