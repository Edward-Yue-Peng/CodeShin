import json
import traceback
import requests

from django.conf import settings
from django.http import JsonResponse

from users.utils import client, model


def call_gpt_for_growth_path(user_id):
    """
    调用 GPT API，获取用户成长路径的建议。
    """
    # Step 1: 调用 get_user_last_scores API，获取用户历史上所有做过的题目的最后一次得分
    user_last_scores_url = f"{settings.BASE_URL}/api/get_user_last_scores/"
    response = requests.get(user_last_scores_url, params={"user_id": user_id})

    if response.status_code != 200:
        return {"error": f"Failed to fetch user last scores: {response.json().get('error', 'Unknown error')}"}

    user_last_scores = response.json().get("last_scores", [])
    if not user_last_scores:
        return {"error": "No user history found"}

    # Step 2: 调用 get_problems API，获取题目的名字和描述
    problems_data = []
    for record in user_last_scores:
        problem_id = record["problem_id"]
        score = record["score"]
        problem_url = f"{settings.BASE_URL}/api/problems/"
        problem_response = requests.get(problem_url, params={"id": problem_id})
        if problem_response.status_code != 200:
            return {
                "error": f"Failed to fetch problem data for problem_id {problem_id}: {problem_response.json().get('error', 'Unknown error')}"}

        problem_data = problem_response.json()
        problems_data.append({
            "title": problem_data["title"],
            "description": problem_data["description"],
            "score": score
        })

    # Step 3: 构造 GPT 的输入
    gpt_input = {
        "user_id": user_id,
        "growth_path": problems_data
    }

# TODO prompt
    prompts = [
        {
            "role": "system",
            "content": "You are an AI assistant helping users improve their coding skills based on their growth path."
        },
        {
            "role": "user",
            "content": f"Here is the user's growth path: {gpt_input}. Please provide suggestions for improvement."
        }
    ]

    # Step 4: 使用 client.chat.completions.create 调用 GPT
    try:
        response = client.chat.completions.create(
            model=model,
            messages=prompts,
            max_tokens=4096,
            temperature=0.7
        )
        suggestions = response.choices[0].message.content
        return {"suggestions": suggestions}
    except Exception as e:
        print("Exception in call_gpt_for_growth_path():", e)
        traceback.print_exc()
        return {
            "error": True,
            "message": str(e),
            "traceback": traceback.format_exc()
        }
