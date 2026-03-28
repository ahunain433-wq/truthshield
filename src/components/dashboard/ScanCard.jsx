import React from 'react';

const ScanCard = ({ title, value, icon, gradient = 'gradient-trust', trend }) => {
  // Enhanced card styling with gradients and better visual hierarchy for dark mode
  return (
    <div className="card relative overflow-hidden bg-slate-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group hover:border-slate-600/50 hover:scale-[1.02]">
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>

      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient} group-hover:h-1.5 transition-all duration-300`}></div>

      <div className="card-body relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend > 0 ? 'text-[var(--color-verified-400)]' :
                  trend < 0 ? 'text-[var(--color-suspicious-400)]' : 'text-slate-500'
                }`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>

          {/* Icon with enhanced styling */}
          <div className={`flex-shrink-0 w-12 h-12 ${gradient} rounded-lg flex items-center justify-center text-white shadow-lg`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-transparent rounded-full transform translate-x-6 -translate-y-6"></div>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;