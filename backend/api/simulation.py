from fastapi import APIRouter
from models.schemas import SimulationRequest, SimulationResponse
from engine.simulation import run_simulation

router = APIRouter()

@router.post("/simulate", response_model=SimulationResponse)
def simulate_intervention(request: SimulationRequest):
    return run_simulation(request)

@router.post("/scenarios/compare")
def compare_scenarios(requests: list[SimulationRequest]):
    # Note: Not fully fleshed out here, just a placeholder for the endpoint
    results = [run_simulation(req) for req in requests]
    return {"comparisons": results}
