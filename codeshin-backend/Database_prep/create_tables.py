import mysql.connector

# 连接到MySQL数据库
conn = mysql.connector.connect(
    host='localhost',
    user='yuanshen',
    password='yuanshenqidong',
    database='yuan_database'
)
cursor = conn.cursor()

# 创建problems表
cursor.execute('''
CREATE TABLE problems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    is_premium BOOLEAN,
    difficulty VARCHAR(50) NOT NULL,
    solution_link TEXT,
    acceptance_rate FLOAT,
    frequency FLOAT,
    url VARCHAR(255),
    discuss_count INT,
    accepted BIGINT,
    submissions BIGINT,
    companies TEXT,
    related_topics TEXT NOT NULL,
    likes INT,
    dislikes INT,
    rating FLOAT,
    similar_questions LONGTEXT
)
''')

# 创建user_history表
cursor.execute('''
CREATE TABLE user_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    solution_code TEXT NOT NULL,
    version INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
)
''')

# 创建autosave_codes表
cursor.execute('''
CREATE TABLE autosave_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    autosave_code TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
)
''')

# 创建user_attributes表
cursor.execute('''
CREATE TABLE user_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
)
''')

# 创建gpt_conversations表
cursor.execute('''
CREATE TABLE gpt_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    message TEXT NOT NULL,  -- 存储用户提问或 GPT 回复
    conversation_type VARCHAR(50) NOT NULL,  -- 区分提问和回复（user 或 gpt）
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id),
    FOREIGN KEY (problem_id) REFERENCES problems(id)
)
''')

# 创建recommendations表
cursor.execute('''
CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recommended_problems TEXT NOT NULL,  -- 存储推荐题目ID的列表，逗号分隔
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
)
''')

# 提交更改并关闭连接
conn.commit()
cursor.close()
conn.close()