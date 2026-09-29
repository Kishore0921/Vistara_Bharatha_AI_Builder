from models.schemas import SectorData
from engine.scoring import calculate_score
from engine.bottleneck import find_primary_bottleneck

def analyze_sector_state(sector_data: SectorData) -> dict:
    score_data = calculate_score(sector_data)
    bottleneck_data = find_primary_bottleneck(sector_data, score_data)
    
    return {
        "sector_id": sector_data.sector_id,
        "score_data": score_data,
        "bottleneck_data": bottleneck_data,
    }
