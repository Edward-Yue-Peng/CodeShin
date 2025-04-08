import requests

BASE_URL = "https://your-domain.com" 
USER_ID = 1  

def api_get(path, params=None):
    resp = requests.get(f"{BASE_URL}{path}", params=params)
    resp.raise_for_status()
    return resp.json()
def api_post(path, json_body):
    r = requests.post(f"{BASE_URL}{path}", json=json_body)
    r.raise_for_status()
    return r.json()
def level(mastery_value):
    if mastery_value < 0.33: return 1
    if mastery_value < 0.66: return 2
    return 3

def recommender(user_id):
    W_SIMILARITY    = 0.4
    W_COMMON_TOPICS = 0.4
    W_DIFFICULTY    = 0.2

    cur_pid = api_get("/api/current_problem/", {"user_id": user_id})["current_problem_id"]
    related_topics = api_get("/api/related_topics/", {"problem_id": cur_pid})["related_topics"]
    mastery_map    = api_get("/api/related_topics_mastery/",
                             {"user_id": user_id, "problem_id": cur_pid})["related_topics_mastery"]
    topic_level = { t: level(mastery_map[t]) for t in related_topics }

    similars = api_get("/api/similar_questions/", {"problem_id": cur_pid})["similar_questions"]

    history = api_get("/api/get_user_history/",
                      {"user_id": user_id, "page_size": 1000})["history"]
    done = { h["problem_id"] for h in history if h["is_passed"] }

    candidates = set(similars)

    if len(similars) < 5:
        for topic, lvl in topic_level.items():
            if lvl in (1,2):
                bucket = api_get("/api/topics_difficulty_bucket/", {"topic": topic})["difficulty bucket"]
                same_level_ids = bucket.get(str(lvl), [])
                candidates.update(same_level_ids)

    scores = []
    for pid in candidates:
        if pid in done:
            continue  

        score_sim = 1.0 if pid in similars else 0.0

        topics_i = set(api_get("/api/related_topics/", {"problem_id": pid})["related_topics"])
        common   = topics_i & set(related_topics)
        if common:
            poor = sum(1 for t in common if topic_level[t] < 3)
            score_common = poor / len(common)
        else:
            score_common = 0.0

    
        difficulty_level = api_get("/api/problem_difficulty/", {cur_pid})["problem_difficulty"]/3.0 #0-1
    
        avg_lvl = sum(topic_level.values()) / len(topic_level) #0-1
  
        diff = abs(difficulty_level - avg_lvl)
        score_diff = max(0.0, 1 - diff/2)

        total = (W_SIMILARITY    * score_sim +
                 W_COMMON_TOPICS * score_common +
                 W_DIFFICULTY    * score_diff)
        scores.append((pid, total))

    scores.sort(key=lambda x: x[1], reverse=True)
    recs = [pid for pid, _ in scores[:2]]

    api_post("/api/set_recommendations/",
             {"user_id": user_id, "recommended_problems": recs})
    return recs


if __name__ == "__main__":
    recommender(USER_ID)