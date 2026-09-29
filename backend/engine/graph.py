import networkx as nx
from models.schemas import SectorData


def build_dependency_graph(sector_data: SectorData) -> nx.DiGraph:
    G = nx.DiGraph()

    # Add nodes (indicators)
    for ind in sector_data.indicators:
        G.add_node(
            ind.id,
            label=ind.name,
            type="indicator",
            value=ind.current_value,
            weight=ind.weight,
        )

    # Add edges (dependencies)
    for dep in sector_data.dependencies:
        G.add_edge(
            dep.source,
            dep.target,
            weight=dep.weight,
            type=dep.type,
            description=dep.description,
        )

    # Add cross-sector dependencies
    for cs_dep in sector_data.cross_sector_dependencies:
        # Add the target node if it doesn't exist (it's external)
        if not G.has_node(cs_dep.target_node):
            G.add_node(
                cs_dep.target_node,
                label=f"[{cs_dep.target_sector.upper()}] {cs_dep.target_node}",
                type="cross_sector",
            )
        G.add_edge(
            cs_dep.source_node,
            cs_dep.target_node,
            weight=cs_dep.weight,
            type=cs_dep.type,
            description=cs_dep.description,
            is_cross_sector=True,
        )

    return G


def export_graph_for_frontend(G: nx.DiGraph, bottleneck_id: str = None) -> dict:
    """
    Exports a NetworkX graph to a format suitable for React Flow.
    Includes bottleneck highlighting and edge type info.
    """
    nodes = []
    edges = []

    for i, (node_id, data) in enumerate(G.nodes(data=True)):
        if data.get("type") == "cross_sector":
            node_type = "cross_sector"
        elif node_id == bottleneck_id:
            node_type = "bottleneck"
        else:
            node_type = "indicator"

        nodes.append({
            "id": node_id,
            "data": {
                "label": data.get("label", node_id),
                "type": node_type,
                "value": data.get("value"),
            },
            "position": {"x": 0, "y": 0},
        })

    for source, target, data in G.edges(data=True):
        edge_type = data.get("type", "positive")
        is_cross = data.get("is_cross_sector", False)
        edges.append({
            "id": f"e_{source}_{target}",
            "source": source,
            "target": target,
            "label": data.get("description", ""),
            "data": {
                "edgeType": edge_type,
                "weight": data.get("weight", 0.5),
                "isCrossSector": is_cross,
            },
        })

    return {"nodes": nodes, "edges": edges}
