import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, AlertTriangle, FileText, CheckCircle2, Network } from 'lucide-react';
import { getAIExplanation, generateReport } from '../services/api';

const SimulationResults = ({ sector, result, onReset }) => {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        setLoadingAi(true);
        const explanation = await getAIExplanation(result);
        setAiExplanation(explanation.explanation);
      } catch (error) {
        console.error("AI failed", error);
        setAiExplanation("AI analysis unavailable. " + result.explanation);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAI();
  }, [result]);

  const scoreDelta = result.simulated_score - result.baseline_score;
  const isPositive = scoreDelta >= 0;

  const handleGenerateReport = async () => {
    try {
      const data = await generateReport({ sector_id: sector.sector, simulation_results: result });
      
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vistara_Bharatha_Report_${sector.sector}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to generate report.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Header Actions */}
      <div className="flex justify-between items-center">
        <button onClick={onReset} className="text-vb-gray hover:text-vb-white flex items-center text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back to Analysis
        </button>
        <button onClick={handleGenerateReport} className="bg-vb-navy-light border border-vb-dark-gray px-4 py-2 rounded flex items-center text-sm hover:border-vb-saffron transition-colors">
          <FileText size={16} className="mr-2 text-vb-saffron" /> Generate Report
        </button>
      </div>

      {/* Main Score Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-center items-center">
          <div className="text-sm text-vb-gray uppercase tracking-wider mb-2">Baseline Score</div>
          <div className="text-5xl font-bold text-vb-white">{result.baseline_score.toFixed(1)}</div>
        </div>
        <div className="flex justify-center items-center">
          <ArrowRight className={`w-12 h-12 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
          <div className="ml-4 text-center">
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{scoreDelta.toFixed(1)}
            </div>
            <div className="text-xs text-vb-gray">Net Impact</div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-vb-saffron/50 flex flex-col justify-center items-center shadow-[0_0_20px_rgba(255,153,51,0.1)]">
          <div className="text-sm text-vb-saffron uppercase tracking-wider mb-2">Simulated Score</div>
          <div className="text-5xl font-bold text-vb-saffron">{result.simulated_score.toFixed(1)}</div>
        </div>
      </div>

      {/* Changes and Effects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Indicator Changes Table */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Indicator Changes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-vb-gray uppercase bg-vb-navy/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Indicator</th>
                  <th className="px-4 py-3">Before</th>
                  <th className="px-4 py-3">After</th>
                  <th className="px-4 py-3 rounded-tr-lg">Delta</th>
                </tr>
              </thead>
              <tbody>
                {result.changed_indicators.map((ind, i) => (
                  <tr key={ind.id} className="border-b border-vb-dark-gray/30 last:border-0">
                    <td className="px-4 py-3 font-medium text-vb-white">{ind.name}</td>
                    <td className="px-4 py-3 text-vb-gray">{ind.before.toFixed(1)}</td>
                    <td className="px-4 py-3 text-vb-white">{ind.after.toFixed(1)}</td>
                    <td className={`px-4 py-3 font-bold ${ind.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {ind.delta > 0 ? '+' : ''}{ind.delta.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Effect Propagation Log */}
        <div className="glass-panel rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Propagation Trace</h3>
          <div className="flex-grow space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            
            {result.intervention_effect && (
              <div className="bg-vb-navy/50 p-3 rounded border-l-2 border-green-400 flex items-start">
                <CheckCircle2 size={16} className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm font-light"><strong className="text-vb-white font-medium">Intervention:</strong> {result.intervention_effect}</span>
              </div>
            )}

            {result.first_order_effects && result.first_order_effects.map((effect, i) => (
              <div key={`d-${i}`} className="bg-vb-navy/50 p-3 rounded border-l-2 border-vb-saffron flex items-start">
                <CheckCircle2 size={16} className="text-vb-saffron mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm font-light"><strong className="text-vb-white font-medium">Direct Effect:</strong> {effect}</span>
              </div>
            ))}

            {result.second_order_effects && result.second_order_effects.map((effect, i) => (
              <div key={`s-${i}`} className="bg-vb-navy/50 p-3 rounded border-l-2 border-blue-400 flex items-start">
                <TrendingUp size={16} className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm font-light"><strong className="text-vb-white font-medium">2nd Order:</strong> {effect}</span>
              </div>
            ))}

            {result.ripple_effects && result.ripple_effects.map((effect, i) => (
              <div key={`r-${i}`} className="bg-vb-navy/50 p-3 rounded border-l-2 border-purple-400 flex items-start">
                <Network size={16} className="text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm font-light"><strong className="text-vb-white font-medium">Ripple:</strong> {effect}</span>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* Constraints and AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Constraint Evolution */}
        <div className="glass-panel rounded-xl p-6 border border-red-500/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-red-400">
            <AlertTriangle size={18} className="mr-2" /> Constraint Evolution
          </h3>
          <div className="bg-red-500/10 rounded-lg p-4 mb-4">
            {result.emerging_bottleneck ? (
              <>
                <div className="text-sm text-red-400 font-medium mb-1">NEW EMERGING CONSTRAINT</div>
                <div className="text-xl font-bold text-vb-white">{result.emerging_bottleneck}</div>
                <div className="text-xs text-red-300 mt-2 border-t border-red-500/30 pt-2">
                  {result.remaining_constraints[0]}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-red-400 font-medium mb-1">REMAINING CONSTRAINT</div>
                <div className="text-xl font-bold text-vb-white">
                  {result.remaining_constraints[0]?.split(' (')[0] || "Unknown"}
                </div>
                <div className="text-xs text-red-300 mt-2 border-t border-red-500/30 pt-2">
                  {result.remaining_constraints[0]}
                </div>
              </>
            )}
          </div>
          
          <h4 className="text-sm font-medium text-vb-gray uppercase tracking-wider mb-2">Unintended Effects</h4>
          <ul className="list-disc pl-4 space-y-1 text-sm font-light text-vb-gray">
            {result.unintended_effects.map((ue, i) => <li key={i}>{ue}</li>)}
          </ul>
        </div>

        {/* AI Analysis */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 bg-gradient-to-br from-vb-navy-light to-[#1e293b]/50">
          <h3 className="text-lg font-semibold mb-4 text-vb-saffron flex items-center">
            AI Explanation
          </h3>
          {loadingAi ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-vb-dark-gray rounded w-3/4"></div>
              <div className="h-4 bg-vb-dark-gray rounded w-full"></div>
              <div className="h-4 bg-vb-dark-gray rounded w-5/6"></div>
            </div>
          ) : (
            <>
              <p className="text-sm font-light leading-relaxed text-vb-white">
                {aiExplanation}
              </p>
              {result.better_idea && (
                <div className="mt-4 bg-vb-navy/40 p-4 rounded-lg border-l-4 border-vb-saffron">
                  <h4 className="text-sm font-semibold text-vb-saffron mb-2">💡 Better Idea</h4>
                  <p className="text-sm font-light text-vb-white">{result.better_idea}</p>
                </div>
              )}
            </>
          )}
          
          <div className="mt-6 pt-4 border-t border-vb-dark-gray/50 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-vb-navy rounded border border-vb-dark-gray text-vb-gray">Confidence: {result.confidence}</span>
            <span className="px-2 py-1 bg-vb-navy rounded border border-vb-dark-gray text-vb-gray">Assumptions: {result.assumptions.length} applied</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SimulationResults;
