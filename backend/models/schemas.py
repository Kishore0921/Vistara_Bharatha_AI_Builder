from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union

class Indicator(BaseModel):
    id: str
    name: str
    description: str
    unit: str
    weight: float
    current_value: float
    min_value: float = 0.0
    max_value: float = 100.0

class HistoricalData(BaseModel):
    year: int
    values: Dict[str, float]

class Decision(BaseModel):
    id: str
    intervention: str
    period: str
    objective: str
    affected_indicators: List[str]
    outcome: str
    limitations: Optional[str]
    source_type: str = "DEMONSTRATION DATA"

class Dependency(BaseModel):
    source: str
    target: str
    type: str = "positive" # positive, negative, constraint
    weight: float
    description: str

class CrossSectorDependency(BaseModel):
    target_sector: str
    source_node: str
    target_node: str
    type: str = "positive"
    weight: float
    description: str

class InterventionDef(BaseModel):
    id: str
    name: str
    description: str
    target_indicator: str
    expected_improvement: float
    time_horizon_years: int
    dependencies_addressed: Optional[List[str]] = []

class SectorData(BaseModel):
    sector_id: str = Field(alias="sector")
    description: str
    indicators: List[Indicator]
    historical_data: List[HistoricalData]
    decisions: List[Decision]
    dependencies: List[Dependency]
    cross_sector_dependencies: List[CrossSectorDependency]
    interventions: List[InterventionDef]
    assumptions: List[str]
    sources: List[Dict[str, str]]

class SimulationRequest(BaseModel):
    sector: str
    target: str
    intervention: str
    method: str
    budget: Optional[float] = None
    time_horizon: int
    current_state: Optional[dict] = None

class MetricChange(BaseModel):
    id: str
    name: str
    before: float
    after: float
    delta: float

class SimulationResponse(BaseModel):
    baseline_score: float
    simulated_score: float
    changed_indicators: List[MetricChange]
    intervention_effect: str
    first_order_effects: List[str]
    second_order_effects: List[str]
    ripple_effects: List[str]
    remaining_constraints: List[str]
    emerging_bottleneck: Optional[str]
    unintended_effects: List[str]
    cross_sector_impacts: List[str]
    assumptions: List[str]
    confidence: str
    explanation: str
    better_idea: Optional[str] = None
    simulated_state: Optional[dict] = None

class ReportRequest(BaseModel):
    sector_id: str
    simulation_results: Optional[SimulationResponse] = None
