# API for Yuanshen

## 写在前面
- 文档涵盖了所有 API，包括用户管理、题目管理、代码管理、用户进度管理、推荐系统和 GPT 对话管理。
- 每个 API 包括请求方法、URL、请求参数、请求体、响应示例和错误处理。
---

## 用户管理系统

### 1. 用户注册
- **URL**: `/api/register/`
- **方法**: `POST`
- **描述**: 注册一个新用户。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "username": "newuser",
        "password": "newpassword"
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "User registered successfully"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```
        或
        ```json
        {
            "error": "Username already exists"
        }
        ```

---

### 2. 用户登录
- **URL**: `/api/login/`
- **方法**: `POST`
- **描述**: 登录用户。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "username": "newuser",
        "password": "newpassword"
    }
    ```

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Login successful",
            "userid": 1
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```
        或
        ```json
        {
            "error": "Invalid credentials"
        }
        ```

---

### 3. 用户注销
- **URL**: `/api/logout/`
- **方法**: `POST`
- **描述**: 注销用户。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**: 无

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Logout successful"
        }
        ```
- **失败**:
    - 状态码: `405 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "Invalid request method"
        }
        ```

---

## 题目管理系统

### 1. 获取题目数据
- **URL**: `/api/problems/`
- **方法**: [GET](http://_vscodecontentref_/0)
- **描述**: 获取题库中的所有题目数据，或根据 [id](http://_vscodecontentref_/1) 查询对应的题目。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [id](http://_vscodecontentref_/2)（可选）：题目的 ID。

#### 响应
- **成功（单个题目）**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "id": 1,
            "title": "Two Sum",
            "description": "Given an array of integers...",
            "difficulty": "Easy",
            "is_premium": false,
            "acceptance_rate": 45.5,
            "frequency": 0.1,
            "url": "[https://example.com/problems/two-sum](https://example.com/problems/two-sum)",
            "discuss_count": 123,
            "accepted": 456789,
            "submissions": 987654,
            "related_topics": ["Array", "Hash Table"],
            "likes": 12345,
            "dislikes": 678,
            "rating": 4.5,
            "similar_questions": "Three Sum, Four Sum"
        }
        ```
- **成功（所有题目）**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        [
            {
                "id": 1,
                "title": "Two Sum",
                "description": "Given an array of integers...",
                "difficulty": "Easy",
                "is_premium": false,
                "acceptance_rate": 45.5,
                "frequency": 0.1,
                "url": "[https://example.com/problems/two-sum](https://example.com/problems/two-sum)",
                "discuss_count": 123,
                "accepted": 456789,
                "submissions": 987654,
                "related_topics": ["Array", "Hash Table"],
                "likes": 12345,
                "dislikes": 678,
                "rating": 4.5,
                "similar_questions": "Three Sum, Four Sum"
            },
            {
                "id": 2,
                "title": "Three Sum",
                "description": "Given an array of integers...",
                "difficulty": "Medium",
                "is_premium": true,
                "acceptance_rate": 30.2,
                "frequency": 0.2,
                "url": "[https://example.com/problems/three-sum](https://www.google.com/search?q=https://example.com/problems/three-sum)",
                "discuss_count": 456,
                "accepted": 123456,
                "submissions": 789012,
                "related_topics": ["Array", "Two Pointers"],
                "likes": 6789,
                "dislikes": 321,
                "rating": 4.2,
                "similar_questions": "Two Sum, Four Sum"
            }
        ]
        ```
- **失败**:
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Problem not found"
        }
        ```
    - 状态码: `405 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "Invalid request method"
        }
        ```

---

## 代码管理系统

### 1. 提交代码
- **URL**: `/api/submit_code/`
- **方法**: `POST`
- **描述**: 提交用户的解题代码。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 1,
        "solution_code": "def two_sum(nums, target): ...",
        "is_passed": true,
        "submission_status": "Accepted"
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Code submitted and scored successfully",
            "version": 2
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No conversation session found"
        }
        ```

---

### 2. 自动保存代码
- **URL**: `/api/autosave_code/`
- **方法**: `POST`
- **描述**: 自动保存用户的解题代码。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 1,
        "autosave_code": "def two_sum(nums, target): ..."
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Code autosaved successfully"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```

---

## 用户进度管理系统

### 1. 获取用户当前进度和代码
- **URL**: `/api/get_progress_and_code/`
- **方法**: [GET](http://_vscodecontentref_/3)
- **描述**: 获取用户上次做到的题号，以及自动保存的代码和手动提交的代码。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [user_id](http://_vscodecontentref_/4)（必填）：用户 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "current_problem_id": 42,
            "autosave_code": "def two_sum(nums, target): ...",
            "submitted_code": "def two_sum(nums, target): ..."
        }
        ```
- **失败**:
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No progress found for the user"
        }
        ```

---

### 2. 重做题目
- **URL**: `/api/reset_problem/`
- **方法**: `POST`
- **描述**: 清除用户手动提交的代码记录，恢复到自动保存的状态。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 42
    }
    ```

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Problem reset successfully, GPT conversations retained"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```

---

## 推荐系统的信息源

## 推荐系统 API

### 1. 获取当前题号
- **URL**: `/api/current_problem/`
- **方法**: `GET`
- **描述**: 获取用户当前正在做的题号。

