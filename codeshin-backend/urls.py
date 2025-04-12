from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # 管理后台
    path('api/', include('users.urls')),  # 将 /api/ 开头的请求转发到 users 应用的路由
]