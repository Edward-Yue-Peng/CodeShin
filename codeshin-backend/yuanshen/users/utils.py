from .constants import ALL_TOPICS
from django.conf import settings
from .models import (UserTopicMastery, UserRecommendationWeight)
import requests
import numpy as np
from openai import OpenAI
import re
import json

BASE_URL = settings.BASE_URL

# 初始化 OpenAI 客户端
model = settings.MODEL
client = OpenAI(api_key=settings.API_KEY, base_url="https://api.openai.com/v1")

# 初始化用户主题掌握记录

def initialize_user_topics(user):
    """为新注册的用户初始化所有 topic 的掌握记录"""
    for topic in ALL_TOPICS:
        UserTopicMastery.objects.create(
            user_id=user,
            topic_name=topic,
            mastery_level=-1.0  # 初始值为 -1.0，表示未做过该类型的题目
        )


# 实现评价系统
import traceback
def evaluate_code_with_gpt(description,user_code, history, related_topics):
    prompts = [{
        "role": "system",
        "content": """你是一位经验丰富的编程导师，以温和而有智慧的方式指导学生提升编程技能。你擅长通过分析学生的代码，找出他们的优势和需要改进的地方，并以鼓励的方式给予指导。

    当学生提交代码解答时，你需要仔细分析他们的解题思路，评估他们的编程能力，并提供有针对性的建议。你的反馈应该像一位关心学生进步的老师，而不是冷冰冰的评分系统。

    所有输出默认为英语。如果用户输入的包含中文，你也用中文回复；否则全部用英文回复。

    在分析完学生的代码后，你的回应应包含以下几个方面，但表达方式要自然流畅，像是在进行一次温暖的一对一辅导, 不要添加emoji，否则太像ai了而不像人类：

    1. 首先，肯定学生的努力和代码中的亮点
    2. 接着，提出几点改进建议，用鼓励的语气引导学生思考更优的解法，但是不要给答案
    3. 最后，建议下一步的学习方向，就像指引学生踏上进步之路
    注意，生成所有上述语句的时候记得一定要回答得像一个真人一样，必须用一些人性化表达，而不是机械地单纯列出
    但是打分还请尽量客观甚至严格，语气可以亲切轻松

    评估学生代码时，考虑以下几个方面：
    - 解题思路是否清晰
    - 代码效率如何
    - 编程风格是否良好
    - 是否展示了对相关概念的理解

    你的输出必须严格遵循以下 JSON 格式（务必只输出 JSON 格式内容）：
    ```json
    {
      "Passed": "Yes" or "No",
      "Feedback": "你对学生代码的反馈，应包含：
        1. 对他们努力和亮点的肯定；
        2. 一些具体的鼓励性改进建议（不要直接给答案）；
        3. 指导性的下一步学习方向建议。
        整体语言要像和学生一对一交谈，温暖、有耐心，避免生硬或AI风格表达。",
      "Ratings of related topics": {
        "arrays": 0/1/2/3,
        "linked list": 0/1/2/3,
        ...
      },
      "score": 0~3 （整数，代表学生整体编程水平，基于题目完成情况、思路清晰度、代码效率、风格和概念掌握程度）
    }
    始终保持耐心和鼓励的态度，将批评转化为成长的机会，让学生感受到你对他们进步的真诚期待。"""},
        {"role": "system",
         "content": "你后面会接收到四个参数，分别是代表是否需要打分('Yes' or 'No'), 用户的解题答案，对话历史，以及和这个题目相关的topics"},
        {"role": "system",
         "content": f"{description} 这个数据是一道 LeetCode 上经典的问题的题目描述，用户需要练习这道题目，除非用户请求，否则不要发送题目答案，你的所有回答都是为了辅助用户学习这道题。如果需要打分来判断用户编程代码能力水平也是基于这道题目。"},
        {"role": "user", "content": f"{user_code}这是用户的解题答案"},
        {"role": "user", "content": f"{history}这是用户的对话历史"},
        {"role": "user", "content": f"{related_topics}这是这道题的related_topics"},]

    try:
        response = client.chat.completions.create(
        model=model,
        messages=prompts,
        max_tokens=4096,
        temperature=0.7)
        return response.choices[0].message.content
    except Exception as e:
        print("Exception in interaction():", e)
        traceback.print_exc()

        # 返回 JSON 字符串，统一结构
        return json.dumps({
            "error": True,
            "message": str(e),
            "traceback": traceback.format_exc()
        })


