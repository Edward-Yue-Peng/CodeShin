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


# 实现评价系统
import traceback
def evaluate_code_with_gpt(description,user_code, history, related_topics):
    json_template = """你需要输出以下 JSON 格式（务必只输出 JSON 格式内容）（注意不要遗漏花括号）：
    {
      "Passed": "Yes" or "No",
      "Feedback": "你对学生代码的反馈，应包含：\n 1. 对他们努力和亮点的肯定；\n 2. 一些具体的鼓励性改进建议（不要直接给答案）；\n 3. 指导性的下一步学习方向建议。\n整体语言要像和学生一对一交谈，温暖、有耐心，避免生硬或 AI 风格表达。",
      "Ratings of related topics": {
        "arrays": 0/1/2/3,
        "linked list": 0/1/2/3,
        ...
      },
      "score": 0~3
    }
    """
    prompts = [{
        "role": "user",
        "content": f"""你是一位经验丰富的编程导师，以温和而有智慧的方式指导学生提升编程技能，
    你擅长通过分析学生的代码，找出他们的优势和需要改进的地方，并以鼓励的方式给予指导。

    当学生提交代码解答时，你需要仔细分析他们的解题思路，评估他们的编程能力，
    并提供有针对性的建议。你的反馈应该像一位关心学生进步的老师，而不是冷冰冰的评分系统。

    所有输出默认为英语。如果用户输入包含中文，你也用中文回复；否则全部用英文回复。

    在分析完学生的代码后，你的回应应包含以下几个方面，但要表达自然流畅，
    像是在进行一次温暖的一对一辅导，不要添加 emoji，否则效果太像 AI，而不像真实老师：
    1. 首先，肯定学生的努力和代码中的亮点；
    2. 接着，提出几点改进建议，用鼓励的语气引导学生思考更优解法（但不要直接给出答案）；
    3. 最后，建议下一步的学习方向，就像指引学生走向进步之路。

    评估时请考虑：
    - 解题思路是否清晰；
    - 代码效率如何；
    - 编程风格是否良好；
    - 是否展示了对相关概念的理解。

    {json_template}

    你后面将接收到四个参数，分别是：
    - 本题的描述
    - 用户的解题答案
    - 对话历史
    - 与本题相关的 topics

    {description}

    {user_code}

    {history}

    {related_topics}
    """
    }]

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
    解析 GPT 返回的 JSON 格式反馈，并处理常见格式错误。
    假设响应中只会包含一段 JSON，且可能因花括号额外或缺失而无法直接被解析。
    """

    # 1) 首先尝试直接解析整个字符串
    try:
        return json.loads(gpt_response)
    except json.JSONDecodeError:
        pass  # 无法直接解析，进入下一步

    # 2) 利用正则提取一段可能的 JSON（从第一个 '{' 到最后一个 '}'）
    #    DOTALL 让 '.' 可以匹配换行符
    match = re.search(r"\{.*\}", gpt_response, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in response after trying full parse.")

    json_snippet = match.group(0)

    # 3) 简易花括号修正，主要解决不平衡 '{' / '}'
    def fix_brackets(text):
        left_stack = 0   # 记录尚未匹配的 '{' 数
        extra_right = 0  # 记录多余的 '}' 数
        fixed_chars = []

        for ch in text:
            if ch == '{':
                left_stack += 1
                fixed_chars.append(ch)
            elif ch == '}':
                if left_stack > 0:
                    left_stack -= 1
                    fixed_chars.append(ch)
                else:
                    # 遇到无配对的 '}'，先记下来
                    extra_right += 1
            else:
                fixed_chars.append(ch)

        # 在文本开头补齐 '{' 来匹配多余的 '}'
        # 如果 extra_right=2，说明有 2 个 '}' 没有匹配，就要前面加 2 个 '{'
        # 在文本末尾补齐 '}' 来匹配剩余的 '{'
        fixed_text = '{' * extra_right + ''.join(fixed_chars) + '}' * left_stack
        return fixed_text

    balanced_snippet = fix_brackets(json_snippet)

    # 4) 尝试解析修正后的 JSON
    try:
        return json.loads(balanced_snippet)
    except json.JSONDecodeError:
        # 如果依然失败，说明不仅是花括号问题，可能还缺少逗号、双引号等。
        raise ValueError("Could not parse JSON after bracket fixing. Manual inspection is needed.")



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

def get_learning_path(user_id):
    # 从数据库中获取用户各知识点的掌握记录，例如：
    mastery_data = UserTopicMastery.objects.filter(user_id=user_id)
    # 按掌握程度从低到高排序
    sorted_topics = sorted(mastery_data, key=lambda record: record.mastery_level)
    return [record.topic_name for record in sorted_topics]

def weight(A, rho=0.5):
    Mean = np.mean(A, axis=0)
    B = A / Mean
    ideal = np.max(B, axis=0)
    absX0_Xi = np.abs(B - ideal)
    a = np.min(absX0_Xi)
    b = np.max(absX0_Xi)
    m = (a + rho * b) / (absX0_Xi + rho * b)
    w = np.mean(m, axis=0)
    q = w / np.sum(w)
    return q

def update_weights_from_latest_candidates(candidate_metrics, latest_n=5, rho=0.5):
    if len(candidate_metrics) == 0:
        return np.array([0.25, 0.2, 0.15, 0.15, 0.15, 0.1])  # 默认6维权重，和为1
    latest = candidate_metrics[-latest_n:] if len(candidate_metrics) >= latest_n else candidate_metrics
    M = np.array(latest)
    return weight(M, rho)

def recommender(user_id,cur_pid):
    """
    推荐系统逻辑，根据用户的当前题目、相关主题、历史记录等生成推荐题目。
    权重完全由 API 设置。
    """
    '''try:
        user_weights = UserRecommendationWeight.objects.get(user_id=user_id)
        W_SIMILARITY = user_weights.similarity_weight
        W_COMMON_TOPICS = user_weights.common_topics_weight
        W_DIFFICULTY = user_weights.difficulty_weight
    except UserRecommendationWeight.DoesNotExist:
        # 如果用户没有自定义权重，则使用默认权重 (你可以根据需要调整默认值)
        W_SIMILARITY = 1.0
        W_COMMON_TOPICS = 1.0
        W_DIFFICULTY = 1.0'''
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
    candidate_metrics = []
    scores = []
    learning_path = get_learning_path(user_id)
    for pid in candidates:
        if pid in done:
            continue

        # 相似性得分
        score_sim = 100 if pid in similars else 0.0

        # 共同话题得分
        topics_i = set(api_get("/api/related_topics/", {"problem_id": pid})["related_topics"])
        common = topics_i & set(related_topics)
        if common:
            poor = sum(1 for t in common if topic_level[t] < 3)
            score_common = poor / len(common)*100
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
                score_diff = max(0.0, 1 - diff / 2)*100
            else:
                score_diff = 0.0
        except requests.exceptions.RequestException as e:
            print(f"API 请求失败 (获取题目 {pid} 信息): {e}")
            continue  # 发生错误时跳过当前候选题目

        score_interest=100

        candidate_topics = topics_i
        if candidate_topics:
            poorly_mastered = sum(1 for t in candidate_topics if t in topic_level and topic_level[t] < 3)
            score_knowledge = (poorly_mastered / len(candidate_topics)) * 100
        else:
            score_knowledge = 0


        if candidate_topics:
            matching = sum(1 for t in candidate_topics if t in learning_path)
            score_path = (matching / len(candidate_topics)) * 100
        else:
            score_path = 0

        candidate_metrics.append([score_sim, score_common, score_diff, score_knowledge, score_interest, score_path])
        scores.append((pid, score_sim, score_common, score_diff, score_knowledge, score_interest, score_path))

    try:
        updated_weights = update_weights_from_latest_candidates(candidate_metrics, latest_n=5, rho=0.5)
    except Exception as e:
        print(f"更新权重出错，采用默认权重：{e}")
        updated_weights = np.array([0.25, 0.2, 0.15, 0.15, 0.15, 0.1])
    w_sim, w_common, w_diff, w_know, w_int, w_path = updated_weights

    final_scores = []
    for (pid, score_sim, score_common, score_diff, score_knowledge, score_interest, score_path) in scores:
        total = (w_sim * score_sim + w_common * score_common + w_diff * score_diff + w_know * score_knowledge + w_int * score_interest + w_path * score_path)
        final_scores.append((pid, total))
    final_scores.sort(key=lambda x: x[1], reverse=True)
    recs = [pid for pid, _ in final_scores[:2]]

    # 保存推荐结果
    api_post("/api/set_recommendations/",
             {"user_id": user_id, "recommended_problems": recs})
    print(f"推荐题目: {recs}")
    return recs
