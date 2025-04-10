from django.db import models
from django.contrib.auth.models import User


# 主题模型
class Topic(models.Model):
    id = models.AutoField(primary_key=True)  # 显式定义主键
    name = models.CharField(max_length=255, unique=True)  # 主题名称
    description = models.TextField(null=True, blank=True)  # 主题描述

    class Meta:
        db_table = 'topics'  # 数据库表名
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    def __str__(self):
        return self.name


# 题目模型
class Problem(models.Model):
    id = models.AutoField(primary_key=True)  # 显式定义主键
    title = models.CharField(max_length=255)  # 题目标题
    description = models.TextField()  # 题目描述
    is_premium = models.BooleanField()  # 是否为高级题目
    difficulty = models.CharField(max_length=50)  # 难度等级（如 Easy, Medium, Hard）
    acceptance_rate = models.FloatField(null=True, blank=True)  # 通过率
    frequency = models.FloatField(null=True, blank=True)  # 出现频率
    url = models.CharField(max_length=255, null=True, blank=True)  # 题目链接
    discuss_count = models.IntegerField(null=True, blank=True)  # 讨论数量
    accepted = models.BigIntegerField(null=True, blank=True)  # 通过次数
    submissions = models.BigIntegerField(null=True, blank=True)  # 提交次数
    related_topics = models.ManyToManyField(Topic, related_name='problems')  # 相关主题（多对多关系）
    likes = models.IntegerField(null=True, blank=True)  # 点赞数
    dislikes = models.IntegerField(null=True, blank=True)  # 点踩数
    rating = models.FloatField(null=True, blank=True)  # 评分
    similar_questions = models.TextField(null=True, blank=True)  # 相似题目（逗号分隔的题目ID）

    class Meta:
        db_table = 'problems'  # 数据库表名
        verbose_name = 'Problem'
        verbose_name_plural = 'Problems'

    def __str__(self):
        return self.title
    
# 题目与主题的关联模型
class TopicProblem(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='topic_problems')  # 主题外键
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='problem_topics')  # 题目外键
    difficulty = models.CharField(max_length=10, choices=[('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard')])  # 难度

    class Meta:
        db_table = 'topic_problems'  # 数据库表名
        verbose_name = 'Topic Problem'
        verbose_name_plural = 'Topic Problems'
        unique_together = ('topic', 'problem')  # 确保同一主题和题目不会重复

    def __str__(self):
        return f"{self.topic.name} - {self.problem.title} ({self.difficulty})"


# 用户提交历史模型
class UserHistory(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    problem_id = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='problem_id')  # 题目外键
    solution_code = models.TextField()  # 提交的代码
    version = models.IntegerField(default=1)  # 提交版本号
    timestamp = models.DateTimeField(auto_now_add=True)  # 提交时间
    is_passed = models.BooleanField(default=False)  # 是否通过
    submission_status = models.CharField(max_length=50, null=True, blank=True)  # 提交状态（如 Accepted, Wrong Answer）
    score = models.FloatField(null=True, blank=True)  # 本次提交的总评分（0-1）
    feedback = models.TextField(null=True, blank=True)  # GPT 生成的反馈内容

    class Meta:
        db_table = 'user_history'  # 数据库表名
        verbose_name = 'User History'
        verbose_name_plural = 'User Histories'
        ordering = ['-timestamp']  # 默认按提交时间倒序排序

    def __str__(self):
        return f"{self.user_id.username} - {self.problem_id.title} (v{self.version})"


# 自动保存代码模型
class AutosaveCode(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    problem_id = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='problem_id')  # 题目外键
    autosave_code = models.TextField()  # 自动保存的代码
    timestamp = models.DateTimeField(auto_now_add=True)  # 自动保存时间

    class Meta:
        db_table = 'autosave_codes'  # 数据库表名
        verbose_name = 'Autosave Code'
        verbose_name_plural = 'Autosave Codes'

    def __str__(self):
        return f"{self.user_id.username} - {self.problem_id.title}"


# 用户属性模型
class UserAttribute(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    attribute_name = models.CharField(max_length=255)  # 属性名称
    attribute_value = models.FloatField()  # 属性值
    timestamp = models.DateTimeField(auto_now_add=True)  # 属性更新时间

    class Meta:
        db_table = 'user_attributes'  # 数据库表名
        verbose_name = 'User Attribute'
        verbose_name_plural = 'User Attributes'

    def __str__(self):
        return f"{self.user_id.username} - {self.attribute_name}"


# GPT 会话模型
class ConversationSession(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    problem_id = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='problem_id')  # 题目外键
    is_resolved = models.BooleanField(default=False)  # 会话是否已解决问题
    timestamp = models.DateTimeField(auto_now_add=True)  # 会话创建时间

    class Meta:
        db_table = 'conversation_sessions'  # 数据库表名
        verbose_name = 'Conversation Session'
        verbose_name_plural = 'Conversation Sessions'

    def __str__(self):
        return f"{self.user_id.username} - {self.problem_id.title} (Resolved: {self.is_resolved})"


# GPT 对话记录模型
class GptConversation(models.Model):
    session = models.ForeignKey(ConversationSession, on_delete=models.CASCADE, related_name='conversations')  # 会话外键
    message = models.TextField()  # 对话内容
    conversation_type = models.CharField(max_length=50)  # 对话类型（user 或 gpt）
    timestamp = models.DateTimeField(auto_now_add=True)  # 对话时间

    class Meta:
        db_table = 'gpt_conversations'  # 数据库表名
        verbose_name = 'GPT Conversation'
        verbose_name_plural = 'GPT Conversations'
        ordering = ['timestamp']  # 默认按时间顺序排序

    def __str__(self):
        return f"{self.session.user_id.username} - {self.session.problem_id.title} ({self.conversation_type})"


# 用户主题掌握模型
class UserTopicMastery(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    topic_name = models.CharField(max_length=255)  # 主题名称
    mastery_level = models.FloatField(default=-1.0)  # 掌握程度，-1.0 表示未做过该类型的题目
    timestamp = models.DateTimeField(auto_now=True)  # 最后更新时间

    class Meta:
        db_table = 'user_topic_mastery'  # 数据库表名
        verbose_name = 'User Topic Mastery'
        verbose_name_plural = 'User Topic Masteries'

    def __str__(self):
        return f"{self.user_id.username} - {self.topic_name} (Mastery: {self.mastery_level})"


# 推荐系统模型
class Recommendation(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')  # 用户外键
    recommended_problems = models.TextField()  # 推荐题目ID列表（逗号分隔）
    timestamp = models.DateTimeField(auto_now_add=True)  # 推荐时间

    class Meta:
        db_table = 'recommendations'  # 数据库表名
        verbose_name = 'Recommendation'
        verbose_name_plural = 'Recommendations'

    def __str__(self):
        return f"{self.user_id.username} - Recommendations"
    

# 推荐权重模型
class UserRecommendationWeight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, unique=True, related_name='recommendation_weights')
    similarity_weight = models.FloatField(default=1.0)
    common_topics_weight = models.FloatField(default=1.0)
    difficulty_weight = models.FloatField(default=1.0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_recommendation_weights'
        verbose_name = 'User Recommendation Weight'
        verbose_name_plural = 'User Recommendation Weights'

    def __str__(self):
        return f"{self.user.username}'s Recommendation Weights"