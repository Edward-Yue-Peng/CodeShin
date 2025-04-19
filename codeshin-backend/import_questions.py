import os
import pandas as pd
import django

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yuanshen.settings')  # 替换为你的项目 settings.py 路径
django.setup()

from users.models import Problem, Topic  # 导入 Django 的 Problem 和 Topic 模型

# 定义一个函数来转换 accepted 和 submissions 列中的数据
def convert_to_int(value):
    if pd.isna(value):
        return 0
    if 'M' in value:
        return int(float(value.replace('M', '')) * 1_000_000)
    elif 'K' in value:
        return int(float(value.replace('K', '')) * 1_000)
    else:
        return int(value)

# 插入数据到数据库的函数
def insert_data_to_db(dataframe):
    try:
        # 遍历 DataFrame 并插入数据到 Django 的 Problem 模型
        for _, row in dataframe.iterrows():
            # 获取或创建相关主题
            related_topics = []
            if pd.notna(row['related_topics']):
                topic_names = row['related_topics'].split(',')  # 假设主题名称是逗号分隔的字符串
                for topic_name in topic_names:
                    topic, created = Topic.objects.get_or_create(name=topic_name.strip())
                    related_topics.append(topic)

            # 创建 Problem 对象
            problem = Problem.objects.create(
                title=row['title'],
                description=row['description'],
                is_premium=row['is_premium'],
                difficulty=row['difficulty'],
                acceptance_rate=row['acceptance_rate'],
                frequency=row['frequency'],
                url=row['url'],
                discuss_count=row['discuss_count'],
                accepted=row['accepted'],
                submissions=row['submissions'],
                likes=row['likes'],
                dislikes=row['dislikes'],
                rating=row['rating'],
                similar_questions=row['similar_questions']  # 假设 similar_questions 是字符串
            )

            # 添加多对多关系
            problem.related_topics.set(related_topics)

        print(f"Successfully inserted {len(dataframe)} rows into the database.")

    except Exception as e:
        print(f"Error: {e}")

# 主函数
def main():
    # 读取 CSV 文件
    csv_file_path = f'{os.path.dirname(os.path.realpath(__file__))}/Database_prep/problems_latest.csv'
    df = pd.read_csv(csv_file_path)

    # 打印列名和前几行数据以进行调试
    print("Columns in CSV:", df.columns)
    print("First 5 rows of data:")
    print(df.head())

    # 数据清洗
    df['accepted'] = df['accepted'].apply(convert_to_int)
    df['submissions'] = df['submissions'].apply(convert_to_int)

    # 插入数据到数据库
    insert_data_to_db(df)

if __name__ == '__main__':
    main()