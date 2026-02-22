
import React from 'react';
import { WalkRecord, ActivityType } from '../types';
import { formatTime, calculatePace } from '../utils/geoUtils';
import { Calendar, ChevronRight, MapPin, Footprints, Clock, Zap } from 'lucide-react';

interface HistoryProps {
  records: WalkRecord[];
}

const History: React.FC<HistoryProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Calendar size={40} />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Ainda não há registros</h3>
        <p className="text-slate-400 max-w-xs mx-auto text-sm mt-1">
          Suas atividades do SGS Group aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Suas Atividades</h2>
      {records.map((record) => (
        <div 
            key={record.id} 
            className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === ActivityType.RUNNING ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {record.type === ActivityType.RUNNING ? <Zap size={20} /> : <Footprints size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {record.type === ActivityType.RUNNING ? 'Corrida' : 'Caminhada'}
                    <span className="text-[10px] text-slate-300">•</span>
                    {new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                    {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center">
              <MapPin size={16} className="text-slate-400 mb-1" />
              <span className="text-sm font-bold text-slate-800">{record.distanceKm.toFixed(2)} km</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center">
              {record.type === ActivityType.RUNNING ? <Zap size={16} className="text-slate-400 mb-1" /> : <Clock size={16} className="text-slate-400 mb-1" />}
              <span className="text-sm font-bold text-slate-800">
                {record.type === ActivityType.RUNNING ? calculatePace(record.durationSeconds, record.distanceKm) : record.avgSpeed.toFixed(1) + ' km/h'}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                 {record.type === ActivityType.RUNNING ? 'Ritmo' : 'Velocidade'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl flex flex-col items-center">
              <Clock size={16} className="text-slate-400 mb-1" />
              <span className="text-sm font-bold text-slate-800">{formatTime(record.durationSeconds)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;
