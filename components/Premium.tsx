
import React, { useState } from 'react';
import { Crown, Check, Zap, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';

const Premium: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const benefits = [
    "Mentor IA com respostas ilimitadas",
    "Rastreamento GPS de alta precisão",
    "Relatórios semanais de saúde",
    "Sem anúncios ou interrupções",
    "Suporte prioritário SGS Group"
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }
    } catch (error: any) {
      console.error("Erro ao assinar:", error);
      alert("Erro ao processar assinatura: " + error.message + "\n\nCertifique-se de que a STRIPE_SECRET_KEY foi configurada nas variáveis de ambiente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <Crown size={12} />
                SGS Premium
            </div>
            <h2 className="text-3xl font-black mb-2">EluMaster Pro</h2>
            <p className="text-slate-400 text-sm max-w-[200px]">Desbloqueie o poder total da sua saúde com o SGS Group.</p>
        </div>
        <Crown size={180} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
            <Zap size={18} className="text-emerald-600" />
            Benefícios Exclusivos
        </h3>
        
        <ul className="space-y-4 mb-8">
            {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{b}</span>
                </li>
            ))}
        </ul>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Plano Mensal</p>
            <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm font-bold text-slate-800">R$</span>
                <span className="text-4xl font-black text-slate-900">29,90</span>
                <span className="text-sm font-bold text-slate-400">/mês</span>
            </div>
        </div>

        <button 
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-100 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
        >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
            {loading ? 'Processando...' : 'Assinar Agora'}
            {!loading && <ArrowRight size={18} />}
        </button>

        <div className="mt-6 flex items-center justify-center gap-4 opacity-50">
            <div className="flex items-center gap-1">
                <ShieldCheck size={14} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Pagamento Seguro</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Cancelamento Fácil</span>
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
        <p className="text-emerald-800 text-xs font-medium leading-relaxed">
            <strong>Nota do SGS Group:</strong> A mensalidade nos ajuda a manter os servidores de IA e a precisão do rastreamento GPS sempre atualizados para sua melhor performance.
        </p>
      </div>
    </div>
  );
};

export default Premium;
