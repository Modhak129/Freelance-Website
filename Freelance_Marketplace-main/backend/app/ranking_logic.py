from app.models import User

BASE_WEIGHTS = {
    "price": 0.25, "rating": 0.25, "completion_rate": 0.15,
    "on_time_rate": 0.15, "skill_match": 0.15, "portfolio_score": 0.05, "timeline": 0.10
}
_total = sum(BASE_WEIGHTS.values())
BASE_WEIGHTS = {k: v / _total for k, v in BASE_WEIGHTS.items()}

def jaccard_skill_match(project_skills, freelancer_skills):
    if not project_skills: return 0.5
    ps = set([s.strip().lower() for s in project_skills])
    fs = set([s.strip().lower() for s in freelancer_skills])
    inter = ps.intersection(fs)
    union = ps.union(fs)
    return len(inter) / len(union) if union else 0.0

def normalize_feature_list(feature_values, invert=False):
    if not feature_values: return []
    lo, hi = min(feature_values), max(feature_values)
    if hi == lo: return [0.5 for _ in feature_values]
    norm = []
    for v in feature_values:
        scaled = (v - lo) / (hi - lo)
        norm.append(1 - scaled if invert else scaled)
    return norm

def adjust_weights_for_priority(priority):
    w = BASE_WEIGHTS.copy()
    boost = 0.25
    if priority == "price": w["price"] += boost
    elif priority == "time": w["timeline"] += boost
    elif priority == "rating": w["rating"] += boost
    total = sum(w.values())
    return {k: v / total for k, v in w.items()}

def compute_features_for_bid(bid, freelancer, project):
    features = {}
    features["price"] = float(bid.amount)
    features["timeline"] = float(bid.proposed_timeline_days or 30)
    features["rating"] = float(freelancer.avg_rating or 0) / 5.0
    features["completion_rate"] = float(freelancer.completion_rate or 0)
    features["on_time_rate"] = float(freelancer.on_time_rate or 0)
    features["portfolio_score"] = float(freelancer.portfolio_score or 0)
    p_skills = project.required_skills.split(',') if project.required_skills else []
    f_skills = freelancer.skills.split(',') if freelancer.skills else []
    features["skill_match"] = jaccard_skill_match(p_skills, f_skills)
    return features

def calculate_ranked_bids(project, bids, priority='balanced'):
    per_bid_data = []
    freelancers = {}
    
    for bid in bids:
        if bid.freelancer_id not in freelancers:
            freelancers[bid.freelancer_id] = User.query.get(bid.freelancer_id)
        freelancer = freelancers[bid.freelancer_id]
        if not freelancer: continue
        features = compute_features_for_bid(bid, freelancer, project)
        per_bid_data.append({"bid": bid, "freelancer": freelancer, "features": features})

    if not per_bid_data: return {"ranked_bids": [], "weights_applied": {}}

    # Normalize
    prices = [b["features"]["price"] for b in per_bid_data]
    timelines = [b["features"]["timeline"] for b in per_bid_data]
    ratings = [b["features"]["rating"] for b in per_bid_data]
    on_time = [b["features"]["on_time_rate"] for b in per_bid_data]
    skills = [b["features"]["skill_match"] for b in per_bid_data]

    norm_price = normalize_feature_list(prices, invert=True)
    norm_timeline = normalize_feature_list(timelines, invert=True)
    norm_rating = normalize_feature_list(ratings)
    norm_on_time = normalize_feature_list(on_time)
    norm_skills = normalize_feature_list(skills)

    weights = adjust_weights_for_priority(priority)
    results = []

    for i, b_data in enumerate(per_bid_data):
        score = (
            weights["price"] * norm_price[i] +
            weights["rating"] * norm_rating[i] +
            weights["timeline"] * norm_timeline[i] +
            weights["on_time_rate"] * norm_on_time[i] +
            weights["skill_match"] * norm_skills[i]
        ) * 10

        # CORRECT SERIALIZATION FOR FRONTEND
        results.append({
            "id": b_data["bid"].id,
            "amount": b_data["bid"].amount,
            "proposal": b_data["bid"].proposal,
            "proposed_timeline_days": b_data["bid"].proposed_timeline_days,
            "created_at": b_data["bid"].created_at,
            "freelancer": {
                "id": b_data["freelancer"].id,
                "username": b_data["freelancer"].username,
                "avg_rating": b_data["freelancer"].avg_rating,
                # Stats
                "on_time_count": b_data["freelancer"].on_time_count,
                "delayed_count": b_data["freelancer"].delayed_count,
                "projects_completed": b_data["freelancer"].projects_completed
            },
            "score": round(score, 1)
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"weights_applied": weights, "ranked_bids": results}