import json

import numpy as np
import requests

from users.models import UserRecommendationWeight, UserTopicMastery
from users.utils import api_get, level, api_post


def load_user_candidate_metrics(user_id):
    try:
        user_record = UserRecommendationWeight.objects.get(user_id=user_id)
        candidate_metrics_str = user_record.candidate_metrics_json
        if candidate_metrics_str:
            return json.loads(candidate_metrics_str)
        else:
            return []
    except UserRecommendationWeight.DoesNotExist:
        return []


def save_user_candidate_metrics(user_id, candidate_metrics):
    candidate_metrics_str = json.dumps(candidate_metrics)
    try:
        user_record = UserRecommendationWeight.objects.get(user_id=user_id)
        user_record.candidate_metrics_json = candidate_metrics_str
        user_record.save()
    except UserRecommendationWeight.DoesNotExist:
        UserRecommendationWeight.objects.create(
            user_id=user_id,
            similarity_weight=1.0,
            common_topics_weight=1.0,
            difficulty_weight=1.0,
            candidate_metrics_json=candidate_metrics_str)


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
    # TODO jbs做这里，优化推荐逻辑
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
    old_metrics = load_user_candidate_metrics(user_id)
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

        score_interest=100#可以调用用户的做题历史的topic，但我不知道怎么调用

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

    updated_metrics = old_metrics + candidate_metrics
    updated_metrics=updated_metrics[-5: ]
    try:
        updated_weights = update_weights_from_latest_candidates(updated_metrics, latest_n=5, rho=0.5)
    except Exception as e:
        print(f"更新权重出错，采用默认权重：{e}")
        updated_weights = np.array([0.25, 0.2, 0.15, 0.15, 0.15, 0.1])
    w_sim, w_common, w_diff, w_know, w_int, w_path = updated_weights

    save_user_candidate_metrics(user_id, updated_metrics)

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
