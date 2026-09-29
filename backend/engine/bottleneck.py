from models.schemas import SectorData
from engine.scoring import calculate_score


def find_primary_bottleneck(sector_data: SectorData, score_data: dict) -> dict:
    """
    Compute bottleneck relevance from a combination of:
    Indicator weakness + Dependency centrality + Downstream influence + Constraint strength
    """
    # Calculate downstream influence (number of times it appears as 'source')
    downstream_counts = {}
    downstream_targets = {}  # track which nodes each indicator feeds into
    for dep in sector_data.dependencies:
        downstream_counts[dep.source] = downstream_counts.get(dep.source, 0) + 1
        if dep.source not in downstream_targets:
            downstream_targets[dep.source] = []
        # find the name for the target
        target_name = next(
            (ind.name for ind in sector_data.indicators if ind.id == dep.target),
            dep.target,
        )
        downstream_targets[dep.source].append(target_name)

    for dep in sector_data.cross_sector_dependencies:
        downstream_counts[dep.source_node] = downstream_counts.get(dep.source_node, 0) + 1

    # Find constraint relationships
    constraint_targets = {}
    for dep in sector_data.dependencies:
        if dep.type == "constraint":
            constraint_targets[dep.source] = constraint_targets.get(dep.source, 0) + 1

    bottleneck_candidates = []

    for ind_score in score_data["indicator_scores"]:
        ind_id = ind_score["id"]
        normalized = ind_score["normalized_score"]
        weakness = 100 - normalized
        downstream_influence = downstream_counts.get(ind_id, 0)
        constraint_count = constraint_targets.get(ind_id, 0)

        # Severity combines weakness, downstream importance, and constraint strength
        severity = weakness + (downstream_influence * 10) + (constraint_count * 5)

        # Find the indicator description from the sector data
        indicator_obj = next((ind for ind in sector_data.indicators if ind.id == ind_id), None)
        description = indicator_obj.description if indicator_obj else ""
        current_value = indicator_obj.current_value if indicator_obj else 0

        affected_nodes = downstream_targets.get(ind_id, [])

        bottleneck_candidates.append({
            "indicator_id": ind_id,
            "name": ind_score["name"],
            "description": description,
            "current_value": current_value,
            "normalized_score": round(normalized, 1),
            "weakness": round(weakness, 1),
            "downstream_influence": downstream_influence,
            "affected_nodes": affected_nodes,
            "constraint_relationships": constraint_count,
            "severity": round(severity, 2),
            "weight": ind_score["weight"],
        })

    bottleneck_candidates.sort(key=lambda x: x["severity"], reverse=True)

    if bottleneck_candidates:
        primary = bottleneck_candidates[0]
        # Build a clear, specific explanation
        parts = []
        parts.append(
            f"{primary['name']} scores {primary['normalized_score']}/100 (weakness: {primary['weakness']:.0f}%)."
        )
        if primary["downstream_influence"] > 0:
            parts.append(
                f"It directly feeds into {primary['downstream_influence']} downstream node(s): {', '.join(primary['affected_nodes'])}."
            )
        if primary["constraint_relationships"] > 0:
            parts.append(
                f"It has {primary['constraint_relationships']} constraint relationship(s), meaning demand may outpace capacity."
            )
        parts.append(
            f"Combined severity score: {primary['severity']:.0f} (weakness + downstream influence + constraint strength)."
        )

        return {
            "primary": primary,
            "explanation": " ".join(parts),
            "all_candidates": bottleneck_candidates,
        }
    return {}
