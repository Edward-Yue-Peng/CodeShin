from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.paginator import Paginator, EmptyPage
from .models import (
    Problem, UserHistory, AutosaveCode, UserTopicMastery, Recommendation,
    GptConversation, ConversationSession, Topic
)
from .utils import initialize_user_topics, gpt_score
import json
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

            user = None
            problem = None

            try:
                user = User.objects.get(id=user_id_from_request)
                problem = Problem.objects.get(id=problem_id_from_request)
                user_id = user.id
                problem_id = problem.id
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            except Problem.DoesNotExist:
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 获取当前题目的最新版本号
            latest_submission = UserHistory.objects.filter(user_id=user, problem_id=problem).order_by('-version').first()
            new_version = (latest_submission.version + 1) if latest_submission else 1

            # 保存用户提交记录
            UserHistory.objects.create(
                user_id=user,  # 使用 user 模型实例
                problem_id=problem,  # 使用 problem 模型实例
                solution_code=solution_code,
                version=new_version,
                is_passed=is_passed,
                submission_status=submission_status
            )

            # 清除 autosave_codes 表中的记录
            AutosaveCode.objects.filter(user_id=user, problem_id=problem).delete()

            # 获取 GPT 对话记录
            session = ConversationSession.objects.filter(user_id=user, problem_id=problem).first()
            if not session:
                return JsonResponse({"error": "No conversation session found"}, status=404)

            conversations = session.conversations.all()
            conversation_text = "\n".join([c.message for c in conversations])

            # 获取题目的 related_topics
            related_topics = [topic.name for topic in problem.related_topics.all()] if problem else []

            # 调用 GPT API 进行打分（假设有一个函数 gpt_score）
            topic_scores = gpt_score(solution_code, conversation_text, related_topics)

            # 更新用户的掌握程度
            for topic, score in topic_scores.items():
                UserTopicMastery.objects.update_or_create(
                    user_id=user.id,
                    topic_name=topic,
                    defaults={"mastery_level": score}
                )

            return JsonResponse({"message": "Code submitted and scored successfully", "version": new_version}, status=201)
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
            # 获取 autosave_codes 中的记录
            progress = AutosaveCode.objects.get(user_id=user_id)
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
        except AutosaveCode.DoesNotExist:
            # 如果没有 autosave_codes，返回 user_history 中的最新记录
            latest_submission = UserHistory.objects.filter(user_id=user_id).order_by('-timestamp').first()
            if latest_submission:
                return JsonResponse({
                    "current_problem_id": latest_submission.problem_id.id,  # 获取 Problem 实例的 ID
                    "autosave_code": None,
                    "submitted_code": latest_submission.solution_code
                }, status=200)
            return JsonResponse({"error": "No progress found for the user"}, status=404)
        except Problem.DoesNotExist:  # 建议添加对 Problem 不存在的处理
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

# 推荐题号的写和读

@csrf_exempt
def set_recommendations(request):
    """存储推荐题目（覆盖原有列表）"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            recommended_problems = data.get('recommended_problems')

            if not user_id or not recommended_problems:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": f"User with ID {user_id} does not exist"}, status=400)
            except Exception as e:
                return JsonResponse({"error": f"Error retrieving user: {e}"}, status=500)

            # 删除原有的推荐记录
            Recommendation.objects.filter(user_id=user).delete()  # 使用用户的 ID 进行过滤

            # 将推荐题目ID列表存储为逗号分隔的字符串
            recommended_problems_str = ",".join(map(str, recommended_problems))

            # 创建新的推荐记录
            Recommendation.objects.create(
                user_id=user,
                recommended_problems=recommended_problems_str
            )

            return JsonResponse({"message": "Recommendations saved successfully"}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
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
def save_gpt_conversation(request):
    """存储用户与 GPT 的对话记录"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            problem_id = data.get('problem_id')
            message = data.get('message')
            conversation_type = data.get('conversation_type')  # user 或 gpt

            if not user_id or not problem_id or not message or not conversation_type:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 检查用户和题目是否存在
            if not User.objects.filter(id=user_id).exists():
                return JsonResponse({"error": "Invalid user_id"}, status=400)
            if not Problem.objects.filter(id=problem_id).exists():
                return JsonResponse({"error": "Invalid problem_id"}, status=400)

            # 验证 conversation_type 是否有效
            if conversation_type not in ['user', 'gpt']:
                return JsonResponse({"error": "Invalid conversation_type"}, status=400)

            # 获取或创建会话
            session, created = ConversationSession.objects.get_or_create(
                user_id=user_id,
                problem_id=problem_id,
                is_resolved=False  # 默认未解决
            )

            # 保存对话记录
            GptConversation.objects.create(
                session=session,
                message=message,
                conversation_type=conversation_type
            )

            return JsonResponse({"message": "Conversation saved successfully"}, status=201)
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