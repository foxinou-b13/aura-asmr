import React from 'react';
import { Mic, FileAudio, CheckCircle2, Headphones, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HeroQuickPlay({ 
  onOpenStudio
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111420] via-[#0D101A] to-[#080A10] p-6 sm:p-8 shadow-2xl mb-8">
      
      {/* Subtle background ambient glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Hook */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Humain · Zéro IA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
            Le réseau social des <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">vrais vocaux ASMR.</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Écoute et partage d'authentiques enregistrements audio créés par des humains. Enregistre ta voix avec ton micro ou importe un fichier sonore pour enrichir la communauté.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Vrais enregistrements micro
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Headphones className="w-4 h-4 text-cyan-400" /> Écoute libre et gratuite
            </span>
          </div>
        </div>

        {/* Right CTA Group */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenStudio}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all transform active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Enregistrer un Vocal au Micro</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
