from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import sectors, analysis, simulation, reports, ai

app = FastAPI(
    title="Vistara Bharatha API",
    description="Backend for the cross-sector governance intelligence and scenario simulation platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sectors.router, prefix="/api/sectors", tags=["Sectors"])
app.include_router(analysis.router, prefix="/api/sectors", tags=["Analysis"]) # Analysis specific routes under /api/sectors/{sector_id}
app.include_router(simulation.router, prefix="/api", tags=["Simulation"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Vistara Bharatha API"}
