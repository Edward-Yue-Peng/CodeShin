def prompt_interaction(user_message,description,user_code):
    user_message_with_prompt = f'{user_message}{description}{user_code}'
    # TODO : njh 任务这里需要添加一个prompt, 相当于告诉AI这是用户代码，这是题目，然后让AI给更好的回复
    return user_message_with_prompt