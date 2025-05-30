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
            "message": "Login successful"
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
            },
            // ... 更多题目
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

### 2. 获取题目的难度
- **URL**: `/api/problem_difficulty/`
- **方法**: `GET`
- **描述**: 获取题目的难度。

#### 请求
- **请求头**: 无
- **请求参数**:
    - [id](http://_vscodecontentref_/2)：题目的 ID。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "problem_difficulty": string
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

## 代码管理系统

### 1. 提交代码并打分
- **URL**: `/api/submit_code/`
- **方法**: `POST`
- **描述**: 提交用户编写的解题代码，并使用 GPT 模型进行评估和打分。同时更新用户提交历史、掌握程度。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": integer,  // 用户的唯一标识符
        "problem_id": integer,  // 题目的唯一标识符
        "solution_code": string,  // 用户提交的解答代码
        "is_passed": boolean,  // (可选，默认为 False) 指示代码是否通过了所有测试用例。
                               // 这个字段的值可能会被 GPT 的评估结果覆盖或作为初始参考。
        "submission_status": string  // (可选) 用户提交的状态，例如 "Accepted", "Failed", "Error" 等。
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Code submitted and scored successfully",
            "version": integer,  // 本次提交的代码版本号
            "score": float or null,  // GPT 模型给出的代码评分 (0-1 之间)，可能为 null
            "feedback": string  // GPT 模型对代码的反馈
        }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "..."  // 包含具体的错误信息
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No conversation session found"
        }
        ```
    - 状态码: `500 Internal Server Error`
    - 响应体:
        ```json
        {
            "error": "..."  // 包含具体的错误信息
        }
        ```
- **方法不允许**:
    - 状态码: `405 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "Invalid request method"
        }
        ```

---

### 2. 调用推荐系统API
- **URL**: `/api/call_recommender/`
- **方法**: `POST`
- **描述**: 用户确认完成当前题目后调用推荐系统，生成下一题的推荐结果。

#### 请求
- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": integer,
        "problem_id": integer,
    }
    ```

#### 响应
- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
    {
    "message": "Recommendations generated successfully",
    "recommendations": [102, 103]
    }
        ```
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "..."  // 包含具体的错误信息
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "No conversation session found"
        }
        ```
    - 状态码: `500 Internal Server Error`
    - 响应体:
        ```json
        {
            "error": "..."  // 包含具体的错误信息
        }
        ```
- **方法不允许**:
    - 状态码: `405 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "Invalid request method"
        }
        ```

---

### 4. 自动保存代码
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
        **注意**如果从未做过这类题，掌握度缺省为-1.0。
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
- **方法**: `GET`
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
        **注意**若无相似题目，返回空列表。
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

### 7. 获取某个知识点对应的不同难度的题目ID
- **URL**: `/api/topics_difficulty_bucket/`
- **方法**: `GET`
- **描述**: 获取指定知识点对应的不同难度的题目ID列表。

#### 请求
- **请求头**: 无
- **请求参数**:
    - `topic`（必填）：知识点名称。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "difficulty bucket": {
                "1": [100, 101, 102],
                "2": [103, 104, 105],
                "3": [201, 203, 204]
            }
        }
        ```
        **注意:** 难度级别映射：1 - Easy, 2 - Medium, 3 - Hard。
        **注意:** 0表示对应为空。
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing topic"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Can't find this topic's difficulty bucket"
        }
        ```

---

### 8. 获取某个知识点的排序号
- **URL**: `/api/topics_index/`
- **方法**: `GET`
- **描述**: 获取指定知识点在预定义列表中的排序号，以及其前一个和后一个知识点（如果存在）。

#### 请求
- **请求头**: 无
- **请求参数**:
    - `topic`（必填）：知识点名称。

#### 响应
- **成功**:
    - 状态码: `200 OK`
    - 响应体:
        ```json
        {
            "topic index": 34,
            "previous topic": "array",
            "next topic": "linked list"
        }
        ```
        **注意:** `topic index` 是从 1 开始的排序号。`previous topic` 和 `next topic` 可能为 `null`。
