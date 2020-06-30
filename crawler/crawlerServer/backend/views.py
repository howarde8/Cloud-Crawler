from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from rest_framework import viewsets, status
from backend import models, serializers
from rest_framework.decorators import action
from django_q.models import Schedule
import requests
import datetime
from lxml import etree
from rest_framework.response import Response
from crawlerServer.settings import API_SERVER
# Create your views here.

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = models.Schedule.objects.all()
    serializer_class = serializers.ScheduleSerializers
    filterset_fields = "__all__"

    def create(self, request, *arg, **kwargs):
        return Response({"detail":"Method \"{}\" not allowed.".format(str(request.method))}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['POST'])
    def create_job(self, request, *args, **kwargs):
        params = request.data
        keys = ["url", "xpath", "id", "frequency"]
        req_filed = []
        for key in keys:
            if key not in params:
                req_filed.append(key)
        if len(req_filed)>0:
            return_str = ""
            for field in req_filed:
                return_str = return_str + field + ", "
            return Response({"res":return_str + "is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        Schedule.objects.create(
            id=params["id"],
            func='backend.views.crawler_main',   
            args= (params["url"], params["xpath"], params["id"]),
            name="crawl_job",          
            schedule_type=Schedule.MINUTES,     
            minutes=params["frequency"],
            repeats=-1,                        # 重複次數，-1代表永不停止    
            next_run=datetime.datetime.now()
        )

        return Response({"res": "created"}, status=status.HTTP_201_CREATED)


def crawler_main(url, xpath, job_id):

    headers = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"}
    url_addres = "api/crawl"
    res = requests.get(url,headers=headers)
    if res.status_code == 200:
        content = res.content.decode()
        html = etree.HTML(content)
        xpath_res = html.xpath(xpath)
        res_dict = {}
        res_dict["id"] = job_id
        res_dict["status"] = "SUCCESS"
        res_dict["result"] = []
        for res in xpath_res:
            res_dict["result"].append({"result": res})

    else:
        res_dict = {}
        res_dict["id"] = job_id
        res_dict["status"] = "FAILED"
        res_dict["result"] = []

    api = requests.post(API_SERVER+url_addres, data=res_dict)
    
        # job_obj_ = Schedule.objects.get(pk=job_obj)
        # for res in xpath_res:
        #     res_list.append(
        #         models.Result(
        #         xpath= xpath,
        #         url= url,
        #         result= res,
        #         schedule= job_obj_)
        #     )

        
        # models.Result.objects.bulk_create(res_list, ignore_conflicts=True)
        # data = models.Result.objects.