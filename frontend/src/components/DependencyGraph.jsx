import React, { useEffect, useState } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, MarkerType, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getSectorGraph } from '../services/api';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? 'left' : 'top';
    node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const CustomNode = ({ data }) => {
  const isCrossSector = data.type === 'cross_sector';
  const isBottleneck = data.type === 'bottleneck' || data.isBottleneck;
  
  const borderColor = isCrossSector ? 'border-purple-500' : (isBottleneck ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-vb-saffron/50');
  const textColor = isCrossSector ? 'text-purple-400' : (isBottleneck ? 'text-red-400' : 'text-vb-saffron/80');
  const labelPrefix = isCrossSector ? 'CROSS-SECTOR' : (isBottleneck ? 'PRIMARY BOTTLENECK' : data.type);

  return (
    <div className={`px-4 py-3 shadow-[0_0_15px_rgba(255,153,51,0.15)] rounded-lg bg-gradient-to-b from-vb-navy-light to-vb-navy border ${borderColor} text-xs font-bold text-vb-white text-center w-[200px] hover:border-vb-saffron hover:shadow-[0_0_20px_rgba(255,153,51,0.4)] transition-all`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-vb-saffron !border-none" />
      <div className={`mb-1 text-[10px] uppercase tracking-wider ${textColor}`}>{labelPrefix}</div>
      {data.label}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-vb-saffron !border-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const DependencyGraph = ({ sectorId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await getSectorGraph(sectorId);
        
        const formattedNodes = data.nodes.map(n => ({
          ...n,
          type: 'custom',
          data: {
            ...n.data,
            isBottleneck: n.data.type === 'bottleneck'
          }
        }));

        const formattedEdges = data.edges.map(e => {
          const isConstraint = e.data?.edgeType === 'constraint';
          const isCrossSector = e.data?.isCrossSector;
          let edgeColor = isConstraint ? '#ef4444' : '#ff9933';
          if (isCrossSector) edgeColor = '#a855f7'; // purple-500
          
          return {
            ...e,
            type: 'smoothstep',
            animated: true,
            label: e.label,
            labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
            labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            },
            style: {
              stroke: edgeColor,
              strokeWidth: isConstraint ? 2 : 1.5,
              strokeDasharray: isConstraint || isCrossSector ? '4 4' : 'none'
            }
          };
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          formattedNodes,
          formattedEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Failed to load graph", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [sectorId]);

  if (loading) return <div className="flex-grow flex items-center justify-center">Loading graph...</div>;

  return (
    <div className="w-full h-full bg-[#0a0f1c] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#334155" gap={16} />
        <Controls className="bg-vb-navy text-vb-saffron fill-vb-saffron" />
      </ReactFlow>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-vb-navy/90 p-3 rounded-lg border border-vb-dark-gray shadow-lg z-10 text-xs">
        <h4 className="text-vb-white font-bold mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-[1.5px] border-[#ff9933] border-solid"></div>
            <span className="text-vb-gray">Dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-2 border-red-500 border-dashed"></div>
            <span className="text-vb-gray">Constraint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0 border-t-2 border-purple-500 border-dashed"></div>
            <span className="text-vb-gray">Cross-Sector</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-vb-dark-gray">
            <div className="w-4 h-4 rounded border border-red-500 bg-vb-navy-light shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
            <span className="text-vb-gray">Primary Bottleneck</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DependencyGraph;
