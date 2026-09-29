import React from 'react';
import { Clock } from 'lucide-react';

const DecisionHistory = ({ decisions }) => {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-vb-saffron" />
        Past Decisions & Interventions
      </h3>
      <div className="space-y-4">
        {decisions.map(decision => (
          <div key={decision.id} className="border-l-2 border-vb-saffron pl-4 py-2">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-vb-white">{decision.intervention}</h4>
              <span className="text-xs bg-vb-navy text-vb-gray px-2 py-1 rounded border border-vb-dark-gray">
                {decision.period}
              </span>
            </div>
            <p className="text-sm text-vb-gray mb-2 font-light">
              <strong className="text-vb-white">Objective:</strong> {decision.objective}
            </p>
            <p className="text-sm text-vb-gray font-light mb-2">
              <strong className="text-vb-white">Outcome:</strong> {decision.outcome}
            </p>
            {decision.limitations && (
              <p className="text-sm text-vb-gray font-light mb-2">
                <strong className="text-vb-white">Limitations:</strong> {decision.limitations}
              </p>
            )}
            <div className="text-xs text-vb-saffron uppercase tracking-wider font-semibold">
              Source: {decision.source_type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionHistory;
