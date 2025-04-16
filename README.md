# CODESHIN 源神

CODESHIN is an AI-powered coding platform that provides an interactive environment for practicing coding problems, analyzing solutions, and engaging with an AI assistant for guidance. This project is built with React, Material-UI (MUI), and Monaco Editor to offer a modern, responsive, and dark-mode-supported UI.

# 源神，启动！
## 第一步：安装 MySQL 数据库
### Windows 
下载：https://dev.mysql.com/downloads/installer/

安装时勾选 MySQL Server 8.0.11以上的版本。

进入MySQL Installer，点击Reconfigure，设置 root 密码。

安装完成后，打开终端（cmd 或 PowerShell）验证：
```bash
mysql -V
```

### macOS
使用 Homebrew 安装并配置：

```bash
brew install mysql
brew services start mysql
mysql -u root
```


## 第二步：后端（Django）配置
### 创建虚拟环境并安装依赖
```bash
cd codeshin-backend
python -m venv .venv
source .venv/bin/activate  
# Windows 用 .venv\Scripts\activate
pip install -r requirements.txt
```
在IDE中切换到刚刚创建的venv
### 创建数据库用户
账号密码储存在`codeshin-backend/yuanshen/yuanshen/settings.py`。
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "yuan_database",
        "USER": "yuanshen", # 数据库账号
        "PASSWORD": "yuanshenqidong", # 数据库密码
        "HOST": "localhost",  # 或者数据库服务器的IP地址
        "PORT": "3306",  # MySQL默认端口
        "OPTIONS": {
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```
在CMD或Terminal中输入以下命令登录MySQL，紧接着输入你在安装MySQL时设置的密码
```bash
mysql -u root -p
```
登录后，继续输入以下命令创建数据库和用户：
```sql
CREATE DATABASE yuan_database DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yuanshen'@'localhost' IDENTIFIED BY 'yuanshenqidong';
GRANT ALL PRIVILEGES ON yuan_database.* TO 'yuanshen'@'localhost';
FLUSH PRIVILEGES;
```
### 导入密钥
将key.json文件存入`codeshin-backend/yuanshen/yuanshen/`目录下。

### 初始化数据库
```bash
python manage.py makemigrations
python manage.py migrate
```
### 导入问题
```bash
python import_questions.py
python import_by_topics.py
```
### 启动后端服务
```bash
python manage.py runserver
```


## 第三步：前端（React）配置
安装依赖
```bash
cd codeshin-frontend
npm install
```
启动前端服务
```bash
npm run dev
``` 

