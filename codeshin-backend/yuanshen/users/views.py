from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.paginator import Paginator, EmptyPage
from django.conf import settings
from .models import (
    Problem, UserHistory, AutosaveCode, UserTopicMastery, Recommendation,
    GptConversation, ConversationSession, Topic, TopicProblem, UserRecommendationWeight
)
from .utils import initialize_user_topics, recommender
import json
import requests
from .constants import ALL_TOPICS

# 用户管理系统

@csrf_exempt
def register(request):
    """用户注册"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists"}, status=400)

            # 创建用户
            user = User.objects.create(username=username)
            user.set_password(password)  # 使用 set_password 来哈希密码
            user.save()  # 显式保存 User 对象，确保其拥有 ID

            # 初始化用户的 topic 掌握记录
            initialize_user_topics(user)

            return JsonResponse({"message": "User registered successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def user_login(request):
    """用户登录"""
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def user_logout(request):
    """用户注销"""
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logout successful'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


# 题目管理系统

@csrf_exempt
def get_problems(request):
    """获取题目数据"""
    if request.method == 'GET':
        problem_id = request.GET.get('id')  # 获取请求参数中的 id
        if problem_id:
            try:
                # 按 id 查询单个题目
                problem = Problem.objects.get(id=problem_id)
                return JsonResponse({
                    "id": problem.id,
                    "title": problem.title,
                    "description": problem.description,
                    "difficulty": problem.difficulty,
                    "is_premium": problem.is_premium,
                    "acceptance_rate": problem.acceptance_rate,
                    "frequency": problem.frequency,
                    "url": problem.url,
                    "discuss_count": problem.discuss_count,
                    "accepted": problem.accepted,
                    "submissions": problem.submissions,
                    "related_topics": [topic.name for topic in problem.related_topics.all()],
                    "likes": problem.likes,
                    "dislikes": problem.dislikes,
                    "rating": problem.rating,
                    "similar_questions": problem.similar_questions,
                }, status=200)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Problem not found"}, status=404)
        else:
            # 如果没有传 id，返回所有题目，包含所有字段
            problems = Problem.objects.all()
            problem_list = []
            for problem in problems:
                problem_list.append({
                    "id": problem.id,
                    "title": problem.title,
                    "description": problem.description,
                    "difficulty": problem.difficulty,
                    "is_premium": problem.is_premium,
                    "acceptance_rate": problem.acceptance_rate,
                    "frequency": problem.frequency,
                    "url": problem.url,
                    "discuss_count": problem.discuss_count,
                    "accepted": problem.accepted,
                    "submissions": problem.submissions,
                    "related_topics": [topic.name for topic in problem.related_topics.all()],
                    "likes": problem.likes,
                    "dislikes": problem.dislikes,
                    "rating": problem.rating,
                    "similar_questions": problem.similar_questions,
                })
            return JsonResponse(problem_list, safe=False, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_problem_difficulty(request):
    """获取题目的难度"""
    if request.method == 'GET':
        problem_id = request.GET.get('problem_id')
        if not problem_id:
            return JsonResponse({"error": "Missing problem_id"}, status=400)

        try:
            problem = Problem.objects.get(id=problem_id)
            return JsonResponse({"problem_difficulty": problem.difficulty}, status=200)
        except Problem.DoesNotExist:
            return JsonResponse({"error": f"Problem with ID {problem_id} does not exist"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# 代码管理系统

@csrf_exempt
def submit_code(request):
    """提交代码并打分"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id_from_request = data.get('user_id')
            problem_id_from_request = data.get('problem_id')
            solution_code = data.get('solution_code')
            is_passed = data.get('is_passed', False)  # 是否通过，默认为 False
            submission_status = data.get('submission_status', None)  # 提交状态

            if not user_id_from_request or not problem_id_from_request or not solution_code:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 检查用户和题目是否存在
            try:
                user = User.objects.get(id=user_id_from_request)
                problem = Problem.objects.get(id=problem_id_from_request)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 获取当前题目的最新版本号
            latest_submission = UserHistory.objects.filter(user_id=user, problem_id=problem).order_by('-version').first()
            new_version = (latest_submission.version + 1) if latest_submission else 1

            # 调用 GPT 打分系统
            from .utils import evaluate_code_with_gpt, parse_feedback
            description = problem.description
            history = "\n".join([c.message for c in GptConversation.objects.filter(session__user_id=user, session__problem_id=problem)])
            related_topics = [topic.name for topic in problem.related_topics.all()]
            gpt_response = evaluate_code_with_gpt(description, solution_code, history, related_topics)
            feedback_data = parse_feedback(gpt_response)

            # 提取 GPT 返回的数据
            passed = feedback_data.get("Passed", "No") == "Yes"
            feedback = feedback_data.get("Feedback", "")
            ratings = feedback_data.get("Ratings of related topics", {})
            score = feedback_data.get("score", None)

            # 更新用户的掌握程度
            for topic, mastery_level in ratings.items():
                UserTopicMastery.objects.update_or_create(
                    user_id=user,
                    topic_name=topic,
                    defaults={"mastery_level": mastery_level}
                )

            # 保存用户提交记录
            UserHistory.objects.create(
                user_id=user,
                problem_id=problem,
                solution_code=solution_code,
                version=new_version,
                is_passed=passed,
                submission_status=submission_status,
                score=score,
                feedback=feedback
            )

            # 清除 autosave_codes 表中的记录
            AutosaveCode.objects.filter(user_id=user, problem_id=problem).delete()

            # **调用推荐系统逻辑**
            recommendations = recommender(user.id)  # 调用推荐系统函数

            # 返回响应，包括推荐结果和 GPT 反馈
            return JsonResponse({
                "message": "Code submitted and scored successfully",
                "version": new_version,
                "recommendations": recommendations,  # 将推荐结果返回给用户
                "score": score,  # 返回 GPT 评分
                "feedback": feedback  # 返回 GPT 反馈
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def autosave_code(request):
    """自动保存代码"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id_from_request = data.get('user_id')
            problem_id_from_request = data.get('problem_id')
            autosave_code = data.get('autosave_code')

            if not user_id_from_request or not problem_id_from_request or not autosave_code:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            try:
                user = User.objects.get(id=user_id_from_request)
                problem = Problem.objects.get(id=problem_id_from_request)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 覆盖 autosave_codes 表中的记录
            AutosaveCode.objects.update_or_create(
                user_id=user,
                problem_id=problem,
                defaults={"autosave_code": autosave_code}
            )
            return JsonResponse({"message": "Code autosaved successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# 用户进度管理系统

@csrf_exempt
def get_progress_and_code(request):
    """获取用户当前进度和代码"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        try:
            # 优先从 AutosaveCode 中获取用户的当前进度
            progress = AutosaveCode.objects.filter(user_id=user_id).order_by('-timestamp').first()
            if progress:
                current_problem_id = progress.problem_id
                autosave_code = progress.autosave_code

                # 检查是否有手动提交的代码
                submitted_code = None
                latest_submission = UserHistory.objects.filter(user_id=user_id, problem_id=current_problem_id).order_by('-version').first()
                if latest_submission:
                    submitted_code = latest_submission.solution_code

                return JsonResponse({
                    "current_problem_id": current_problem_id.id,  # 获取 Problem 实例的 ID
                    "autosave_code": autosave_code,
                    "submitted_code": submitted_code
                }, status=200)

            # 如果 AutosaveCode 中没有记录，返回 UserHistory 中的最新记录
            latest_submission = UserHistory.objects.filter(user_id=user_id).order_by('-timestamp').first()
            if latest_submission:
                return JsonResponse({
                    "current_problem_id": latest_submission.problem_id.id,  # 获取 Problem 实例的 ID
                    "autosave_code": None,
                    "submitted_code": latest_submission.solution_code
                }, status=200)

            return JsonResponse({"error": "No progress found for the user"}, status=404)

        except Problem.DoesNotExist:
            return JsonResponse({"error": "Problem not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)


@csrf_exempt
def reset_problem(request):
    """重做题目"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            problem_id = data.get('problem_id')

            if not user_id or not problem_id:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 检查用户和题目是否存在
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            try:
                problem = Problem.objects.get(id=problem_id)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 删除 autosave_codes 表中的记录
            AutosaveCode.objects.filter(user_id=user_id, problem_id=problem).delete()

            # GPT 对话记录保留，不删除

            return JsonResponse({"message": "Problem reset successfully, GPT conversations retained"}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# 推荐系统的信息源

@csrf_exempt
def get_current_problem_api(request):
    """获取当前题号"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        # 检查用户是否存在
        if not User.objects.filter(id=user_id).exists():
            return JsonResponse({"error": "Invalid user_id"}, status=400)

        # 查询当前题目
        progress = AutosaveCode.objects.filter(user_id=user_id).first()
        if not progress:
            return JsonResponse({"error": "No current problem found for the user"}, status=404)

        # 访问关联的 Problem 对象的 id 字段
        return JsonResponse({"current_problem_id": progress.problem_id.id}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_user_history(request):
    """获取用户历史记录"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        page = int(request.GET.get('page', 1))  # 默认第一页
        page_size = int(request.GET.get('page_size', 10))  # 默认每页10条

        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        # 检查用户是否存在
        if not User.objects.filter(id=user_id).exists():
            return JsonResponse({"error": "Invalid user_id"}, status=400)

        # 查询用户的历史记录
        history = UserHistory.objects.filter(user_id=user_id).select_related('problem').values(
            "problem_id", "problem_id__title", "version", "is_passed", "submission_status", "timestamp"
        )

        # 使用 Paginator 进行分页
        paginator = Paginator(history, page_size)
        try:
            page_data = paginator.page(page)
        except EmptyPage:
            return JsonResponse({"error": "Page out of range"}, status=404)

        return JsonResponse({
            "history": list(page_data),
            "total_pages": paginator.num_pages,
            "current_page": page,
            "total_records": paginator.count
        }, safe=False, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def get_related_topics_api(request):
    """获取当前题目的所有 related topics"""
    if request.method == 'GET':
        problem_id = request.GET.get('problem_id')
        if not problem_id:
            return JsonResponse({"error": "Missing problem_id"}, status=400)

        # 检查题目是否存在
        problem = Problem.objects.filter(id=problem_id).first()
        if not problem:
            return JsonResponse({"error": "Problem not found"}, status=404)

        # 获取 related topics
        related_topics = [topic.name for topic in problem.related_topics.all()]

        return JsonResponse({"related_topics": related_topics}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_related_topics_mastery_api(request):
    """获取当前题目相关的所有 Topic 的掌握度"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        problem_id = request.GET.get('problem_id')

        if not user_id or not problem_id:
            return JsonResponse({"error": "Missing user_id or problem_id"}, status=400)

        try:
            # 检查用户是否存在并获取 User 实例
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid user_id"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Error retrieving user: {e}"}, status=500)

        # 检查题目是否存在
        try:
            problem = Problem.objects.get(id=problem_id)
        except Problem.DoesNotExist:
            return JsonResponse({"error": "Problem not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Error retrieving problem: {e}"}, status=500)

        # 获取相关主题和掌握度
        related_topics = [topic.name for topic in problem.related_topics.all()]
        mastery = UserTopicMastery.objects.filter(user_id=user, topic_name__in=related_topics)
        mastery_dict = {topic: 0 for topic in related_topics}  # 默认掌握度为 0
        for m in mastery:
            mastery_dict[m.topic_name] = m.mastery_level

        return JsonResponse({"related_topics_mastery": mastery_dict}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


def get_all_topics_mastery_api(request):
    """获取所有 Topic 的掌握度，缺省为 -1"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid user_id"}, status=400)

        # 获取用户已有的掌握度记录
        existing_mastery = UserTopicMastery.objects.filter(user_id=user)
        mastery_dict = {m.topic_name: m.mastery_level for m in existing_mastery}

        # 创建包含所有 Topic 的结果字典，初始值为 -1
        all_topics_mastery = {topic: -1 for topic in ALL_TOPICS}

        # 用已有的掌握度更新结果字典
        for topic, mastery in mastery_dict.items():
            if topic in all_topics_mastery:
                all_topics_mastery[topic] = mastery

        return JsonResponse({"all_topics_mastery": all_topics_mastery}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_similar_questions_api(request):
    """获取当前题目的所有相似题目"""
    if request.method == 'GET':
        problem_id = request.GET.get('problem_id')
        if not problem_id:
            return JsonResponse({"error": "Missing problem_id"}, status=400)

        # 检查题目是否存在
        problem = Problem.objects.filter(id=problem_id).first()
        if not problem:
            return JsonResponse({"error": "Problem not found"}, status=404)

        # 解析相似题目
        if not problem.similar_questions or problem.similar_questions.strip() == "0":
            return JsonResponse({"similar_questions": []}, status=200)

        try:
            similar_questions = [int(q) for q in problem.similar_questions.split(", ") if q.strip().isdigit()]
        except ValueError:
            return JsonResponse({"error": "Invalid format in similar_questions field"}, status=500)

        return JsonResponse({"similar_questions": similar_questions}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_topic_difficulty_bucket(request):
    """获取某个知识点对应的不同难度的题目ID"""
    if request.method == 'GET':
        topic_name = request.GET.get('topic')
        if not topic_name:
            return JsonResponse({"error": "Missing topic"}, status=400)

        try:
            topic = Topic.objects.get(name=topic_name)
            topic_problems = TopicProblem.objects.filter(topic=topic).select_related('problem')
            difficulty_bucket = {
                'Easy': [],
                'Medium': [],
                'Hard': []
            }
            for tp in topic_problems:
                difficulty_bucket[tp.difficulty].append(tp.problem.id)

            # 将难度级别映射为数字 (如果前端需要)
            numeric_difficulty_bucket = {}
            difficulty_mapping = {'Easy': 1, 'Medium': 2, 'Hard': 3}
            for difficulty, problem_ids in difficulty_bucket.items():
                if problem_ids:
                    numeric_difficulty_bucket[difficulty_mapping[difficulty]] = problem_ids

            if not numeric_difficulty_bucket:
                return JsonResponse({"error": "Can't find this topic's difficulty bucket"}, status=404)

            return JsonResponse({"difficulty bucket": numeric_difficulty_bucket}, status=200)

        except Topic.DoesNotExist:
            return JsonResponse({"error": "Can't find this topic's difficulty bucket"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_topic_index(request):
    """获取某个知识点的排序号（从 1 开始）"""
    if request.method == 'GET':
        topic_name = request.GET.get('topic')
        if not topic_name:
            return JsonResponse({"error": "Missing topic"}, status=400)

        if topic_name not in ALL_TOPICS:
            return JsonResponse({"error": "Can't find this topic's index"}, status=404)

        index = ALL_TOPICS.index(topic_name)
        topic_index = index + 1  # 返回从 1 开始的索引
        previous_topic = ALL_TOPICS[index - 1] if index > 0 else None
        next_topic = ALL_TOPICS[index + 1] if index < len(ALL_TOPICS) - 1 else None

        return JsonResponse({
            "topic index": topic_index,
            "previous topic": previous_topic,
            "next topic": next_topic
        }, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)

# 设置推荐权重

@csrf_exempt
def set_recommendation_weights_api(request):
    """允许用户设置推荐算法的权重"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            similarity_weight = data.get('similarity_weight')
            common_topics_weight = data.get('common_topics_weight')
            difficulty_weight = data.get('difficulty_weight')

            if not user_id or similarity_weight is None or common_topics_weight is None or difficulty_weight is None:
                return JsonResponse({"error": "Missing required fields (user_id, similarity_weight, common_topics_weight, difficulty_weight)"}, status=400)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)

            # 尝试获取已存在的权重设置，如果不存在则创建
            weights, created = UserRecommendationWeight.objects.update_or_create(
                user=user,
                defaults={
                    'similarity_weight': similarity_weight,
                    'common_topics_weight': common_topics_weight,
                    'difficulty_weight': difficulty_weight,
                }
            )

            return JsonResponse({"message": "Recommendation weights updated successfully"}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# 推荐题号的写和读

@csrf_exempt
def set_recommendations(request):
    """写入推荐题目"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            recommended_problems = data.get('recommended_problems')  # 推荐题目列表

            if not user_id or not recommended_problems:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 检查用户是否存在
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({"error": "Invalid user_id"}, status=400)

            # 将推荐题目列表转换为字符串存储
            recommended_problems_str = ",".join(map(str, recommended_problems))

            # 更新或创建推荐记录
            Recommendation.objects.update_or_create(
                user_id=user_id,
                defaults={"recommended_problems": recommended_problems_str}
            )

            return JsonResponse({"message": "Recommendations saved successfully"}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_recommendations(request):
    """读取推荐题目"""
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        # 查询推荐记录
        recommendation = Recommendation.objects.filter(user_id=user_id).first()
        if not recommendation:
            return JsonResponse({"error": "No recommendations found"}, status=404)

        # 将逗号分隔的字符串转换为列表
        recommended_problems = list(map(int, recommendation.recommended_problems.split(",")))

        return JsonResponse({"recommended_problems": recommended_problems}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)

# GPT 相关 API

@csrf_exempt
def create_conversation_session(request):
    """为用户和题目创建 GPT 对话会话"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id_from_request = data.get('user_id')
            problem_id_from_request = data.get('problem_id')

            if not user_id_from_request or not problem_id_from_request:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            user = None
            problem = None

            try:
                user = User.objects.get(id=user_id_from_request)
                problem = Problem.objects.get(id=problem_id_from_request)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 获取或创建会话（如果已存在，则不重复创建）
            session, created = ConversationSession.objects.get_or_create(
                user_id=user,
                problem_id=problem,
                defaults={'is_resolved': False}
            )

            if created:
                return JsonResponse({"message": "Conversation session created successfully", "session_id": session.id}, status=201)
            else:
                return JsonResponse({"message": "Conversation session already exists", "session_id": session.id}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def gpt_interaction_api(request):
    """处理用户与 GPT 的交互，包括存储对话记录、读取记忆和调用 GPT API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            problem_id = data.get('problem_id')
            user_message = data.get('message')
            conversation_type = "user"

            if not user_id or not problem_id or not user_message:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 检查用户和题目是否存在
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            try:
                problem = Problem.objects.get(id=problem_id)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 获取或创建会话
            session, created = ConversationSession.objects.get_or_create(
                user_id=user,
                problem_id=problem,
                is_resolved=False
            )

            # 保存用户的对话记录
            GptConversation.objects.create(
                session=session,
                message=user_message,
                conversation_type=conversation_type
            )

            # 读取当前会话的记忆 (之前的对话记录)
            previous_conversations = GptConversation.objects.filter(session=session).order_by('timestamp')
            messages = []
            for conv in previous_conversations:
                role = "user" if conv.conversation_type == "user" else "assistant"
                messages.append({"role": role, "content": conv.message})

            # 将最新的用户消息添加到对话历史中
            messages.append({"role": "user", "content": user_message})

            # 调用 GPT API 获取回复
            gpt_api_url = "https://api.openai.com/v1/chat/completions"
            gpt_payload = {
                "model": settings.GPT_MODEL,
                "messages": messages
            }
            gpt_headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }

            try:
                gpt_response = requests.post(gpt_api_url, json=gpt_payload, headers=gpt_headers)
                gpt_response.raise_for_status()
                gpt_reply = gpt_response.json()["choices"][0]["message"]["content"]

                # 保存 GPT 的对话记录
                GptConversation.objects.create(
                    session=session,
                    message=gpt_reply,
                    conversation_type="gpt"
                )

                return JsonResponse({
                    "message": "Interaction processed successfully",
                    "gpt_reply": gpt_reply
                }, status=201)

            except requests.RequestException as e:
                return JsonResponse({"error": f"Error calling GPT API: {str(e)}"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def get_gpt_conversations(request):
    """获取用户与 GPT 的对话记录"""
    if request.method == 'GET':
        session_id = request.GET.get('session_id')

        if not session_id:
            return JsonResponse({"error": "Missing session_id"}, status=400)

        # 查询会话
        session = ConversationSession.objects.filter(id=session_id).first()
        if not session:
            return JsonResponse({"error": "Session not found"}, status=404)

        # 查询对话记录
        conversations = session.conversations.all()
        conversation_list = [
            {
                "message": c.message,
                "conversation_type": c.conversation_type,
                "timestamp": c.timestamp
            }
            for c in conversations
        ]

        return JsonResponse({"conversations": conversation_list}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def clear_gpt_conversations(request):
    """清空用户与 GPT 的对话记录"""
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        problem_id = data.get('problem_id')

        if not user_id or not problem_id:
            return JsonResponse({"error": "Missing user_id or problem_id"}, status=400)

        # 删除对话记录
        GptConversation.objects.filter(user_id=user_id, problem_id=problem_id).delete()

        return JsonResponse({"message": "Conversations cleared successfully"}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)