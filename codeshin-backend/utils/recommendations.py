import json
import numpy as np
import requests
from datetime import datetime, timezone
from users.models import UserHistory, RecommendationLog, UserTopicMastery
from users.utils import api_get, level, api_post


def load_user_candidate_metrics(user_id):
    """
    从 RecommendationLog 中加载用户最近 5 次的推荐参数记录。
    """
    logs = RecommendationLog.objects.filter(user_id=user_id).order_by('-timestamp')[:5]
    return [[log.score_sim, log.score_common, log.score_diff, log.score_knowledge, log.score_interest, log.score_path] for log in logs]


def save_user_candidate_metrics(user_id, problem_id, candidate_metrics):
    """
    将推荐参数保存到 RecommendationLog 中。
    """
    for metrics in candidate_metrics:
        RecommendationLog.objects.create(
            user_id=user_id,
            problem_id=problem_id,
            score_sim=metrics[0],
            score_common=metrics[1],
            score_diff=metrics[2],
            score_knowledge=metrics[3],
            score_interest=metrics[4],
            score_path=metrics[5]
        )


def get_learning_path(user_id):
    # 从数据库中获取用户各知识点的掌握记录，例如：
    mastery_data = UserTopicMastery.objects.filter(user_id=user_id)
    # 按掌握程度从低到高排序
    sorted_topics = sorted(mastery_data, key=lambda record: record.mastery_level)
    return [record.topic_name for record in sorted_topics]


def weight(A, rho=0.5):
    """
    动态计算权重。
    """
    Mean = np.mean(A, axis=0)
    print("AAAMean", Mean)

    # 避免除以 0：如果某列均值为 0，就设为一个很小的数或不做归一化
    epsilon = 1e-8
    safe_Mean = np.where(Mean == 0, epsilon, Mean)
    B = A / safe_Mean

    ideal = np.max(B, axis=0)
    absX0_Xi = np.abs(B - ideal)
    a = np.min(absX0_Xi)
    b = np.max(absX0_Xi)

    m = (a + rho * b) / (absX0_Xi + rho * b)
    w = np.mean(m, axis=0)
    q = w / np.sum(w)
    return q


def update_weights_from_latest_candidates(candidate_metrics, latest_n=5, rho=0.5):
    """
    根据最近的推荐参数记录动态更新权重。
    """
    if len(candidate_metrics) == 0:
        return np.array([0.25, 0.2, 0.15, 0.15, 0.15, 0.1])  # 默认6维权重，和为1
    latest = candidate_metrics[-latest_n:] if len(candidate_metrics) >= latest_n else candidate_metrics
    print("AAAlatest", latest)
    M = np.array(latest)
    return weight(M, rho)


