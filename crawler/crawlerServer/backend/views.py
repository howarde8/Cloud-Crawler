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
from lxml import etree
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions as expected
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import os
import threading

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

    def close_browth(self, driver):
        driver.close()

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

        options = Options()
        options.add_argument('-headless') 
        options.add_argument('--no-sandbox') 
        options.add_argument('--disable-dev-shm-usage') 

        proxy = json.loads(params["proxy"])
        PROXY = "{}:{}".format(proxy["IP"], proxy["port"])
        webdriver.DesiredCapabilities.CHROME['proxy'] = {
            "httpProxy": PROXY,
            "proxyType": "MANUAL",
        }

        driver = webdriver.Remote(command_executor='http://chromedrive:4444/wd/hub', desired_capabilities=DesiredCapabilities.CHROME, options=options)
        driver.get(request.data["url"])
        try:
            texts = driver.find_elements_by_xpath(request.data["xpath"])
       
        except:
            thread = threading.Thread(target = self.close_browth, args=(driver,))
            thread.start()
            res_dict = {}
            res_dict["status"] = "FAILED"
            res_dict["body"] = "BAD XPATH"
            return Response(res_dict, status=status.HTTP_400_BAD_REQUEST)

        else:
            res_dict = {}
            res_dict["status"] = "SUCCESS"
            res_dict["body"] = []
            for text in texts:
                res_dict["body"].append(text.text)
            thread = threading.Thread(target = self.close_browth, args=(driver,))
            thread.start()
            return Response(res_dict, status=status.HTTP_201_CREATED)

        
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

        try:
            Schedule.objects.create(
                id=params["id"],
                func='backend.views.crawler_main',   
                args= (params["url"], params["xpath"], params["id"], params["proxy"]),
                name="crawl_job",          
                schedule_type="C",     
                cron = params["frequency"],
                repeats=-1,                        # 重複次數，-1代表永不停止    
                next_run=datetime.datetime.now()
            )
        except:
            return Response({"res": "ID repeat"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"res": "created"}, status=status.HTTP_201_CREATED)


def crawler_main(url, xpath, job_id, proxy):


    url_addres = "api/crawl"
    proxy = json.loads(proxy)
    PROXY = "{}:{}".format(proxy["IP"], proxy["port"])
    webdriver.DesiredCapabilities.CHROME['proxy'] = {
        "httpProxy": PROXY,
        "proxyType": "MANUAL",
    }

    options = Options()
    options.add_argument('-headless') 
    options.add_argument('--no-sandbox') 
    options.add_argument('--disable-dev-shm-usage') 

    driver = webdriver.Remote(command_executor='http://chromedrive:4444/wd/hub', desired_capabilities=DesiredCapabilities.CHROME, options=options)
    driver.get(url)

    try:
        texts = driver.find_elements_by_xpath(xpath)

    except:
        res_dict = {}
        res_dict["status"] = "FAILED"
        res_dict["body"] = "BAD XPATH"
        api = requests.post(API_SERVER+url_addres, data=res_dict)
        driver.close()

    else:
        res_dict = {}
        res_dict["status"] = "SUCCESS"
        res_dict["body"] = []
        for text in texts:
            res_dict["body"].append(text.text)
        print(res_dict, "To API")
        api = requests.post(API_SERVER+url_addres, data=res_dict)
        driver.close()
       
