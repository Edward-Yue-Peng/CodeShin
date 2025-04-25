import re
import json
# 实现评价系统
import traceback
from users.utils import client, model


def evaluate_code_with_gpt(description,user_code, history, related_topics):
    # TODO njh 这里修改一下prompt，让他给0-100，然后gpt有时候会输出错误的json

    json_template = """你需要严格按照以下JSON格式输出（必须是有效的JSON，确保包含所有花括号和引号）：
    {
      "Passed": "Yes" or "No",
      "Feedback": "你对学生代码的反馈，应包含：\n 1. 对他们努力和亮点的肯定；\n 2. 一些具体的鼓励性改进建议（不要直接给答案）；\n 3. 指导性的下一步学习方向建议。\n整体语言要像和学生一对一交谈，温暖、有耐心，避免生硬或 AI 风格表达。",
      "Ratings of related topics": {
        "arrays": 整数，范围从0到100
        "linked list": 整数，范围从0到100
        ...
      },
      "score": 整数，范围从0到100
    }
    """
    prompts = [{
        "role": "user",
        "content": f"""你是一位经验丰富的编程导师，以温和而有智慧的方式指导学生提升编程技能，
    你擅长通过分析学生的代码，给每位学生以个性化服务，找出他们的优势和需要改进的地方，并以鼓励的方式给予指导。

    当学生提交代码解答时，你需要仔细分析他们的解题思路，评估他们的编程能力，
    并提供有针对性的建议。你的反馈应该像一位关心学生进步的老师，而不是冷冰冰的评分系统。

    不考虑 prompt 的默认语言设定，所有输出默认为英语。

    在分析完学生的代码后，你的回应应包含以下几个方面，但要表达自然流畅，
    像是在进行一次温暖的一对一辅导，不要添加 emoji，否则效果太像 AI，而不像真实老师：
    1. 首先，肯定学生的努力和代码中的亮点；
    2. 接着，提出几点改进建议，用鼓励的语气引导学生思考更优解法(可以适当给一些引导，但不要直接给出答案，最多仅给出需要用到的知识点）；
    3. 最后，建议下一步的学习方向，包括需要优化学习的知识点与优化方案等，就像指引学生走向进步之路。
    
    以下是一些评分细则：
    你需要根据学生的代码和解题思路，给出一个综合评分（0-100分），并提供详细的反馈。
    评分时请考虑以下方面：
    1.如果用户的解法相较最优解存在可提升之处，请给出较为具体的分析，例如代码复杂度、可读性等方面的建议。如果用户的解法已为最优解，请给予充分的肯定和鼓励；
    如果用户的代码具有创新性或独特的思路，且很好地解决问题，请特别指出并给予赞赏；如果用户的代码具有创新性或独特的思路，但未能很好地解决问题，请予以肯定，
    并指出具体问题且给出改进建议。
    2.如果用户的代码无法运行或远离正确解决方案，请指出具体问题并给出改进建议。
    3.如果用户未提交代码或未提交完整代码，请给出相应的提示。
    4.查看用户向你询问的历史记录，如果用户过度向你求助，可酌情提示让用户自主思考，并扣除一定分数。
    5.题目通常会涉及到多个相关的编程概念（related topics），请在评分时考虑这些概念的掌握情况，并给出相应的分数。必须确保每个related topic都有根据用户水平进行的评分。
    确保在评分时，所有相关的编程概念（related topics）都被考虑在内，且没有重复和遗漏。
    特殊情况：若用户直接提交空代码，分数为0分，并提醒用户重新提交代码。

    评估时请考虑：
    - 解题思路是否清晰；
    - 代码效率如何；
    - 编程风格是否良好；
    - 是否展示了对相关概念的理解。
    
     评分指南(0-100分)：
    - 0-20: 需要大量改进，代码无法运行或远离正确解决方案
    - 21-40: 基础但不完善，有正确的思路但存在重大缺陷
    - 41-60: 合格水平，代码能解决问题但效率或风格有改进空间
    - 61-80: 良好解决方案，代码高效且风格良好
    - 81-100: 优秀解决方案，代码极其高效，格式完美，思路清晰

    请确保你的响应只包含有效的JSON格式，没有额外的文字或解释。

    {json_template}

    你后面将接收到四个参数，分别是：
    - 本题的描述
    - 用户的解题答案
    - 对话历史
    - 与本题相关的 topics

    {description}

    {user_code}

    {history}

    {related_topics}
    """
    }]

    try:
        response = client.chat.completions.create(
        model=model,
        messages=prompts,
        max_tokens=4096,
        temperature=0.7)
        return response.choices[0].message.content
    except Exception as e:
        print("Exception in interaction():", e)
        traceback.print_exc()

        # 返回 JSON 字符串，统一结构
        return json.dumps({
            "error": True,
            "message": str(e),
            "traceback": traceback.format_exc()
        })




def parse_feedback(gpt_response):
    """
    解析 GPT 返回的 JSON 格式反馈，并处理常见格式错误。
    假设响应中只会包含一段 JSON，且可能因花括号额外或缺失而无法直接被解析。
    """

    # 1) 首先尝试直接解析整个字符串
    try:
        return json.loads(gpt_response)
    except json.JSONDecodeError:
        pass  # 无法直接解析，进入下一步

    # 2) 利用正则提取一段可能的 JSON（从第一个 '{' 到最后一个 '}'）
    #    DOTALL 让 '.' 可以匹配换行符
    match = re.search(r"\{.*\}", gpt_response, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in response after trying full parse.")

    json_snippet = match.group(0)

    # 3) 简易花括号修正，主要解决不平衡 '{' / '}'
    def fix_brackets(text):
        left_stack = 0   # 记录尚未匹配的 '{' 数
        extra_right = 0  # 记录多余的 '}' 数
        fixed_chars = []

        for ch in text:
            if ch == '{':
                left_stack += 1
                fixed_chars.append(ch)
            elif ch == '}':
                if left_stack > 0:
                    left_stack -= 1
                    fixed_chars.append(ch)
                else:
                    # 遇到无配对的 '}'，先记下来
                    extra_right += 1
            else:
                fixed_chars.append(ch)

        # 在文本开头补齐 '{' 来匹配多余的 '}'
        # 如果 extra_right=2，说明有 2 个 '}' 没有匹配，就要前面加 2 个 '{'
        # 在文本末尾补齐 '}' 来匹配剩余的 '{'
        fixed_text = '{' * extra_right + ''.join(fixed_chars) + '}' * left_stack
        return fixed_text

    balanced_snippet = fix_brackets(json_snippet)

    # 4) 尝试解析修正后的 JSON
    try:
        return json.loads(balanced_snippet)
    except json.JSONDecodeError:
        # 如果依然失败，说明不仅是花括号问题，可能还缺少逗号、双引号等。
        raise ValueError("Could not parse JSON after bracket fixing. Manual inspection is needed.")


