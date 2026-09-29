from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import os

router = APIRouter()


class ExplainRequest(BaseModel):
    results: dict

def _evaluate_intervention_llm(intervention_name: str, method: str, budget: float, time_horizon: int, target: str, sector: str) -> dict:
    """
    Uses LLM (if available) or deterministic heuristic to evaluate intervention and provide a better idea.
    """
    import re

    def is_gibberish(text: str) -> bool:
        if not text:
            return True
        text = text.lower()
        vowels = sum(1 for c in text if c in 'aeiou')
        alpha = sum(1 for c in text if c.isalpha())
        if alpha == 0:
            return True
        if vowels / alpha < 0.15 or vowels / alpha > 0.8:
            return True
        words = text.split()
        if any(len(w) > 15 for w in words):
            return True
        return False

    if is_gibberish(intervention_name) or is_gibberish(method):
        return {
            "improvement_pct": 0.0,
            "better_idea": "The provided intervention appears to be invalid or unclear. Please provide a descriptive name and a concrete method to receive a meaningful simulation."
        }

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("your_") or len(api_key) < 20:
        # Pseudo-random but deterministic based on string hash
        hash_val = sum(ord(c) for c in (intervention_name + method))
        pct = 0.05 + (hash_val % 20) / 100.0 # 5% to 24%
        
        # Simple heuristic response
        better_idea = "Consider pairing this intervention with an investment in technology or process automation to scale the impact more rapidly."
        if "policy" in method.lower() or "policy" in intervention_name.lower():
            better_idea = "Consider pairing this policy change with an awareness campaign to ensure higher compliance and understanding among stakeholders."
        elif "train" in method.lower() or "train" in intervention_name.lower():
            better_idea = "Consider introducing a train-the-trainer model or digital learning platforms to reduce long-term training costs and scale faster."

        return {"improvement_pct": pct, "better_idea": better_idea}
    
    try:
        import openai
        import json
        client = openai.OpenAI(api_key=api_key)
        
        prompt = f'''You are a simulation engine expert for the {sector} sector.
A user has proposed the following intervention to improve the target '{target}':
Intervention Name: {intervention_name}
Method: {method}
Budget: {budget}
Time Horizon: {time_horizon} years

Evaluate this intervention realistically. Follow these rules:
1. If the intervention name or method is gibberish, random letters, nonsensical, or completely unrelated to {sector}, return improvement_pct as 0.0 and tell them to provide a real intervention in better_idea.
2. Otherwise, provide a realistic improvement percentage based on how effective the method would actually be in reality (between 0.01 and 0.50). Provide as float, e.g. 0.15 for 15%.
3. In better_idea, suggest a more effective or synergistic intervention.

Return ONLY a valid JSON object in this format:
{{"improvement_pct": 0.15, "better_idea": "..."}}'''
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3,
            response_format={ "type": "json_object" }
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "improvement_pct": float(data.get("improvement_pct", 0.10)),
            "better_idea": data.get("better_idea", "No better idea provided.")
        }
    except Exception as e:
        print(f"Error in LLM eval: {e}")
        return {"improvement_pct": 0.10, "better_idea": "Consider evidence-based policy adjustments alongside your current plan."}



def _build_rule_based_explanation(results: dict) -> str:
    """
    Generates a specific, contextual explanation from actual simulation results
    rather than a generic statement.
    """
    parts = []

    # Score change
    baseline = results.get("baseline_score", 0)
    simulated = results.get("simulated_score", 0)
    delta = simulated - baseline

    if delta > 0:
        parts.append(
            f"The intervention improved the overall sector score from {baseline:.1f} to {simulated:.1f} (+{delta:.1f} points)."
        )
    elif delta < 0:
        parts.append(
            f"The intervention decreased the overall sector score from {baseline:.1f} to {simulated:.1f} ({delta:.1f} points)."
        )
    else:
        parts.append("The intervention had no measurable impact on the overall score.")

    # Direct effects
    intervention = results.get("intervention_effect", "")
    if intervention:
        parts.append(f"Direct impact: {intervention}")

    # Propagation
    first_order = results.get("first_order_effects", [])
    second = results.get("second_order_effects", [])
    ripple = results.get("ripple_effects", [])
    total_downstream = len(first_order) + len(second) + len(ripple)
    if total_downstream > 0:
        parts.append(
            f"The improvement propagated downstream through {total_downstream} connected indicator(s) via dependency relationships."
        )
        if first_order:
            # Extract indicator names from effect strings
            names = [e.split(":")[0].strip() for e in first_order if ":" in e]
            if names:
                parts.append(f"First-order downstream effects reached: {', '.join(names)}.")

    # Constraint evolution
    emerging = results.get("emerging_bottleneck")
    remaining = results.get("remaining_constraints", [])
    if emerging:
        parts.append(
            f"However, {emerging} has now emerged as the new primary system constraint, replacing the original bottleneck."
        )
    elif remaining:
        first_constraint = remaining[0] if remaining else ""
        if "Remaining" in first_constraint:
            parts.append(
                "The original bottleneck improved but remains the dominant constraint. Additional intervention is recommended."
            )

    # Unintended effects
    unintended = results.get("unintended_effects", [])
    real_unintended = [u for u in unintended if "No significant" not in u]
    if real_unintended:
        parts.append(
            f"Potential trade-off detected: {real_unintended[0]}"
        )

    # Cross-sector
    cross = results.get("cross_sector_impacts", [])
    if cross:
        parts.append(f"Cross-sector note: {cross[0]}")

    return " ".join(parts)


def _try_llm_explanation(results: dict) -> Optional[str]:
    """
    Attempts to use OpenAI API for richer explanation.
    Returns None if unavailable.
    """
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("your_") or len(api_key) < 20:
        return None

    try:
        import openai
        client = openai.OpenAI(api_key=api_key)

        prompt = f"""You are an analyst for a governance simulation platform called Vistara Bharatha.
Summarize these simulation results in 3-4 sentences. Be specific about indicator names, score changes, and causal relationships. Do not make claims beyond the data provided. Do not use generic phrases like "positively affected the system."

Results: {results}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception:
        return None


@router.post("/explain")
def explain_results(request: ExplainRequest):
    # Try LLM first, fall back to rule-based
    llm_result = _try_llm_explanation(request.results)
    if llm_result:
        return {"explanation": llm_result, "source": "ai"}

    fallback = _build_rule_based_explanation(request.results)
    return {"explanation": fallback, "source": "rule-based"}
