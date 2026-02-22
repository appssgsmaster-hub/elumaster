
import React, { useState, useEffect } from 'react';
import { Tab, WalkRecord, DailyGoal, ActivityType } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Goals from './components/Goals';
import Premium from './components/Premium';
import InstallButton from './components/InstallButton';
import { Activity, History as HistoryIcon, Target, User, Crown } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [goal, setGoal] = useState<DailyGoal>({ steps: 10000, distance: 5 });

  useEffect(() => {
    // Detectar retorno do Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        alert("🎉 Parabéns! Sua assinatura EluMaster Pro foi ativada com sucesso. Bem-vindo ao SGS Group Premium!");
        // Limpar a URL para não repetir o alerta
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('status') === 'cancel') {
        alert("O processo de assinatura foi cancelado. Você ainda pode usar a versão gratuita!");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedRecords = localStorage.getItem('elu_records');
    if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        // Migração: Se o recorde não tiver 'type', define como WALKING
        const migrated = parsed.map((r: any) => ({
            ...r,
            type: r.type || ActivityType.WALKING
        }));
        setRecords(migrated);
    } else {
        // Fallback para quem tinha dados no nome antigo
        const oldRecords = localStorage.getItem('trilha_records');
        if (oldRecords) {
            const parsed = JSON.parse(oldRecords);
            const migrated = parsed.map((r: any) => ({
                ...r,
                type: r.type || ActivityType.WALKING
            }));
            setRecords(migrated);
            localStorage.setItem('elu_records', JSON.stringify(migrated));
        }
    }

    const savedGoal = localStorage.getItem('elu_goal');
    if (savedGoal) setGoal(JSON.parse(savedGoal));
    else {
        const oldGoal = localStorage.getItem('trilha_goal');
        if (oldGoal) setGoal(JSON.parse(oldGoal));
    }
  }, []);

  const saveRecord = (newRecord: WalkRecord) => {
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('elu_records', JSON.stringify(updated));
  };

  const updateGoal = (newGoal: DailyGoal) => {
    setGoal(newGoal);
    localStorage.setItem('elu_goal', JSON.stringify(newGoal));
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Activity size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.25em] leading-tight">SGS Group</span>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Elu<span className="text-emerald-600">Master</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <InstallButton />
          <button className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
            <User size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6">
        {activeTab === Tab.DASHBOARD && (
          <Dashboard 
            goal={goal} 
            records={records} 
            onSaveRecord={saveRecord} 
          />
        )}
        {activeTab === Tab.HISTORY && (
          <History records={records} />
        )}
        {activeTab === Tab.GOALS && (
          <Goals goal={goal} onUpdateGoal={updateGoal} />
        )}
        {activeTab === Tab.PREMIUM && (
          <Premium />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-around items-center">
        <button onClick={() => setActiveTab(Tab.DASHBOARD)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.DASHBOARD ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
          <Activity size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
        </button>
        <button onClick={() => setActiveTab(Tab.HISTORY)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.HISTORY ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
          <HistoryIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Histórico</span>
        </button>
        <button onClick={() => setActiveTab(Tab.GOALS)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.GOALS ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
          <Target size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Metas</span>
        </button>
        <button onClick={() => setActiveTab(Tab.PREMIUM)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.PREMIUM ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
          <Crown size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
