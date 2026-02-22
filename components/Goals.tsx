
import React, { useState } from 'react';
import { DailyGoal } from '../types';
import { Target, Footprints, MapPin, Save, Trophy } from 'lucide-react';

interface GoalsProps {
  goal: DailyGoal;
  onUpdateGoal: (goal: DailyGoal) => void;
}

const Goals: React.FC<GoalsProps> = ({ goal, onUpdateGoal }) => {
  const [steps, setSteps] = useState(goal.steps);
  const [distance, setDistance] = useState(goal.distance);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = () => {
    onUpdateGoal({ steps, distance });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <h2 className="text-2xl font-black mb-2 relative z-10">Metas Diárias</h2>
        <p className="text-emerald-100 text-sm relative z-10 opacity-90">Defina seus objetivos para manter o ritmo e a saúde em dia.</p>
        <Trophy size={140} className="absolute -bottom-10 -right-10 text-white/10" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Footprints size={20} className="text-emerald-600" />
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Passos por dia</label>
            </div>
            <span className="text-xl font-black text-emerald-600">{steps.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="1000" 
            max="30000" 
            step="500"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>1k</span>
            <span>15k</span>
            <span>30k</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Km por dia</label>
            </div>
            <span className="text-xl font-black text-blue-600">{distance} km</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            step="0.5"
            value={distance}
            onChange={(e) => setDistance(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <span>1km</span>
            <span>10km</span>
            <span>20km</span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          <Save size={20} />
          Salvar Alterações
        </button>

        {savedMsg && (
          <p className="text-center text-emerald-600 text-sm font-bold animate-bounce">
            Metas atualizadas com sucesso! 🚀
          </p>
        )}
      </div>

      <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <Target size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="text-slate-400 text-xs font-medium">Lembre-se: pequenas conquistas diárias levam a grandes resultados.</p>
      </div>
    </div>
  );
};

export default Goals;
