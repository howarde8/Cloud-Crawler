import datetime
import json
import re
import requests
from backend import models, serializers
from crawlerServer.settings import API_SERVER
from django.core.cache import cache
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.shortcuts import render
from django_q.models import Schedule
from django_q.tasks import schedule
from lxml import etree
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.

class ProxyServer(APIView):
    def get(self, request, format=None):
        proxy_server = cache.get("proxy_server")

        if proxy_server == None:
            proxy_server_res = requests.get("https://www.proxynova.com/proxy-server-list/")
            content = proxy_server_res.content.decode()
            html = etree.HTML(content)
            xpath = "/html/body/div[3]/div[2]/table/tbody[1]/tr"
            xpath_res = html.xpath(xpath)
            proxy_server = []
            for obj in xpath_res:
                try:
                    proxy_server.append({
                        "IP":obj.xpath("./td[1]/abbr/@title")[0].strip(),
                        "port":obj.xpath("./td[2]/text()")[0].strip(),
                        "country":obj.xpath("./td[6]/a/text()")[0].strip(),
                        "anonymity":obj.xpath("./td[7]/span/text()")[0].strip(),
                    })
                except:
                    continue
            cache.set("proxy_server", proxy_server, timeout=3600)
        return Response(proxy_server, status=status.HTTP_200_OK)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = models.Schedule.objects.all()
    serializer_class = serializers.ScheduleSerializers
    filterset_fields = "__all__"

    def create(self, request, *arg, **kwargs):
        return Response({"detail":"Method \"{}\" not allowed.".format(str(request.method))}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=False, methods=['POST'])
    def test_job(self, request, *args, **kwargs):
        params = request.data
        keys = ["url", "xpath", "proxy"]
        req_filed = []
        for key in keys:
            if key not in params:
                req_filed.append(key)
        if len(req_filed)>0:
            return_str = ""
            for field in req_filed:
                return_str = return_str + field + ", "
            return Response({"res":return_str + "is required."}, status=status.HTTP_400_BAD_REQUEST)
        proxy = json.loads(params["proxy"])
        IP = proxy["IP"]
        port = proxy["port"]
        proxies = {"http": "http://{}:{}".format(IP, port),} 

        try:
            res = requests.get(params["url"], proxies = proxies, timeout=5)
        except:
            res_dict = {}
            res_dict["status"] = "FAILED"
            res_dict["body"] = "BAD URL"
            return Response(res_dict, status=status.HTTP_400_BAD_REQUEST)

        else:
            if res.status_code == 200:
                content = res.content.decode()
                html = etree.HTML(content)
                xpath_res = html.xpath(params["xpath"])
                res_dict = {}
                res_dict["status"] = "SUCCESS"
                res_dict["body"] = []
                for res in xpath_res:
                    if isinstance(res, etree._Element):
                        continue
                    if isinstance(res, list):
                        res = res[0]
                    res_dict["body"].append({"result": res.strip()})
                return Response(res_dict, status=status.HTTP_201_CREATED)

            else:
                res_dict = {}
                res_dict["status"] = "FAILED"
                res_dict["body"] = "CHANGE PROXY SERVER"
                return Response(res_dict, status=status.HTTP_400_BAD_REQUEST)

        
    @action(detail=False, methods=['POST'])
    def create_job(self, request, *args, **kwargs):
        params = request.data
        keys = ["url", "xpath", "id", "frequency", "proxy"]
        req_filed = []
        for key in keys:
            if key not in params:
                req_filed.append(key)
        if len(req_filed)>0:
            return_str = ""
            for field in req_filed:
                return_str = return_str + field + ", "
            return Response({"res":return_str + "is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Schedule.objects.create(
        #     id=params["id"],
        #     func='backend.views.crawler_main',   
        #     args= (params["url"], params["xpath"], params["id"], params["proxy"]),
        #     name="crawl_job",          
        #     schedule_type="C",     
        #     cron = params["frequency"],
        #     repeats=-1,                        # 重複次數，-1代表永不停止    
        #     next_run=datetime.datetime.now()
        # )
        schedule(
            'backend.views.crawler_main',
            params["url"], params["xpath"], params["id"], params["proxy"], 
            name="crawl_job_" + params["id"],
            schedule_type="C",
            cron = params["frequency"],
            repeats=-1,                        # 重複次數，-1代表永不停止    
            next_run=datetime.datetime.now()
        )
        return Response({"res": "created"}, status=status.HTTP_201_CREATED)


def crawler_main(url, xpath, job_id):


    url_addres = "api/crawl"
    proxy = json.loads(params["proxy"])
    IP = proxy["IP"]
    port = proxy["port"]
    proxies = {"http": "http://{}:{}".format(IP, port),} 
    try:
        res = requests.get(url, timeout=5)

    except:
        res_dict = {}
        res_dict["id"] = job_id
        res_dict["status"] = "FAILED"
        res_dict["body"] = "BAD URL"
        api = requests.post(API_SERVER+url_addres, data=res_dict)

    else:
        if res.status_code == 200:
            content = res.content.decode()
            html = etree.HTML(content)
            xpath_res = html.xpath(xpath)
            res_dict = {}
            res_dict["id"] = job_id
            res_dict["status"] = "SUCCESS"
            res_dict["body"] = []
            for res in xpath_res:
                if isinstance(res, etree._Element):
                    continue
                if isinstance(res, list):
                    res = res[0]
                res_dict["body"].append({"result": res.strip()})

        else:
            res_dict = {}
            res_dict["id"] = job_id
            res_dict["status"] = "FAILED"
            res_dict["body"] = "CHANGE PROXY SERVER"
            

        api = requests.post(API_SERVER+url_addres, data=res_dict)
