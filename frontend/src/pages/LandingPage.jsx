import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSectors } from '../services/api';
import { motion } from 'framer-motion';
import { Network, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const data = await getSectors();
        setSectors(data);
      } catch (error) {
        console.error("Failed to load sectors", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSectors();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Network className="mx-auto h-16 w-16 text-vb-saffron mb-6" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Understand interconnected systems. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vb-saffron to-vb-saffron-light">
              Discover system-wide impact.
            </span>
          </h1>
          <p className="text-xl text-vb-gray max-w-3xl mx-auto font-light leading-relaxed">
            An AI-powered cross-sector governance intelligence and scenario simulation platform.
            Identify constraints, simulate interventions, and explore how changes propagate across India's core sectors.
          </p>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vb-saffron"></div>
        </div>
      ) : (
        <motion.div 
          id="sectors"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {sectors.map((sector) => (
            <motion.div key={sector.id} variants={item}>
              <Link to={`/sector/${sector.id}`} className="block group h-full">
                <div className={`glass-panel rounded-xl p-6 h-full flex flex-col transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-vb-saffron/50 ${sector.id === 'ev' ? 'ring-2 ring-vb-saffron ring-opacity-50 relative overflow-hidden' : ''}`}>
                  {sector.id === 'ev' && (
                    <div className="absolute top-0 right-0 bg-vb-saffron text-vb-navy text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      FEATURED DEMO
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-3 text-vb-white group-hover:text-vb-saffron transition-colors">
                    {sector.name}
                  </h3>
                  <p className="text-sm text-vb-gray flex-grow font-light">
                    {sector.description}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-medium text-vb-saffron opacity-0 group-hover:opacity-100 transition-opacity">
                    Analyze Sector <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* How it Works Section */}
      <div id="how-it-works" className="mt-32 border-t border-vb-dark-gray pt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-vb-gray max-w-2xl mx-auto">Vistara Bharatha uses a deterministic simulation engine to help you explore cross-sector effects.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="w-10 h-10 bg-vb-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4 text-vb-saffron font-bold">1</div>
            <h3 className="text-sm font-bold mb-2 text-vb-white uppercase">Understand</h3>
            <p className="text-xs text-vb-gray font-light">Select a sector and analyze the current state and overall score.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="w-10 h-10 bg-vb-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4 text-vb-saffron font-bold">2</div>
            <h3 className="text-sm font-bold mb-2 text-vb-white uppercase">Find Constraint</h3>
            <p className="text-xs text-vb-gray font-light">Identify the primary bottleneck holding the system back mathematically.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="w-10 h-10 bg-vb-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4 text-vb-saffron font-bold">3</div>
            <h3 className="text-sm font-bold mb-2 text-vb-white uppercase">Intervene</h3>
            <p className="text-xs text-vb-gray font-light">Propose policy changes and interventions aimed at the core constraint.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="w-10 h-10 bg-vb-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4 text-vb-saffron font-bold">4</div>
            <h3 className="text-sm font-bold mb-2 text-vb-white uppercase">Simulate</h3>
            <p className="text-xs text-vb-gray font-light">Run the model to propagate effects through the dependency graph.</p>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="w-10 h-10 bg-vb-saffron/20 rounded-full flex items-center justify-center mx-auto mb-4 text-vb-saffron font-bold">5</div>
            <h3 className="text-sm font-bold mb-2 text-vb-white uppercase">Discover</h3>
            <p className="text-xs text-vb-gray font-light">See direct impacts, ripple effects, and how constraints evolve.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