- **失败**:
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Missing topic"
        }
        ```
    - 状态码: `404 Not Found`
    - 响应体:
        ```json
        {
            "error": "Can't find this topic's index"
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
- **方法**: `GET`
- **描述**: 获取推荐的题目列表。

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

### 2. 用户与 GPT 交互 API

- **URL**: `/api/gpt_interaction/` (假设你的 URL 配置将 `gpt_interaction_api` 映射到此路径)
- **方法**: `POST`
- **描述**: 处理用户与 GPT 的交互，包括接收用户消息、存储对话记录、读取记忆、调用 GPT API 获取回复，并存储 GPT 的回复。

#### 请求

- **请求头**: `Content-Type: application/json`
- **请求体**:
    ```json
    {
        "user_id": 1,
        "problem_id": 42,
        "message": "Explain the time complexity of this algorithm."
    }
    ```
    - `user_id` (integer, required): 发送消息的用户的 ID。
    - `problem_id` (integer, required): 当前正在讨论的问题的 ID。
    - `message` (string, required): 用户发送给 GPT 的消息内容。

#### 响应

- **成功**:
    - 状态码: `201 Created`
    - 响应体:
        ```json
        {
            "message": "Interaction processed successfully",
            "gpt_reply": "The time complexity of this algorithm is O(n log n) because..."
        }
        ```
        - `message`: 操作成功的消息。
        - `gpt_reply`: GPT 模型返回的回复内容。

- **失败**:
    - **状态码**: `400 Bad Request`
        - **响应体**:
            ```json
            {
                "error": "Missing required fields"
            }
            ```
            - 说明: 请求体中缺少 `user_id`, `problem_id`, 或 `message` 字段。
        - **响应体**:
            ```json
            {
                "error": "Invalid JSON format"
            }
            ```
            - 说明: 请求体不是有效的 JSON 格式。
        - **响应体**:
            ```json
            {
                "error": "Invalid user_id"
            }
            ```
            - 说明: 提供的 `user_id` 在数据库中不存在。
        - **响应体**:
            ```json
            {
                "error": "Invalid problem_id"
            }
            ```
            - 说明: 提供的 `problem_id` 在数据库中不存在。
    - **状态码**: `405 Method Not Allowed`
        - **响应体**:
            ```json
            {
                "error": "Invalid request method"
            }
            ```
            - 说明: 请求方法不是 `POST`。
    - **状态码**: `500 Internal Server Error`
        - **响应体**:
            ```json
            {
                "error": "Error calling GPT API: ..."
            }
            ```
            - 说明: 调用 OpenAI GPT API 时发生错误，错误信息会包含在 `error` 字段中。

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

## 用户成长系统API
### 1. 获取用户成长路径建议
- **URL**: `/api/get_growth_path_advice/`
- **方法**: `GET`
- **描述**: 获取用户成长路径建议。

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
            "suggestions": [
                "建议一：关注基础知识的巩固。",
                "建议二：尝试参与更复杂的项目。",
                "建议三：积极与其他开发者交流学习。",
                // ... 更多建议
            ]
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
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Invalid user_id"
        }
        ```
    - 状态码: `405 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "Invalid request method"
        }
        ```
    - 状态码: `500 Method Not Allowed`
    - 响应体:
        ```json
        {
            "error": "调用 GPT 服务失败，请稍后重试。"
        }
        ```

---

### 2. 获取用户最后一次得分

- **URL**: `/api/get_user_last_scores/`
- **方法**: `GET`
- **描述**: 获取用户所有题最近提交的分数。

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
            "last_scores": [
                {
                    "problem_id": 101,
                    "score": 85
                },
                {
                    "problem_id": 105,
                    "score": 92
                },
                // ... 更多题目和最后得分
            ]
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
    - 状态码: `400 Bad Request`
    - 响应体:
        ```json
        {
            "error": "Invalid user_id"
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

## 后记
- 啦啦啦