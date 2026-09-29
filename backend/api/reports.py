from fastapi import APIRouter
from fastapi.responses import Response
from models.schemas import ReportRequest
from api.sectors import load_sector_data
from engine.analysis import analyze_sector_state
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter()

@router.post("/generate")
def generate_report(request: ReportRequest):
    """
    Generate a structured PDF report reflecting actual simulation results.
    """
    sector_data = load_sector_data(request.sector_id)
    analysis = analyze_sector_state(sector_data)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    h2_style = styles['Heading2']
    normal_style = styles['Normal']
    
    elements = []
    
    # Title
    elements.append(Paragraph("Vistara Bharatha — Decision Report", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Sector: {sector_data.sector_id.upper()} - {sector_data.description}", normal_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("DISCLAIMER: This is a model-based decision-support report. Simulated results are scenarios, not guarantees. Model scores are not official government scores.", normal_style))
    elements.append(Spacer(1, 24))
    
    # Current State
    elements.append(Paragraph("Baseline State", h2_style))
    elements.append(Paragraph(f"Overall Score: {analysis['score_data']['overall_score']}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Indicators Table
    data = [["Indicator", "Score", "Weight"]]
    for ind in analysis['score_data']['indicator_scores']:
        data.append([ind['name'], str(ind['normalized_score']), str(ind['weight'])])
        
    t = Table(data, colWidths=[200, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))
    
    # Simulation Results
    if request.simulation_results:
        sim = request.simulation_results
        elements.append(Paragraph("Simulation Results", h2_style))
        elements.append(Paragraph(f"Simulated Score: {sim.simulated_score} (Change: {round(sim.simulated_score - sim.baseline_score, 2)})", normal_style))
        elements.append(Spacer(1, 12))
        
        elements.append(Paragraph("AI Explanation:", styles['Heading3']))
        elements.append(Paragraph(sim.explanation, normal_style))
        elements.append(Spacer(1, 12))
        
        if sim.better_idea:
            elements.append(Paragraph("AI Better Idea:", styles['Heading3']))
            elements.append(Paragraph(sim.better_idea, normal_style))
            elements.append(Spacer(1, 12))
            
        elements.append(Paragraph("Indicator Changes:", styles['Heading3']))
        change_data = [["Indicator", "Before", "After", "Delta"]]
        for ci in sim.changed_indicators:
            change_data.append([ci.name, str(ci.before), str(ci.after), str(ci.delta)])
            
        tc = Table(change_data, colWidths=[150, 80, 80, 80])
        tc.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        elements.append(tc)
        elements.append(Spacer(1, 24))
        
    # Graph Text
    elements.append(Paragraph("Graph Data (JSON format representation):", h2_style))
    from engine.graph import build_dependency_graph, export_graph_for_frontend
    import json
    G = build_dependency_graph(sector_data)
    graph_data = export_graph_for_frontend(G)
    graph_str = json.dumps(graph_data, indent=2)
    # keep it reasonable length
    if len(graph_str) > 2000:
        graph_str = graph_str[:2000] + "\n... (truncated)"
        
    code_style = ParagraphStyle('Code', parent=styles['Code'], fontSize=8, leading=10)
    elements.append(Paragraph(graph_str.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style))

    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    
    return Response(content=pdf, media_type="application/pdf")
