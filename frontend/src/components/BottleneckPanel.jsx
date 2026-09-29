import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const BottleneckPanel = ({ bottleneckData }) => {
  if (!bottleneckData || !bottleneckData.primary) return null;

  const { primary, explanation } = bottleneckData;

  return (
    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-red-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <AlertTriangle size={64} className="text-red-500" />
      </div>
      
      <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
        <TrendingDown size={18} />
        <h3 className="uppercase tracking-wider text-xs">Primary System Bottleneck</h3>
      </div>
      
      <div className="text-2xl font-bold text-vb-white mb-2">{primary.name}</div>
      <p className="text-sm text-vb-gray font-light leading-relaxed mb-4">
        {explanation}
      </p>

      <div className="bg-vb-navy rounded-lg p-4 border border-vb-dark-gray/50 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-vb-dark-gray/50">
          <div className="text-xs text-vb-gray">Severity Score</div>
          <div className="text-sm font-bold text-red-400">{primary.severity?.toFixed(1) || 'N/A'}</div>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-vb-dark-gray/50">
          <div className="text-xs text-vb-gray">Current Score (0-100)</div>
          <div className="text-sm font-bold text-vb-white">{primary.normalized_score?.toFixed(1) || 'N/A'}</div>
        </div>
        <div className="flex justify-between items-start">
          <div className="text-xs text-vb-gray mt-1">Downstream Influence</div>
          <div className="flex flex-col items-end w-2/3 text-right">
            <div className="text-sm font-medium text-vb-white">
              {primary.downstream_influence || 0} Nodes
            </div>
            {primary.affected_nodes?.length > 0 && (
              <div className="text-xs text-vb-gray/80 mt-1 leading-tight">
                Affects: {primary.affected_nodes.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottleneckPanel;
