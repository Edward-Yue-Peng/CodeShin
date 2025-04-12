import mysql.connector
import pandas as pd

# 连接到MySQL数据库
conn = mysql.connector.connect(
    host='localhost',
    user='yuanshen',
    password='yuanshenqidong',
    database='yuan_database'
)
cursor = conn.cursor()

# 查询problems表中的数据
cursor.execute('SELECT * FROM problems')

# 获取所有结果
rows = cursor.fetchall()

# 获取列名
columns = [desc[0] for desc in cursor.description]

# 将数据加载到DataFrame中
df = pd.DataFrame(rows, columns=columns)

# 打印DataFrame
print(df)

# 关闭连接
cursor.close()
conn.close()