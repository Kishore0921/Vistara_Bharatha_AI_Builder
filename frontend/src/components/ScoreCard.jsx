import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ScoreCard = ({ scoreData }) => {
  if (!scoreData) return null;

  return (
    <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-vb-saffron/10 rounded-bl-full -mr-8 -mt-8"></div>
      
      <h3 className="text-lg font-semibold mb-6">Vistara Bharatha Model Score</h3>
      
      <div className="flex items-center justify-between mb-8">
        <div className="w-24 h-24 font-bold">
          <CircularProgressbar 
            value={scoreData.overall_score} 
            text={`${scoreData.overall_score}`}
            styles={buildStyles({
              textColor: '#fff',
              pathColor: '#ff9933',
              trailColor: '#334155',
              textSize: '24px'
            })}
          />
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-vb-white">{scoreData.overall_score}<span className="text-xl text-vb-gray font-normal">/100</span></div>
          <div className="text-sm text-vb-saffron font-medium mt-1">Overall System Health</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-vb-gray uppercase tracking-wider mb-2 border-b border-vb-dark-gray pb-2">Indicator Breakdown</h4>
        {scoreData.indicator_scores.map(ind => (
          <div key={ind.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-vb-white truncate w-48" title={ind.name}>{ind.name}</span>
              <span className="font-semibold text-vb-saffron">{ind.normalized_score.toFixed(0)}</span>
            </div>
            <div className="w-full bg-vb-dark-gray rounded-full h-1.5">
              <div className="bg-vb-saffron h-1.5 rounded-full" style={{ width: `${ind.normalized_score}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreCard;
