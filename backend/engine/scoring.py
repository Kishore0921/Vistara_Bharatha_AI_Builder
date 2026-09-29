from models.schemas import SectorData

def calculate_score(sector_data: SectorData) -> dict:
    """
    Score = Σ (normalized indicator × indicator weight)
    """
    total_score = 0
    indicator_scores = []
    
    for indicator in sector_data.indicators:
        # Normalize the value based on min and max
        val = indicator.current_value
        min_v = indicator.min_value
        max_v = indicator.max_value
        
        # Avoid division by zero
        if max_v > min_v:
            normalized = ((val - min_v) / (max_v - min_v)) * 100
        else:
            normalized = 0
            
        contribution = (normalized * indicator.weight)
        total_score += contribution
        
        indicator_scores.append({
            "id": indicator.id,
            "name": indicator.name,
            "normalized_score": round(normalized, 2),
            "weight": indicator.weight,
            "contribution": round(contribution, 2)
        })
        
    return {
        "overall_score": round(total_score, 2),
        "indicator_scores": indicator_scores
    }