def parse_feedback(gpt_response):
    """
    解析 GPT 返回的 JSON 格式反馈，并处理常见错误格式。
    """
    # ✅ 如果 gpt_response 本身是 JSON 错误格式，提前拦截
    try:
        print(gpt_response)
        parsed = json.loads(gpt_response)
        if isinstance(parsed, dict) and parsed.get("error"):
            raise ValueError(f"GPT error: {parsed['message']}")
    except json.JSONDecodeError:
        pass  # 不是 JSON 字符串，继续向下尝试提取 JSON 段

    # ✅ 正则提取大括号包裹的 JSON 内容
    match = re.search(r"{.*}", gpt_response, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in response.")

    json_text = match.group(0)
    cleaned_text = json_text.replace("\n", "\\n").replace("\r", "\\r")

    # print(f"📦 Raw cleaned_text: {repr(cleaned_text)}")

    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        # print("💥 JSON decode failed, cleaned_text:")
        # print(cleaned_text)
        raise e


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


def recommender(user_id):
    """
    推荐系统逻辑，根据用户的当前题目、相关主题、历史记录等生成推荐题目。
    权重完全由 API 设置。
    """
    try:
        user_weights = UserRecommendationWeight.objects.get(user_id=user_id)
        W_SIMILARITY = user_weights.similarity_weight
        W_COMMON_TOPICS = user_weights.common_topics_weight
        W_DIFFICULTY = user_weights.difficulty_weight
    except UserRecommendationWeight.DoesNotExist:
        # 如果用户没有自定义权重，则使用默认权重 (你可以根据需要调整默认值)
        W_SIMILARITY = 1.0
        W_COMMON_TOPICS = 1.0
        W_DIFFICULTY = 1.0

    # 获取当前题目 ID
    cur_pid = api_get("/api/current_problem/", {"user_id": user_id})["current_problem_id"]

    # 获取相关主题和用户对这些主题的掌握程度
    related_topics = api_get("/api/related_topics/", {"problem_id": cur_pid})["related_topics"]
    mastery_map = api_get("/api/related_topics_mastery/",
                          {"user_id": user_id, "problem_id": cur_pid})["related_topics_mastery"]
    topic_level = {t: level(mastery_map[t]) for t in related_topics}

    # 获取相似题目
    similars = api_get("/api/similar_questions/", {"problem_id": cur_pid})["similar_questions"]

    # 获取用户历史记录
    history = api_get("/api/get_user_history/",
                      {"user_id": user_id, "page_size": 1000})["history"]
    done = {h["problem_id"] for h in history if h["is_passed"]}

    # 候选题目集合
    candidates = set(similars)

    # 如果相似题目不足，补充候选题目
    if len(similars) < 5:
        for topic, lvl in topic_level.items():
            if lvl in (1, 2):
                bucket = api_get("/api/topics_difficulty_bucket/", {"topic": topic})["difficulty bucket"]
                same_level_ids = bucket.get(str(lvl), [])
                candidates.update(same_level_ids)

    # 计算候选题目的分数
    scores = []
    for pid in candidates:
        if pid in done:
            continue

        # 相似性得分
        score_sim = 1.0 if pid in similars else 0.0

        # 共同话题得分
        topics_i = set(api_get("/api/related_topics/", {"problem_id": pid})["related_topics"])
        common = topics_i & set(related_topics)
        if common:
            poor = sum(1 for t in common if topic_level[t] < 3)
            score_common = poor / len(common)
        else:
            score_common = 0.0

        try:
            # 难度匹配得分
            problem_difficulty_data = api_get("/api/problem_difficulty/", {"problem_id": pid})
            difficulty_str = problem_difficulty_data.get("problem_difficulty")
            difficulty_level_numeric = None

            if difficulty_str == "Easy":
                difficulty_level_numeric = 1
            elif difficulty_str == "Medium":
                difficulty_level_numeric = 2
            elif difficulty_str == "Hard":
                difficulty_level_numeric = 3

            if difficulty_level_numeric is not None and related_topics:
                avg_lvl = sum(topic_level.values()) / len(topic_level)
                diff = abs(difficulty_level_numeric / 3.0 - avg_lvl)
                score_diff = max(0.0, 1 - diff / 2)
            else:
                score_diff = 0.0

            # 总分
            total = (W_SIMILARITY * score_sim +
                     W_COMMON_TOPICS * score_common +
                     W_DIFFICULTY * score_diff)
            scores.append((pid, total))

        except requests.exceptions.RequestException as e:
            print(f"API 请求失败 (获取题目 {pid} 信息): {e}")
            continue  # 发生错误时跳过当前候选题目

    # 按分数排序并选择前两个推荐题目
    scores.sort(key=lambda x: x[1], reverse=True)
    recs = [pid for pid, _ in scores[:2]]

    # 保存推荐结果
    api_post("/api/set_recommendations/",
             {"user_id": user_id, "recommended_problems": recs})
    return recs
