from django.urls import path
from .views import (
    register,
    user_login,
    user_logout,
    get_problems,
    get_problem_difficulty,
    submit_code,
    autosave_code,
    get_progress_and_code,
    reset_problem,
    get_user_history,
    get_current_problem_api,
    get_related_topics_api,
    get_related_topics_mastery_api,
    get_all_topics_mastery_api,
    get_similar_questions_api,
    get_topic_difficulty_bucket,
    get_topic_index, 
    set_recommendation_weights_api,
    set_recommendations,
    get_recommendations,
    create_conversation_session,
    gpt_interaction_api,
    get_gpt_conversations,
    clear_gpt_conversations
)

urlpatterns = [
    # 用户管理系统
    path('register/', register, name='register'),  # 用户注册
    path('login/', user_login, name='login'),  # 用户登录
    path('logout/', user_logout, name='logout'),  # 用户注销

    # 题目管理系统
    path('problems/', get_problems, name='get_problems'),  # 获取题目数据
    path('problem_difficulty/', get_problem_difficulty, name='get_problem_difficulty'),

    # 代码管理系统
    path('submit_code/', submit_code, name='submit_code'),  # 提交代码
    path('autosave_code/', autosave_code, name='autosave_code'),  # 自动保存代码
    path('get_progress_and_code/', get_progress_and_code, name='get_progress_and_code'),  # 获取用户当前进度和代码
    path('reset_problem/', reset_problem, name='reset_problem'),  # 重置题目

    # 推荐系统
    path('get_user_history/', get_user_history, name='get_user_history'),  # 获取用户历史记录
    
    path('current_problem/', get_current_problem_api, name='get_current_problem'),  # 获取当前题号
    path('related_topics/', get_related_topics_api, name='get_related_topics'),  # 获取当前题目相关 topic
    path('related_topics_mastery/', get_related_topics_mastery_api, name='get_related_topics_mastery'),  # 获取当前题目相关 topic 的掌握度
    path('all_topics_mastery/', get_all_topics_mastery_api, name='get_all_topics_mastery'),  # 获取所有 topic 的掌握度
    path('similar_questions/', get_similar_questions_api, name='get_similar_questions'),  # 获取当前题目的相似题目

    path('topics_difficulty_bucket/', get_topic_difficulty_bucket, name='get_topic_difficulty_bucket'),  # 获取某个知识点对应的不同难度的题目ID
    path('topics_index/', get_topic_index, name='get_topic_index'),  # 获取某个知识点的排序号

    path('set_recommendation_weights/', set_recommendation_weights_api, name='set_recommendation_weights_api'),  # 设置推荐权重

    path('set_recommendations/', set_recommendations, name='set_recommendations'),  # 存储推荐题目
    path('get_recommendations/', get_recommendations, name='get_recommendations'),  # 读取推荐题目

    # GPT 相关 API
    path('create_conversation_session/', create_conversation_session, name='create_conversation_session'),  #创建新对话
    path('gpt_interaction/', gpt_interaction_api, name='gpt_interaction_api'),  # GPT 交互
    path('get_gpt_conversations/', get_gpt_conversations, name='get_gpt_conversations'),  # 获取对话记录
    path('clear_gpt_conversations/', clear_gpt_conversations, name='clear_gpt_conversations'),  # 清空对话记录
]