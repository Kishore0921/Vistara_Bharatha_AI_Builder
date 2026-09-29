import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HistoricalChart = ({ historicalData }) => {
  if (!historicalData || historicalData.length === 0) return null;

  // Flatten the data for recharts
  const chartData = historicalData.map(entry => ({
    year: entry.year,
    ...entry.values
  }));

  // Extract all keys (indicators) across all years
  const indicatorKeys = new Set();
  historicalData.forEach(entry => {
    Object.keys(entry.values).forEach(key => indicatorKeys.add(key));
  });

  const colors = ['#ff9933', '#60a5fa', '#a78bfa', '#34d399', '#f472b6'];

  return (
    <div className="glass-panel rounded-xl p-6 mb-6 h-72">
      <h3 className="text-lg font-semibold mb-4 text-vb-white">Historical Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#ff9933' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          {Array.from(indicatorKeys).map((key, index) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={colors[index % colors.length]} 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
              name={key.replace('_', ' ').toUpperCase()}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;
