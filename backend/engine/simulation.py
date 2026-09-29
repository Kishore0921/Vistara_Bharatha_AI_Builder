from models.schemas import SimulationRequest, SimulationResponse, MetricChange
from api.sectors import load_sector_data
from engine.analysis import analyze_sector_state
from engine.graph import build_dependency_graph
import networkx as nx
import copy


def run_simulation(request: SimulationRequest) -> SimulationResponse:
    if request.current_state:
        from models.schemas import SectorData
        sector_data = SectorData(**request.current_state)
    else:
        sector_data = load_sector_data(request.sector)
        
    original_state = analyze_sector_state(sector_data)
    original_bottleneck_id = original_state["bottleneck_data"].get("primary", {}).get("indicator_id")
    original_bottleneck_name = original_state["bottleneck_data"].get("primary", {}).get("name", "Unknown")

    # 1. Apply Direct Intervention
    simulated_data = copy.deepcopy(sector_data)
    direct_effects = []
    changed_metrics = []

    target_ind_idx = next(
        (i for i, ind in enumerate(simulated_data.indicators) if ind.id == request.target),
        None,
    )

    if target_ind_idx is None:
        # Target indicator not found — return baseline unchanged
        baseline_score = original_state["score_data"]["overall_score"]
        return SimulationResponse(
            baseline_score=baseline_score,
            simulated_score=baseline_score,
            changed_indicators=[],
            intervention_effect="Target indicator not found.",
            first_order_effects=[],
            second_order_effects=[],
            ripple_effects=[],
            remaining_constraints=[],
            emerging_bottleneck=None,
            unintended_effects=[],
            cross_sector_impacts=[],
            assumptions=[],
            confidence="Low",
            explanation="The specified target indicator was not found in this sector.",
        )

    target_ind = simulated_data.indicators[target_ind_idx]

    # Look up pre-defined intervention for improvement percentage
    intervention_def = next(
        (inv for inv in sector_data.interventions if inv.target_indicator == request.target),
        None,
    )
    
    better_idea_text = None
    if intervention_def and intervention_def.name == request.intervention:
        improvement_pct = intervention_def.expected_improvement
    else:
        from api.ai import _evaluate_intervention_llm
        eval_result = _evaluate_intervention_llm(
            request.intervention, request.method, request.budget or 0.0, request.time_horizon, target_ind.name, sector_data.sector_id
        )
        improvement_pct = eval_result["improvement_pct"]
        better_idea_text = eval_result["better_idea"]

    old_val = target_ind.current_value
    new_val = min(target_ind.max_value, old_val * (1 + improvement_pct))
    simulated_data.indicators[target_ind_idx].current_value = new_val

    target_name = target_ind.name
    direct_effects.append(
        f"{target_name} improved from {old_val:.1f} to {new_val:.1f} (+{((new_val - old_val) / old_val * 100):.1f}%) through direct intervention."
    )
    changed_metrics.append(
        MetricChange(
            id=target_ind.id,
            name=target_name,
            before=round(old_val, 2),
            after=round(new_val, 2),
            delta=round(new_val - old_val, 2),
        )
    )

    # 2. Build graph and propagate downstream using edge weights
    G = build_dependency_graph(sector_data)
    first_order_effects = []
    second_order_effects = []
    ripple_effects = []
    propagation_chain = []  # Stores readable causal chain

    if request.target in G:
        descendants = list(nx.descendants(G, request.target))

        for desc in descendants:
            try:
                path = nx.shortest_path(G, request.target, desc)
            except nx.NetworkXNoPath:
                continue

            hop_count = len(path) - 1  # Number of edges

            # Calculate propagated impact using edge weights along the shortest path
            cumulative_weight = 1.0
            for i in range(len(path) - 1):
                edge_data = G.get_edge_data(path[i], path[i + 1])
                edge_weight = edge_data.get("weight", 0.5) if edge_data else 0.5
                cumulative_weight *= edge_weight

            # Apply diminishing factor per hop
            diminish = 0.6 ** hop_count
            base_improvement = (new_val - old_val)
            propagated_delta = base_improvement * cumulative_weight * diminish

            desc_idx = next(
                (i for i, ind in enumerate(simulated_data.indicators) if ind.id == desc),
                None,
            )
            if desc_idx is not None:
                desc_old = simulated_data.indicators[desc_idx].current_value
                desc_new = min(
                    simulated_data.indicators[desc_idx].max_value,
                    desc_old + propagated_delta,
                )
                simulated_data.indicators[desc_idx].current_value = desc_new

                desc_name = simulated_data.indicators[desc_idx].name
                delta = round(desc_new - desc_old, 2)

                change = MetricChange(
                    id=desc,
                    name=desc_name,
                    before=round(desc_old, 2),
                    after=round(desc_new, 2),
                    delta=delta,
                )
                changed_metrics.append(change)

                # Build readable causal path
                path_labels = []
                for node_id in path:
                    node_data = G.nodes.get(node_id)
                    path_labels.append(node_data.get("label", node_id) if node_data else node_id)
                causal_str = " → ".join(path_labels)

                effect_str = f"{desc_name}: {desc_old:.1f} → {desc_new:.1f} ({'+' if delta >= 0 else ''}{delta}) via {causal_str}"
                propagation_chain.append(causal_str)

                # Classify by hop distance
                if hop_count == 1:
                    first_order_effects.append(effect_str)
                elif hop_count == 2:
                    second_order_effects.append(effect_str)
                else:
                    ripple_effects.append(effect_str)

    # 3. Recalculate state on the modified data
    new_state = analyze_sector_state(simulated_data)
    baseline_score = original_state["score_data"]["overall_score"]
    simulated_score = new_state["score_data"]["overall_score"]

    # 4. Constraint Evolution Logic
    new_bottleneck_id = new_state["bottleneck_data"].get("primary", {}).get("indicator_id")
    new_bottleneck_name = new_state["bottleneck_data"].get("primary", {}).get("name", "Unknown")

    remaining_constraints = []
    unintended_effects = []
    cross_sector_impacts = []
    emerging_bottleneck = None

    # Check if the original bottleneck was the intervention target
    if original_bottleneck_id == request.target:
        if new_bottleneck_id == original_bottleneck_id:
            # Improved but still the worst — "Remaining Constraint"
            remaining_constraints.append(f"{original_bottleneck_name} (Remaining — improved but still the primary constraint)")
        elif new_bottleneck_id != original_bottleneck_id:
            # Successfully shifted — new one emerges
            remaining_constraints.append(f"{original_bottleneck_name} (Improved)")
            emerging_bottleneck = new_bottleneck_name
    else:
        # Intervention was NOT on the bottleneck
        if new_bottleneck_id == original_bottleneck_id:
            remaining_constraints.append(f"{original_bottleneck_name} (Unchanged — intervention did not target this constraint)")
        else:
            remaining_constraints.append(f"{original_bottleneck_name} (Shifted)")
            emerging_bottleneck = new_bottleneck_name

    # Add other weak indicators as secondary constraints
    all_candidates = new_state["bottleneck_data"].get("all_candidates", [])
    for candidate in all_candidates[1:4]:  # top 3 after primary
        remaining_constraints.append(f"{candidate['name']} (Severity: {candidate['severity']:.0f})")

    # Unintended effects: find indicators that got worse or created pressure
    for change in changed_metrics:
        # If a downstream node's improvement creates pressure on a related constraint
        if change.delta > 0:
            # Check if this node is a "demand" type that pressures infrastructure
            for dep in sector_data.dependencies:
                if dep.source == change.id and dep.type == "constraint":
                    target_dep_name = next(
                        (ind.name for ind in sector_data.indicators if ind.id == dep.target),
                        dep.target,
                    )
                    unintended_effects.append(
                        f"Increased {change.name} (+{change.delta:.1f}) pressures {target_dep_name} via constraint relationship."
                    )

    if not unintended_effects:
        unintended_effects.append("No significant unintended effects detected in this simulation.")

    # Cross-sector impacts
    for cs_dep in sector_data.cross_sector_dependencies:
        if cs_dep.source_node in [c.id for c in changed_metrics]:
            cross_sector_impacts.append(
                f"Change in {cs_dep.source_node} may affect {cs_dep.target_sector} sector ({cs_dep.description})."
            )

    # 5. Build contextual explanation from actual results
    explanation_parts = []
    explanation_parts.append(
        f"The intervention directly improved {target_name} by {((new_val - old_val) / old_val * 100):.1f}%."
    )
    if first_order_effects:
        explanation_parts.append(
            f"This propagated to {len(first_order_effects)} directly connected indicator(s)."
        )
    if second_order_effects or ripple_effects:
        explanation_parts.append(
            f"Further downstream, {len(second_order_effects) + len(ripple_effects)} additional indicator(s) were affected through dependency chains."
        )
    if emerging_bottleneck:
        explanation_parts.append(
            f"The original constraint ({original_bottleneck_name}) improved, but {emerging_bottleneck} has now emerged as the primary system constraint."
        )
    elif original_bottleneck_id == request.target:
        explanation_parts.append(
            f"{original_bottleneck_name} improved but remains the primary constraint — further intervention may be needed."
        )
    explanation_parts.append(
        f"Overall system score changed from {baseline_score:.1f} to {simulated_score:.1f} ({'+' if simulated_score >= baseline_score else ''}{(simulated_score - baseline_score):.1f})."
    )

    assumptions = [
        "Weighted dependency propagation with diminishing returns per hop",
        f"Improvement rate: {improvement_pct * 100:.0f}% on target indicator",
        "All other external factors held constant",
        "Data classification: DEMONSTRATION DATA",
    ]

    return SimulationResponse(
        baseline_score=baseline_score,
        simulated_score=simulated_score,
        changed_indicators=changed_metrics,
        intervention_effect=direct_effects[0] if direct_effects else "",
        first_order_effects=first_order_effects,
        second_order_effects=second_order_effects,
        ripple_effects=ripple_effects,
        remaining_constraints=remaining_constraints,
        emerging_bottleneck=emerging_bottleneck,
        unintended_effects=unintended_effects,
        cross_sector_impacts=cross_sector_impacts,
        assumptions=assumptions,
        confidence="Medium",
        explanation=" ".join(explanation_parts),
        better_idea=better_idea_text,
        simulated_state=simulated_data.dict(by_alias=True)
    )
