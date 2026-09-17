import React, { useState } from 'react';
import { 
  X, Crown, Sparkles, Check, Zap, Headphones, Moon, ShieldCheck, 
  ArrowRight, Heart, Award
} from 'lucide-react';
import { VIP_PERKS } from '../data/mockData';

export default function VIPModal({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setSubscribed(true);
    setTimeout(() => {
      alert("Félicitations ! Ton Pass VIP Diamant est activé.");
      setSubscribed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#1E1710] via-[#120F16] to-[#0A0910] border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hook */}
        <div className="text-center space-y-3 pb-6 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 fill-amber-300" />
            <span>Adhésion Club Privilège</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Dors mieux & Fais briller tes vocaux avec le <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">VIP Diamant</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Sans charabia : zéro publicité, lecture continue sans coupure pour s'endormir et visibilité maximale sur tes créations.
          </p>
        </div>

        {/* 6 Clear Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-6">
          {VIP_PERKS.map((perk, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 text-base">
                {perk.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-white">{perk.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div 
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className="text-xs font-semibold">Mensuel</div>
            <div className="text-xl font-bold text-white mt-1">4,99 €<span className="text-xs font-normal text-slate-400"> / mois</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Sans engagement, annulable en 1 clic</div>
          </div>

          <div 
            onClick={() => setSelectedPlan('annual')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
              selectedPlan === 'annual'
                ? 'bg-gradient-to-br from-amber-500/25 to-rose-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider">
              Économise 35%
            </span>
            <div className="text-xs font-semibold">Annuel (Zen)</div>
            <div className="text-xl font-bold text-white mt-1">39,99 €<span className="text-xs font-normal text-slate-400"> / an</span></div>
            <div className="text-[10px] text-amber-300 font-medium mt-1">Soit 3,33 €/mois + Badge perpétuel</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={subscribed}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{subscribed ? "Activation en cours..." : "Débloquer mes 7 jours d'essai gratuit"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Paiement 100% sécurisé
            </span>
            <span>·</span>
            <span>7 jours offerts</span>
            <span>·</span>
            <span>Sans engagement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
