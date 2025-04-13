from .constants import ALL_TOPICS
from django.conf import settings
from .models import (UserTopicMastery)
import requests
from openai import OpenAI

BASE_URL = settings.BASE_URL

# 初始化 OpenAI 客户端
model = settings.MODEL
client = OpenAI(api_key=settings.API_KEY, base_url=settings.URL)

# 初始化用户主题掌握记录

def initialize_user_topics(user):
    """为新注册的用户初始化所有 topic 的掌握记录"""
    for topic in ALL_TOPICS:
        UserTopicMastery.objects.create(
            user_id=user,
            topic_name=topic,
            mastery_level=-1.0  # 初始值为 -1.0，表示未做过该类型的题目
        )



# 以下实现推荐系统

def api_get(path, params=None):
    """发送 GET 请求到指定 API 路径"""
    resp = requests.get(f"{BASE_URL}{path}", params=params)
    resp.raise_for_status()
    return resp.json()


def api_post(path, json_body):
    """发送 POST 请求到指定 API 路径"""
    r = requests.post(f"{BASE_URL}{path}", json=json_body)
    r.raise_for_status()
    return r.json()


def level(mastery_value):
    """根据掌握程度返回等级"""
    if mastery_value < 0.33:
        return 1
    if mastery_value < 0.66:
        return 2
    return 3