#### 请求
- **请求头**: 无
- **请求参数**:
    - `user_id`（必填）：用户 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "current_problem_id": 42
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No current problem found for the user"
        }
        ```

---

### 2. 获取用户历史记录
- **URL**: `/api/get_user_history/`
- **方法**: [GET](http://_vscodecontentref_/0)
- **描述**: 获取用户的历史提交记录。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [user_id](http://_vscodecontentref_/1)（必填）：用户 ID。
    - [page](http://_vscodecontentref_/2)（可选）：页码，默认为 `1`。
    - [page_size](http://_vscodecontentref_/3)（可选）：每页记录数，默认为 `10`。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "history": [
                {
                    "problem_id": 1,
                    "problem__title": "Two Sum",
                    "version": 1,
                    "is_passed": true,
                    "submission_status": "Accepted",
                    "timestamp": "2025-03-29T12:34:56Z"
                }
            ],
            "total_pages": 5,
            "current_page": 1,
            "total_records": 50
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Page out of range"
        }
        ```

---

### 3. 获取当前题目的所有 related topics
- **URL**: `/api/related_topics/`
- **方法**: [GET](http://_vscodecontentref_/4)
- **描述**: 获取指定题目（[problem_id](http://_vscodecontentref_/5)）的所有相关主题（[related_topics](http://_vscodecontentref_/6)）。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [problem_id](http://_vscodecontentref_/7)（必填）：题目的唯一 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "related_topics": ["Array", "Hash Table", "Two Pointers"]
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing problem_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Problem not found"
        }
        ```

---

### 4. 获取当前题目相关的所有主题掌握度
- **URL**: `/api/related_topics_mastery/`
- **方法**: [GET](http://_vscodecontentref_/8)
- **描述**: 获取当前题目相关的所有主题的掌握度。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [user_id](http://_vscodecontentref_/9)（必填）：用户 ID。
    - [problem_id](http://_vscodecontentref_/10)（必填）：题目的唯一 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "related_topics_mastery": {
                "Array": 0.8,
                "Hash Table": 0.6,
                "Two Pointers": 0.4
            }
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id or problem_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Problem not found"
        }
        ```

---

### 5. 获取所有主题的掌握度
- **URL**: `/api/all_topics_mastery/`
- **方法**: `GET`
- **描述**: 获取用户对所有主题的掌握度。

#### 请求
- **请求头**: 无
- **请求参数**:
    - `user_id`（必填）：用户 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "all_topics_mastery": {
                "Array": 0.8,
                "Hash Table": 0.6,
                "Two Pointers": 0.4
            }
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No mastery records found for the user"
        }
        ```

---

### 6. 获取当前题目的所有相似题目
- **URL**: `/api/similar_questions/`
- **方法**: [GET](http://_vscodecontentref_/2)
- **描述**: 获取当前题目的所有相似题目。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [problem_id](http://_vscodecontentref_/3)（必填）：题目的唯一 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "similar_questions": [295, 703, 1024]
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing problem_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Problem not found"
        }
        ```
    - 状态码: `500 Internal Server Error`
    - 响应体:
        ```json
        {
            "error": "Invalid format in similar_questions field"
        }
        ```

---

## 推荐题号的写和读

### 1. 存储推荐题目
- **URL**: `/api/set_recommendations/`
- **方法**: `POST`
- **描述**: 存储推荐的题目列表（覆盖原有列表）。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "recommended_problems": [101, 102, 103]
    }
    ```

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Recommendations saved successfully"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```

---

### 2. 获取推荐题目
- **URL**: `/api/get_recommendations/`
- **方法**: [GET](http://_vscodecontentref_/11)
- **描述**: 获取推荐的题目列表。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [user_id](http://_vscodecontentref_/12)（必填）：用户 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "recommended_problems": [101, 102, 103]
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No recommendations found"
        }
        ```

---

## GPT 相关 API

### 1. 创建 GPT 对话会话
- **URL**: `/api/create_conversation_session/`
- **方法**: `POST`
- **描述**: 为指定用户和题目创建一个 GPT 对话会话。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 42
    }
    ```

#### 响应
- **成功 (首次创建会话)**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Conversation session created successfully",
            "session_id": "会话的唯一ID"
        }
        ```
- **成功 (会话已存在)**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Conversation session already exists",
            "session_id": "已存在会话的唯一ID"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Invalid user_id or problem_id"
        }
        ```

---

### 2. 存储用户与 GPT 的对话记录
- **URL**: `/api/save_gpt_conversation/`
- **方法**: `POST`
- **描述**: 存储用户与 GPT 的对话记录。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 42,
        "message": "How do I solve this problem?",
        "conversation_type": "user"
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Conversation saved successfully"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing required fields"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Invalid user_id or problem_id"
        }
        ```

---

### 3. 获取用户与 GPT 的对话记录
- **URL**: `/api/get_gpt_conversations/`
- **方法**: `GET`
- **描述**: 获取指定 GPT 对话会话的所有对话记录。

#### 请求
- **请求头**: 无
- **请求参数**:
    - `session_id`（必填）：会话 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "conversations": [
                {
                    "message": "How do I solve this problem?",
                    "conversation_type": "user",
                    "timestamp": "2025-04-05T12:00:00Z"
                },
                {
                    "message": "You can try using a two-pointer approach.",
                    "conversation_type": "gpt",
                    "timestamp": "2025-04-05T12:01:00Z"
                }
            ]
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing session_id"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Session not found"
        }
        ```

---

### 4. 清空用户与 GPT 的对话记录
- **URL**: `/api/clear_gpt_conversations/`
- **方法**: `POST`
- **描述**: 清空指定用户和题目的所有 GPT 对话记录。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 42
    }
    ```

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "message": "Conversations cleared successfully"
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing user_id or problem_id"
        }
        ```

---

## 后记
- 啦啦啦