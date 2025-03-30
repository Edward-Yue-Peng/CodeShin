# API 开发文档

## 1. 用户模块

### GET /api/user/:id

获取指定用户的基本信息，包括当前水平、练习题数量。

**参数**：
- `:id` 用户 ID

**响应**：
```json
{
  "userId": 1,
  "userlevel": 1,
  "totalPracticed": [201,202]
}
```
- `userlevel`：用户当前水平（1-3，分别为初级、中级、高级）
- `totalPracticed`：用户已练习的题目列表
### GET /api/user/:id/last-question

获取用户上次正在做的题目的信息

**参数**：
- `:id` 用户 ID

**响应**：
```json
{
  "questionId": 201,
  "title": "链表反转",
  "description": "给定一个链表，请反转它并返回头结点...",
  "relatedTopics": ["链表", "指针操作"]
}
```
- `questionId`：题目 ID
- `title`：题目标题
- `description`：题目描述
- `relatedTopics`：题目相关知识点

### GET /api/user/:id/last-code

获取用户上次运行的代码内容（当前题目）

**参数**：
- `:id` 用户 ID

**响应**：
```json
{
  "code": "def reverseList(head): ...",
  "lastUpdated": "2025-03-20T14:55:00Z"
}
```
- `code`：用户上次提交的代码
- `lastUpdated`：代码最后更新时间

### GET /api/user/:id/last-feedback

获取用户最近一次做完题目的知识点掌握评价

**参数**：
- `:id` 用户 ID

**响应**：
```json
{
  "questionId": 201,
  "feedback":"本题你对链表的掌握较好，但指针操作还需加强......",
  "evaluation": {
    "链表": 2,
    "指针操作": 0
  },
  "submittedAt": "2025-03-20T15:00:00Z"
}
```
- `feedback`：题目反馈
- `evaluation`：知识点掌握评分（0-2，分别为弱、中、强）
- `submittedAt`：提交时间
- `questionId`：题目 ID

### GET /api/user/:id/last-ai-reply

获取 AI 对用户最近一次提问的回复内容

**参数**：
- `:id` 用户 ID

**请求参数（Query）**：
- `prompt`: 当前聊天框内容

**示例请求**：
```
GET /api/user/1/last-ai-reply?prompt=为什么这里超出索引？
```

**响应**：
```json
{
  "answer": "你在访问 list[n] 时没有检查列表长度，建议先判断 n 是否小于列表长度。"
}
```
- `answer`：AI 回答，Markdown 格式

## 2. 题目模块

### GET /api/question/:id/types

获取题目所属的知识点或标签分类

**参数**：
- `:id` 题目 ID

**响应**：
```json
{
  "questionId": 201,
  "relatedTopics": ["链表", "指针操作"]
}
```

## 3. 提交与运行模块

### POST /api/submit/save

保存或运行用户当前的题目代码（支持中间保存或运行调试）

**请求体**：
```json
{
  "userId": 1,
  "questionId": 201,
  "code": "def reverseList(head): ...",
  "timestamp": "2025-03-20T15:10:00Z"
}
```
- `timestamp`：保存时间
- `code`：用户当前代码
**响应**：
```json
{
  "status": "saved",
  "timestamp": "2025-03-20T15:10:00Z"
}
```

### POST /api/submit/evaluate

提交并评估当前题目完成情况，返回反馈与知识点掌握评分

**请求体**：
```json
{
  "userId": 1,
  "questionId": 201,
  "code": "def reverseList(head): ..."
}
```

**响应**：
```json
{
  "passed": true,
  "feedback": "本题你对链表的掌握较好，但指针操作还需加强......",
  "evaluation": {
    "链表": 3,
    "指针操作": 2
  }
}
```
- `passed`：本题是否通过
- `feedback`：题目反馈
- `evaluation`：知识点掌握评分

### POST /api/submit/recommend

通过反馈，推荐下一步题目

**请求体**：
```json
{
  "userId": 1,
  "questionId": 201,
  "evaluation": {
    "链表": 3,
    "指针操作": 2
  }
}
```

**响应**：
```json
{
  "recommendations":[
{"id":201,"relatedTopic": "链表"},
{"id": 32,"relatedTopic": "字符串" }
]
}
```

- `recommendations`:推荐的题目列表
- id为题号 relatedTopic为针对提升的知识点
- 最值得推荐的题目将是questions列表的第一个，列表长度计划为1-3

## 4. AI 问答模块

### POST /api/ai/ask

向 AI 提出一个与当前代码相关的问题

**请求体**：
```json
{
  "userId": 1,
  "questionId": 201,
  "code": "def reverseList(head): ...",
  "ask": "为什么返回的是 None？",
  "lineNumber": 3
}
```
- `ask`：问题内容
- `lineNumber`：问题所在代码行号，如果是整体问题则为 0
- `code`：用户当前代码
- `questionId`：题目 ID
- `userId`：用户 ID

**响应**：
```json
{
  "answer": "你没有正确返回头节点，应该 return prev 而不是 head。"
}
```
- `answer`：AI 回答，Markdown 格式
