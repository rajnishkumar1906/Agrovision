import React from 'react';

const StatCard = ({ title, value, subValue, icon, color }) => (
  <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center hover:shadow-md transition-all hover:-translate-y-1">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-sm`}>
        {icon}
      </div>
      <span className="text-slate-500 text-sm font-semibold">{title}</span>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
    </div>
  </div>
);

export default StatCard;