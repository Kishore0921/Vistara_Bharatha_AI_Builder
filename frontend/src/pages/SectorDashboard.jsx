import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSector, getSectorAnalysis, simulateIntervention } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import BottleneckPanel from '../components/BottleneckPanel';
import DependencyGraph from '../components/DependencyGraph';
import InterventionForm from '../components/InterventionForm';
import SimulationResults from '../components/SimulationResults';
import DecisionHistory from '../components/DecisionHistory';
import HistoricalChart from '../components/HistoricalChart';
import { AlertCircle, GitBranch } from 'lucide-react';

const SectorDashboard = () => {
  const { sectorId } = useParams();
  const [sector, setSector] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [sectorData, analysisData] = await Promise.all([
          getSector(sectorId),
          getSectorAnalysis(sectorId)
        ]);
        setSector(sectorData);
        setAnalysis(analysisData);
        setSimulationHistory([]);
        setShowResults(false);
      } catch (error) {
        console.error("Failed to load sector data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [sectorId]);

  const handleSimulate = async (requestData) => {
    try {
      setSimulating(true);
      // If there's already a simulation, we pass the new state back for chaining.
      if (simulationHistory.length > 0) {
        requestData.current_state = simulationHistory[simulationHistory.length - 1].simulated_state;
      }
      const result = await simulateIntervention(requestData);
      setSimulationHistory([...simulationHistory, result]);
      setShowResults(true);
    } catch (error) {
      console.error("Simulation failed", error);
    } finally {
      setSimulating(false);
    }
  };

  const currentResult = simulationHistory.length > 0 ? simulationHistory[simulationHistory.length - 1] : null;

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vb-saffron"></div>
    </div>
  );
  if (!sector || !analysis) return <div className="text-center py-20 text-red-500">Failed to load sector data.</div>;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-vb-dark-gray pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-vb-white mb-2">{sector.description.split(' ')[0]} {sector.sector.toUpperCase()}</h2>
          <p className="text-vb-gray font-light max-w-3xl">{sector.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-vb-gray uppercase tracking-wider mb-1">Data Status</div>
          <div className="flex items-center text-sm font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20" title="Data is based on model simulation, not live sensors.">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            MODEL SIMULATION
          </div>
        </div>
      </div>

      {!showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Analysis & Bottlenecks */}
          <div className="lg:col-span-4 space-y-6">
            <ScoreCard scoreData={analysis.score_data} />
            <BottleneckPanel bottleneckData={analysis.bottleneck_data} />
            
            {sector.historical_data && sector.historical_data.length > 0 && (
              <HistoricalChart historicalData={sector.historical_data} />
            )}

            <DecisionHistory decisions={sector.decisions} />

            <div className="glass-panel p-6 rounded-xl border border-vb-dark-gray/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-vb-gray">
                <AlertCircle className="w-5 h-5 mr-2" /> 
                Model Transparency
              </h3>
              <p className="text-xs text-vb-gray font-light leading-relaxed mb-2">
                This platform is a model-based decision-support system. Simulations depend on data and assumptions; results are scenarios, not guarantees. 
                Values represent model indices (0-100) based on historical alignment.
              </p>
              <p className="text-xs text-vb-white font-medium bg-vb-navy/50 p-2 rounded border border-vb-dark-gray">
                Vistara Bharatha Model Score — not an official government index.
              </p>
            </div>
          </div>

          {/* Middle Column: Graph */}
          <div className="lg:col-span-8 space-y-6 flex flex-col">
            <div className="glass-panel rounded-xl flex-grow min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="p-4 border-b border-vb-dark-gray bg-vb-navy-light/50 flex justify-between items-center">
                <h3 className="font-semibold text-lg">System Dependency Graph</h3>
                <div className="text-xs text-vb-gray flex items-center">
                  <GitBranch size={14} className="mr-1" />
                  {sector.dependencies.length} Connections
                </div>
              </div>
              <div className="flex-grow relative">
                <DependencyGraph sectorId={sectorId} />
              </div>
            </div>
            
            {/* Intervention Builder */}
            <div>
              <InterventionForm 
                sector={sector} 
                bottleneck={analysis.bottleneck_data?.primary?.indicator_id} 
                onSimulate={handleSimulate}
                simulating={simulating}
              />
            </div>
          </div>

        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <SimulationResults 
            sector={sector} 
            result={currentResult} 
            onReset={() => {
              setShowResults(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setShowResults(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-vb-navy border border-vb-saffron text-vb-saffron px-6 py-3 rounded hover:bg-vb-saffron hover:text-vb-navy transition-all font-bold flex items-center"
            >
              <GitBranch className="mr-2" /> ADD ANOTHER INTERVENTION (CHAIN)
            </button>
            <button 
              onClick={() => {
                setSimulationHistory([]);
                setShowResults(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="ml-4 bg-vb-navy border border-vb-dark-gray text-vb-gray px-6 py-3 rounded hover:text-white transition-all font-bold flex items-center"
            >
              RESET TO BASELINE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorDashboard;
