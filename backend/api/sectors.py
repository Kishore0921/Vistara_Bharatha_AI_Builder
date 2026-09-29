from fastapi import APIRouter, HTTPException
from typing import List, Dict
import json
import os
from models.schemas import SectorData

router = APIRouter()

SECTORS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sectors")

def load_sector_data(sector_id: str) -> SectorData:
    file_path = os.path.join(SECTORS_DIR, f"{sector_id}.json")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Sector {sector_id} not found")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return SectorData(**data)

@router.get("/")
def get_all_sectors():
    # Return a basic list of available sectors
    sectors = [
        {"id": "ev", "name": "EV Ecosystem", "description": "Electric Vehicle ecosystem including manufacturing, charging, and skills."},
        {"id": "agriculture", "name": "Agriculture", "description": "Agricultural productivity, water efficiency, and market access."},
        {"id": "energy", "name": "Energy", "description": "Energy generation, grid capacity, and renewable integration."},
        {"id": "skills_employment", "name": "Skills & Employment", "description": "Workforce training, capacity, and employment rates."},
        {"id": "infrastructure", "name": "Infrastructure", "description": "Physical infrastructure, logistics, and connectivity."},
        {"id": "manufacturing", "name": "Manufacturing", "description": "Industrial production, supply chain, and output."},
        {"id": "transportation", "name": "Transportation", "description": "Transportation networks, mobility, and travel efficiency."},
        {"id": "digital_public_services", "name": "Digital Public Services", "description": "Digital infrastructure and public service availability."}
    ]
    return sectors

@router.get("/{sector_id}", response_model=SectorData)
def get_sector(sector_id: str):
    return load_sector_data(sector_id)
