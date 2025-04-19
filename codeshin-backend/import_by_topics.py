import os
import django

# 设置 Django 环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yuanshen.settings')  # 替换为你的项目 settings.py 路径
django.setup()

from users.models import Topic, Problem, TopicProblem
import csv


def import_sorted_topics(csv_file_path):
    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            topic_name = row['topics']
            easy_questions = row['EasyQuestions'].split(', ') if row['EasyQuestions'] else []
            medium_questions = row['MediumQuestions'].split(', ') if row['MediumQuestions'] else []
            hard_questions = row['HardQuestions'].split(', ') if row['HardQuestions'] else []

            # 获取或创建 Topic 实例
            topic, _ = Topic.objects.get_or_create(name=topic_name)
            print(f"Processing topic: {topic_name}")

            # 处理 EasyQuestions
            for problem_id in easy_questions:
                try:
                    problem = Problem.objects.get(id=int(problem_id))
                    _, created = TopicProblem.objects.get_or_create(topic=topic, problem=problem, difficulty='Easy')
                    if created:
                        print(f"  [SUCCESS] Added Easy problem {problem_id} to topic {topic_name}")
                    else:
                        print(f"  [EXISTS] Easy problem {problem_id} already exists in topic {topic_name}")
                except Problem.DoesNotExist:
                    print(f"  [ERROR] Problem with ID {problem_id} does not exist (Easy)")

            # 处理 MediumQuestions
            for problem_id in medium_questions:
                try:
                    problem = Problem.objects.get(id=int(problem_id))
                    _, created = TopicProblem.objects.get_or_create(topic=topic, problem=problem, difficulty='Medium')
                    if created:
                        print(f"  [SUCCESS] Added Medium problem {problem_id} to topic {topic_name}")
                    else:
                        print(f"  [EXISTS] Medium problem {problem_id} already exists in topic {topic_name}")
                except Problem.DoesNotExist:
                    print(f"  [ERROR] Problem with ID {problem_id} does not exist (Medium)")

            # 处理 HardQuestions
            for problem_id in hard_questions:
                try:
                    problem = Problem.objects.get(id=int(problem_id))
                    _, created = TopicProblem.objects.get_or_create(topic=topic, problem=problem, difficulty='Hard')
                    if created:
                        print(f"  [SUCCESS] Added Hard problem {problem_id} to topic {topic_name}")
                    else:
                        print(f"  [EXISTS] Hard problem {problem_id} already exists in topic {topic_name}")
                except Problem.DoesNotExist:
                    print(f"  [ERROR] Problem with ID {problem_id} does not exist (Hard)")

# 调用函数
import_sorted_topics(f'{os.path.dirname(os.path.realpath(__file__))}/Database_prep/sorted_topics_id.csv')