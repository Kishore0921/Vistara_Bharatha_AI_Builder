import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-vb-dark-gray/50 bg-vb-navy-light/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-vb-saffron flex items-center justify-center text-vb-navy font-bold">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-vb-white">VISTARA BHARATHA</h1>
              <p className="text-[10px] text-vb-saffron uppercase tracking-widest leading-none hidden md:block">
                Develop Our Bharatha Together
              </p>
            </div>
          </Link>
          <div className="flex space-x-6">
            <a href="/#sectors" className="text-sm font-medium hover:text-vb-saffron transition-colors">Sectors</a>
            <a href="/#how-it-works" className="text-sm font-medium hover:text-vb-saffron transition-colors">How It Works</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
