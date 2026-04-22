import React from 'react';

const InputGroup = ({ label, val, setVal, placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label>
    <input 
      type="number" 
      step="0.01"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all text-sm font-medium" 
      placeholder={placeholder}
      required
    />
  </div>
);

export default InputGroup;