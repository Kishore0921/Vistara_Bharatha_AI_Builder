from fastapi import APIRouter, HTTPException
from models.schemas import SectorData
from engine.analysis import analyze_sector_state
from api.sectors import load_sector_data

router = APIRouter()


@router.get("/{sector_id}/analysis")
def get_sector_analysis(sector_id: str):
    sector_data = load_sector_data(sector_id)
    return analyze_sector_state(sector_data)


@router.get("/{sector_id}/history")
def get_sector_history(sector_id: str):
    sector_data = load_sector_data(sector_id)
    return sector_data.historical_data


@router.get("/{sector_id}/graph")
def get_sector_graph(sector_id: str):
    from engine.graph import build_dependency_graph, export_graph_for_frontend

    sector_data = load_sector_data(sector_id)
    analysis = analyze_sector_state(sector_data)
    bottleneck_id = analysis["bottleneck_data"].get("primary", {}).get("indicator_id")

    G = build_dependency_graph(sector_data)
    return export_graph_for_frontend(G, bottleneck_id=bottleneck_id)
