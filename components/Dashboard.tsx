
import React, { useState, useEffect, useRef } from 'react';
import { DailyGoal, WalkRecord, GeolocationState, ActivityType } from '../types';
import { calculateDistance, formatTime, calculatePace } from '../utils/geoUtils';
import { Play, Square, Pause, Flame, MapPin, Footprints, Clock, Zap, Share2, Activity, ShieldCheck, Sparkles } from 'lucide-react';
import { getAIInsight } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  goal: DailyGoal;
  records: WalkRecord[];
  onSaveRecord: (record: WalkRecord) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ goal, records, onSaveRecord }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [lastPos, setLastPos] = useState<GeolocationState | null>(null);
  const [mentorMsg, setMentorMsg] = useState<string>("Iniciando o sistema SGS Mentor...");
  const [selectedType, setSelectedType] = useState<ActivityType>(ActivityType.WALKING);
  const [isLoadingMentor, setIsLoadingMentor] = useState(true);

  const timerRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Carrega insight inicial (Pré-Atividade ou Inatividade)
  useEffect(() => {
    const loadInitialInsight = async () => {
      setIsLoadingMentor(true);
      const lastRecordDate = records.length > 0 ? new Date(records[0].date) : null;
      const isInactive = lastRecordDate ? (Date.now() - lastRecordDate.getTime() > 1000 * 60 * 60 * 48) : false;
      
      const context = isInactive ? 'inactivity' : 'pre_activity';
      const msg = await getAIInsight(context, { type: selectedType });
      setMentorMsg(msg);
      setIsLoadingMentor(false);
    };
    loadInitialInsight();
  }, [selectedType]); // Recarrega se o tipo mudar para dar dica específica

  const todaySteps = records
    .filter(r => new Date(r.date).toDateString() === new Date().toDateString())
    .reduce((acc, curr) => acc + curr.steps, 0) + steps;

  const chartData = [
    { name: 'Progress', value: todaySteps },
    { name: 'Remaining', value: Math.max(0, goal.steps - todaySteps) }
  ];

  const COLORS = ['#059669', '#e2e8f0'];

  const startTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    timerRef.current = window.setInterval(() => setTime(prev => prev + 1), 1000);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (lastPos) {
            const d = calculateDistance(lastPos.lat, lastPos.lng, latitude, longitude);
            if (d > 0.002) setDistance(prev => prev + d);
          }
          setLastPos({ lat: latitude, lng: longitude });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }

    if (typeof DeviceMotionEvent !== 'undefined') {
        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (acc && !isPaused) {
                const magnitude = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
                if (magnitude > 12) setSteps(prev => prev + 1);
            }
        };
        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }
  };

  const stopTracking = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    
    const finalRecord: WalkRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      distanceKm: distance,
      steps: steps,
      durationSeconds: time,
      avgSpeed: avgSpeed,
      type: selectedType
    };

    onSaveRecord(finalRecord);
    
    setIsLoadingMentor(true);
    const msg = await getAIInsight('post_activity', { 
      steps, 
      distance, 
      time: formatTime(time),
      type: selectedType 
    });
    setMentorMsg(msg);
    setIsLoadingMentor(false);

    setIsTracking(false);
    setIsPaused(false);
    setSteps(0);
    setDistance(0);
    setTime(0);
    setAvgSpeed(0);
    setLastPos(null);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
        if (timerRef.current) clearInterval(timerRef.current);
    } else {
        timerRef.current = window.setInterval(() => setTime(prev => prev + 1), 1000);
    }
  };

  useEffect(() => {
    if (time > 0) setAvgSpeed((distance / (time / 3600)));
  }, [distance, time]);

  const shareStats = () => {
    const text = `SGS Motion Insight: "${mentorMsg.split('SGS Group')[0].trim()}" - Medido por EluMaster by SGS Group.`;
    if (navigator.share) {
      navigator.share({ title: 'SGS Motion Progress', text, url: window.location.href });
    } else {
      alert("Copiado para o SGS Group: " + text);
    }
  };

  const calorieFactor = selectedType === ActivityType.RUNNING ? 0.07 : 0.04;

  return (
    <div className="space-y-6">
      {/* Mentor SGS Insight Card */}
      <section className="relative overflow-hidden bg-white border border-emerald-100 rounded-3xl p-5 shadow-lg shadow-emerald-50">
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg">
                <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">SGS Mentor Insight</span>
        </div>
        <div className={`transition-opacity duration-500 ${isLoadingMentor ? 'opacity-50' : 'opacity-100'}`}>
            <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                "{mentorMsg.replace("SGS Group — Longevidade & Propósito", "").trim()}"
            </p>
            <p className="mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-right">
                SGS Group — Longevidade & Propósito
            </p>
        </div>
        {isLoadingMentor && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}
      </section>

      {/* Progresso Diário */}
      <section className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center">
        <div className="w-full flex justify-between items-start mb-2">
            <div>
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">SGS Health Target</h3>
                <p className="text-2xl font-bold text-slate-800">{todaySteps.toLocaleString()} <span className="text-slate-400 font-medium text-base">passos</span></p>
            </div>
            <button onClick={shareStats} className="p-2 text-emerald-600 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-all">
                <Share2 size={20} />
            </button>
        </div>

        <div className="relative w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" startAngle={90} endAngle={-270}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-4xl font-extrabold text-slate-800 leading-none">{Math.min(100, Math.round((todaySteps / goal.steps) * 100))}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Concluído</span>
          </div>
        </div>
      </section>

      {/* Seletor de Atividade */}
      {!isTracking && (
        <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2">
          <button 
            onClick={() => setSelectedType(ActivityType.WALKING)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${selectedType === ActivityType.WALKING ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Footprints size={18} />
            Caminhar
          </button>
          <button 
            onClick={() => setSelectedType(ActivityType.RUNNING)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${selectedType === ActivityType.RUNNING ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Zap size={18} />
            Correr
          </button>
        </div>
      )}

      {/* Painel Real-time */}
      {isTracking && (
        <section className={`rounded-3xl p-6 shadow-2xl text-white animate-in slide-in-from-bottom-4 transition-colors duration-500 ${selectedType === ActivityType.RUNNING ? 'bg-slate-800' : 'bg-emerald-900'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
               {selectedType === ActivityType.WALKING ? <Footprints size={14} /> : <Zap size={14} />}
               <span className="text-[10px] font-black uppercase tracking-widest">{selectedType === ActivityType.WALKING ? 'Caminhada' : 'Corrida'}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
               <ShieldCheck size={14} />
               <span className="text-[8px] font-bold tracking-widest uppercase italic">Propósito em Movimento</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cronômetro</span>
              <span className="text-4xl font-mono font-bold">{formatTime(time)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Distância</span>
              <span className="text-4xl font-mono font-bold">{distance.toFixed(2)}<span className="text-lg ml-1">km</span></span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SGS Steps</span>
                <span className="text-3xl font-mono font-bold">{steps}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {selectedType === ActivityType.RUNNING ? 'Ritmo' : 'Velocidade'}
                </span>
                <span className="text-3xl font-mono font-bold">
                    {selectedType === ActivityType.RUNNING ? calculatePace(time, distance) : avgSpeed.toFixed(1) + ' km/h'}
                </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={togglePause} className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold border border-white/10 transition-colors">
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
            <button onClick={stopTracking} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl font-bold transition-colors">
              <Square size={20} />
              Finalizar
            </button>
          </div>
        </section>
      )}

      {!isTracking && (
        <button 
          onClick={startTracking}
          className={`w-full group relative overflow-hidden p-8 rounded-3xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] ${selectedType === ActivityType.RUNNING ? 'bg-orange-500' : 'bg-emerald-600'}`}
        >
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/30 group-hover:bg-white/30 transition-all">
                <Play size={32} className="fill-current" />
            </div>
            <span className="text-xl font-black text-white uppercase tracking-tight">
                Iniciar Sessão SGS
            </span>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
            <Activity size={120} />
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <Flame size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Energia</p>
                <p className="text-lg font-bold text-slate-800">{Math.round(todaySteps * calorieFactor)} <span className="text-[10px] font-normal">kcal</span></p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">Histórico Total</p>
                <p className="text-lg font-bold text-slate-800">{records.reduce((a,b) => a + b.distanceKm, 0).toFixed(1)} <span className="text-[10px] font-normal">km</span></p>
            </div>
        </div>
      </div>

      <footer className="pt-4 pb-2 flex flex-col items-center gap-1 opacity-40">
        <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-600" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Powered by SGS Group</span>
        </div>
        <p className="text-[8px] font-bold text-slate-500 italic tracking-widest">SGS Group — Longevidade & Propósito</p>
      </footer>
    </div>
  );
};

export default Dashboard;
