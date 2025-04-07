from .constants import ALL_TOPICS
from .models import UserTopicMastery
import random

def initialize_user_topics(user):
    """为新注册的用户初始化所有 topic 的掌握记录"""
    for topic in ALL_TOPICS:
        UserTopicMastery.objects.create(
            user_id=user,
            topic_name=topic,
            mastery_level=-1.0  # 初始值为 -1.0，表示未做过该类型的题目
        )

def gpt_score(solution_code, conversation_text, related_topics):
    """
    临时实现的 gpt_score 函数，用于模拟返回 topic 的评分。
    """
    topic_scores = {}
    for topic in related_topics:
        # 随机生成一个 0 到 1 之间的分数
        topic_scores[topic] = random.uniform(0, 1)
    return topic_scores