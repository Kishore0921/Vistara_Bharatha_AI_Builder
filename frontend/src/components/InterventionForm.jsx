import React, { useState } from 'react';
import { Play } from 'lucide-react';

const InterventionForm = ({ sector, bottleneck, onSimulate, simulating }) => {
  const [target, setTarget] = useState(bottleneck || (sector?.indicators?.[0]?.id || ''));
  const [selectedInterventionIdx, setSelectedInterventionIdx] = useState(0);
  const [budget, setBudget] = useState('');

  // Reset selected intervention when target changes
  React.useEffect(() => {
    setSelectedInterventionIdx(0);
  }, [target]);

  const availableInterventions = sector?.interventions?.filter(i => i.target_indicator === target) || [];
  
  const defaultIntervention = {
    name: `Strategic investment in ${sector?.indicators?.find(i => i.id === target)?.name || 'Indicator'}`,
    description: `Implement policy measures and allocate resources to enhance capacity and efficiency.`,
    time_horizon_years: 5
  };

  const options = availableInterventions.length > 0 ? availableInterventions : [defaultIntervention];
  const activeIntervention = options[selectedInterventionIdx] || options[0];
  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      sector: sector.sector,
      target,
      intervention: activeIntervention.name,
      method: activeIntervention.description,
      budget: budget ? parseFloat(budget) : null,
      time_horizon: activeIntervention.time_horizon_years || 5
    });
  };

  return (
    <div className="glass-panel rounded-xl p-6 relative">
      <h3 className="text-xl font-bold mb-6">Propose an Intervention</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div>
          <label className="block text-xs uppercase tracking-wider text-vb-gray mb-2">Target Indicator</label>
          <select 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-vb-navy border border-vb-dark-gray rounded-md py-2 px-3 text-sm focus:outline-none focus:border-vb-saffron focus:ring-1 focus:ring-vb-saffron"
            required
          >
            {sector?.indicators?.map(ind => (
              <option key={ind.id} value={ind.id}>{ind.name} {ind.id === bottleneck ? '(Bottleneck)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-vb-gray mb-2">Intervention Name</label>
          <select 
            value={selectedInterventionIdx}
            onChange={(e) => setSelectedInterventionIdx(parseInt(e.target.value, 10))}
            className="w-full bg-vb-navy border border-vb-dark-gray rounded-md py-2 px-3 text-sm focus:outline-none focus:border-vb-saffron focus:ring-1 focus:ring-vb-saffron"
            required
          >
            {options.map((opt, idx) => (
              <option key={idx} value={idx}>{opt.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-vb-gray mb-2">How will it be achieved?</label>
          <div className="w-full bg-vb-navy-light/50 border border-vb-dark-gray rounded-md py-2 px-3 text-sm text-vb-gray min-h-[38px] flex items-center">
            {activeIntervention?.description}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-vb-gray mb-2">Time Horizon (Years)</label>
          <div className="w-full bg-vb-navy-light/50 border border-vb-dark-gray rounded-md py-2 px-3 text-sm text-vb-gray min-h-[38px] flex items-center">
            {activeIntervention?.time_horizon_years || 5} Years
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-vb-gray mb-2">Estimated Budget (Optional)</label>
          <input 
            type="number" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-vb-navy border border-vb-dark-gray rounded-md py-2 px-3 text-sm focus:outline-none focus:border-vb-saffron"
            placeholder="Crores"
          />
        </div>

        <div className="flex items-end">
          <button 
            type="submit" 
            disabled={simulating}
            className={`w-full py-2 px-4 rounded-md font-bold flex items-center justify-center gap-2 transition-all ${
              simulating 
              ? 'bg-vb-dark-gray text-vb-gray cursor-not-allowed' 
              : 'bg-vb-saffron text-vb-navy hover:bg-vb-saffron-light hover:shadow-[0_0_15px_rgba(255,153,51,0.5)]'
            }`}
          >
            {simulating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-vb-navy animate-spin"></div>
                Simulating...
              </span>
            ) : (
              <>
                <Play size={18} />
                SIMULATE INTERVENTION
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default InterventionForm;