def calculate_interest_score_with_time_decay(user_id, topics_i):
     """
     根据用户的历史记录和时间衰减动态计算兴趣得分。
     """
     topic_count = {}
     # 因为服务器存的是GMT时间，所以这里需要转换一下
     now = datetime.now(timezone.utc)
 
     # 查询用户历史记录
     history = UserHistory.objects.filter(user_id=user_id).values('timestamp', 'problem_id__related_topics')
 
     for record in history:
         timestamp = record['timestamp']
         if timestamp:
             time_diff = (now - timestamp).days
             decay_factor = 0.9 ** time_diff  # 指数衰减，时间越久权重越低
         else:
             decay_factor = 1.0  # 如果没有时间戳，则不衰减
 
         def to_list(x):
             return x if isinstance(x, list) else [x]
             if isinstance(x, list):
                 return x
             elif isinstance(x, str):
                 return x.split(",")  # 将逗号分隔的字符串解析为列表
             return [x]
 
         # 累计每个主题的权重
         # TODO 待对接，为什么这里输出的是一个字符串而不是列表
         # print(record['problem_id__related_topics'])
         for topic in to_list(record['problem_id__related_topics']):
             topic_count[topic] = topic_count.get(topic, 0) + decay_factor
 
     # 计算候选题目相关主题的兴趣得分
     interest_score = sum(topic_count.get(topic, 0) for topic in topics_i)
     if not any(topic in topic_count for topic in topics_i):
         return 50.0  # 如果没有交集，返回默认兴趣得分
 
     max_score = max(topic_count.values(), default=1)  # 避免除以 0
     interest_score = sum(topic_count.get(topic, 0) for topic in topics_i)
     return (interest_score / max_score) * 100  # 归一化到 0-100


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
    old_metrics = load_user_candidate_metrics(user_id)
    related_topics = api_get("/api/related_topics/", {"problem_id": cur_pid})["related_topics"]
    print("AAArelated_topics", related_topics)
    mastery_map = api_get("/api/related_topics_mastery/",
                          {"user_id": user_id, "problem_id": cur_pid})["related_topics_mastery"]
    print("AAAmastery_map",  mastery_map)
    topic_level = {t:mastery_map[t] for t in related_topics}
    print("AAAtopic_level",  topic_level)

    # 获取相似题目
    similars = api_get("/api/similar_questions/", {"problem_id": cur_pid})["similar_questions"]

    # 获取用户历史记录
    history = api_get("/api/get_user_history/",
                      {"user_id": user_id, "page_size": 1000})["history"]

    done = {h["problem_id"] for h in history if h["is_passed"]}

    # 候选题目集合
    candidates = set(similars)
    if len(similars) < 5:
        for topic, lvl in topic_level.items():
            if lvl in (1, 2):
                bucket = api_get("/api/topics_difficulty_bucket/", {"topic": topic})["difficulty bucket"]
                same_level_ids = bucket.get(str(lvl), [])
                candidates.update(same_level_ids)
    print("AAAcandidates", candidates)

    # 计算候选题目的分数
    candidate_metrics = []
    scores = []
    learning_path = get_learning_path(user_id)
    for pid in candidates:
        if pid in done:
            continue

        # 相似性得分
        score_sim = 50 if pid in similars else 0.0

        # 共同话题得分
        topics_i = set(api_get("/api/related_topics/", {"problem_id": pid})["related_topics"])
        common = topics_i & set(related_topics)
        print("AAAcommon",common)
        score_common = (sum(1 for t in common if topic_level[t] < 60) * 40) if common else 0.0

        # 难度匹配得分
        try:
             problem_difficulty_data = api_get("/api/problem_difficulty/", {"problem_id": pid})
             difficulty_str = problem_difficulty_data.get("problem_difficulty")
             difficulty_level_numeric = {"Easy": 1, "Medium": 2, "Hard": 3}.get(difficulty_str, None)
 
             if difficulty_level_numeric is not None and related_topics:
                difficulty_level_numeric = {"Easy": 1, "Medium": 2, "Hard": 3}.get(difficulty_str, 0)  # 默认值为 0
             
             if difficulty_level_numeric and related_topics:
                 avg_lvl = sum(topic_level.values()) / len(topic_level)
                 diff = abs(difficulty_level_numeric / 3.0 - avg_lvl)
                 score_diff = max(0.0, 1 - diff / 2) * 100
             else:
                 score_diff = 0.0
        except requests.exceptions.RequestException as e:
             print(f"API 请求失败 (获取题目 {pid} 信息): {e}")
             continue
 
         # 动态兴趣得分
        score_interest = calculate_interest_score_with_time_decay(user_id, topics_i)
        # 知识点掌握得分
        poorly_mastered = sum(1 for t in topics_i if t in topic_level and topic_level[t] < 60)
        score_knowledge = (poorly_mastered / len(topics_i) * 300) if topics_i else 0.0
        # 学习路径匹配得分
        matching = sum(1 for t in topics_i if t in learning_path)
        score_path = (matching / len(topics_i) * 100) if topics_i else 0.0

        candidate_metrics.append([score_sim, score_common, score_diff, score_knowledge, score_interest, score_path])
        scores.append((pid, score_sim, score_common, score_diff, score_knowledge, score_interest, score_path))
    # 更新权重
    print("AAAScores", scores)
    updated_metrics = old_metrics + candidate_metrics
    updated_metrics = updated_metrics[-5:]
    try:
        updated_weights = update_weights_from_latest_candidates(updated_metrics, latest_n=5, rho=0.5)
    except Exception as e:
        print(f"更新权重出错，采用默认权重：{e}")
        updated_weights = np.array([0.25, 0.2, 0.15, 0.15, 0.15, 0.1])
    w_sim, w_common, w_diff, w_know, w_int, w_path = updated_weights
    print("AAAw_sim, w_common, w_diff, w_know, w_int, w_path", updated_weights)
    
    # 保存推荐参数
    save_user_candidate_metrics(user_id, cur_pid, updated_metrics)

    # 计算最终分数
    final_scores = []
    for (pid, score_sim, score_common, score_diff, score_knowledge, score_interest, score_path) in scores:
        total = (w_sim * score_sim + w_common * score_common + w_diff * score_diff +
                 w_know * score_knowledge + w_int * score_interest + w_path * score_path)
        final_scores.append((pid, total))
    final_scores.sort(key=lambda x: x[1], reverse=True)
    print("AAAfinal_scores",final_scores)
    recs = [pid for pid, _ in final_scores[:2]]


    # 保存推荐结果
    print(f"推荐题目: {recs}")

    # TODO 对接，这个还有没有必要保存，这玩意总是有问题
    # api_post("/api/set_recommendations/",
    #          {"user_id": user_id, "recommended_problems": recs})
    return recs
