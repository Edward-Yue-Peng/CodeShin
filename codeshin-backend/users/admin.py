from django.contrib import admin
from .models import (
    Problem,
    UserHistory,
    AutosaveCode,
    UserAttribute,
    ConversationSession,
    GptConversation,
    UserTopicMastery,
    Recommendation
)

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'acceptance_rate', 'frequency')
    search_fields = ('title',)
    list_filter = ('difficulty', 'is_premium')

@admin.register(UserHistory)
class UserHistoryAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'get_problem', 'version', 'is_passed', 'timestamp')
    search_fields = ('user_id__username', 'problem_id__title')
    list_filter = ('is_passed', 'submission_status')

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'

    def get_problem(self, obj):
        return obj.problem_id.title  # 显示关联题目的标题
    get_problem.short_description = 'Problem'

@admin.register(AutosaveCode)
class AutosaveCodeAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'get_problem', 'timestamp')
    search_fields = ('user_id__username', 'problem_id__title')

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'

    def get_problem(self, obj):
        return obj.problem_id.title  # 显示关联题目的标题
    get_problem.short_description = 'Problem'

@admin.register(UserAttribute)
class UserAttributeAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'attribute_name', 'attribute_value', 'timestamp')
    search_fields = ('user_id__username', 'attribute_name')

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'

@admin.register(ConversationSession)
class ConversationSessionAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'get_problem', 'is_resolved', 'timestamp')
    search_fields = ('user_id__username', 'problem_id__title')
    list_filter = ('is_resolved',)

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'

    def get_problem(self, obj):
        return obj.problem_id.title  # 显示关联题目的标题
    get_problem.short_description = 'Problem'

@admin.register(GptConversation)
class GptConversationAdmin(admin.ModelAdmin):
    list_display = ('session', 'conversation_type', 'timestamp')
    search_fields = ('session__user_id__username', 'session__problem_id__title')
    list_filter = ('conversation_type',)

@admin.register(UserTopicMastery)
class UserTopicMasteryAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'topic_name', 'mastery_level', 'timestamp')
    search_fields = ('user_id__username', 'topic_name')

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'timestamp')
    search_fields = ('user_id__username',)

    def get_user(self, obj):
        return obj.user_id.username  # 显示关联用户的用户名
    get_user.short_description = 'User'