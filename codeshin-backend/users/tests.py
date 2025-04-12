from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import Problem
from django.contrib.auth.models import User

class APITestCase(TestCase):
    def setUp(self):
        """初始化测试环境"""
        super().setUp()
        # 创建测试用户
        self.user = User.objects.create_user(username="testuser", password="testpassword")
        # 创建测试题目
        self.problem = Problem.objects.create(id=1, title="Test Problem", description="This is a test problem.", is_premium=False)
        self.client = APIClient()
        self.register_url = reverse('register')  # 假设注册接口的名称是 'register'
        self.login_url = reverse('login')        # 假设登录接口的名称是 'login'
        self.submit_code_url = reverse('submit_code')  # 假设提交代码接口的名称是 'submit_code'

    def test_user_registration(self):
        """测试用户注册"""
        response = self.client.post(self.register_url, {
            "username": "testuser",
            "password": "testpassword"
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn("message", response.json())  # 修复：使用 response.json()

    def test_user_login(self):
        """测试用户登录"""
        # 先注册用户
        self.client.post(self.register_url, {
            "username": "testuser",
            "password": "testpassword"
        }, format='json')
        # 测试登录
        response = self.client.post(self.login_url, {
            "username": "testuser",
            "password": "testpassword"
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())  # 修复：使用 response.json()

    def test_submit_code(self):
        """测试提交代码"""
        # 先注册用户
        self.client.post(self.register_url, {
            "username": "testuser",
            "password": "testpassword"
        }, format='json')
        # 模拟提交代码
        response = self.client.post(self.submit_code_url, {
            "user_id": 1,
            "problem_id": 1,
            "solution_code": "def two_sum(nums, target): ...",
            "is_passed": True,
            "submission_status": "Accepted"
        }, format='json')
        self.assertEqual(response.status_code, 201)  # 确保返回 201 Created
        self.assertIn("message", response.json())  # 修复：使用 response.json()