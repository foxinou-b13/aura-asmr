import React from 'react';
import { Play, Pause, Sparkles, Sliders, Mic, Headphones, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const INSTANT_SOUNDS = [
  { id: 'rain', label: 'Pluie d’été', emoji: '🌧️', sub: 'Apaisement instantané', bg: 'from-blue-600/20 to-teal-500/20', border: 'border-blue-500/30' },
  { id: 'tapping', label: 'Tapping 3D', emoji: '🪵', sub: 'Frissons binauraux', bg: 'from-amber-600/20 to-orange-500/20', border: 'border-amber-500/30' },
  { id: 'whisper', label: 'Chuchotements', emoji: '👄', sub: 'Voix douces & brume', bg: 'from-pink-600/20 to-purple-500/20', border: 'border-pink-500/30' },
  { id: 'bowl', label: 'Bol Tibétain', emoji: '🥣', sub: 'Ondes 432 Hz anti-stress', bg: 'from-emerald-600/20 to-teal-500/20', border: 'border-emerald-500/30' },
  { id: 'fire', label: 'Feu de Bois', emoji: '🔥', sub: 'Crépitements chaleureux', bg: 'from-rose-600/20 to-amber-500/20', border: 'border-rose-500/30' }
];

export default function HeroQuickPlay({ 
  activeTrigger, 
  onToggleTrigger, 
  onOpenMixer, 
  onOpenStudio
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111420] via-[#0D101A] to-[#080A10] p-6 sm:p-8 shadow-2xl mb-8">
      
      {/* Subtle background ambient glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: 5-Second Comprehension Hook */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5 fill-teal-300" />
            <span>100% Sons Réels & Communauté Humaine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
            Écoute. Relax. <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Frissonne.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pas d'inscription forcée, pas de pub qui hurle. Clique sur une ambiance ci-dessous pour tester l'immersion sonore en direct dans ton casque, ou enregistre ta propre voix.
          </p>

          {/* 3 Quick Value Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> 100% Humain & Réel
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Headphones className="w-4 h-4 text-cyan-400" /> Audio Spatial 3D
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" /> Micro Studio Intégré
            </span>
          </div>
        </div>

        {/* Right CTA Group */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenMixer}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Mixeur d'Ambiance 3D</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onOpenStudio}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs transition-all"
          >
            <Mic className="w-4 h-4 text-rose-400" />
            <span>Enregistrer un Vrai Vocal</span>
          </button>
        </div>
      </div>

      {/* 5 Instant Launchpads */}
      <div className="relative z-10 pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-teal-400" /> Ambiances sonores immédiates :
          </span>
          {activeTrigger && (
            <span className="text-xs font-medium text-teal-300 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-teal-400" /> Ambiance en cours de lecture
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {INSTANT_SOUNDS.map((sound) => {
            const isPlaying = activeTrigger === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => onToggleTrigger(sound.id)}
                className={`relative group p-3.5 rounded-2xl border text-left transition-all duration-200 overflow-hidden ${
                  isPlaying 
                    ? `bg-gradient-to-br ${sound.bg} ${sound.border} shadow-lg shadow-teal-500/20 scale-[1.02]` 
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl transform group-hover:scale-110 transition-transform">
                    {sound.emoji}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isPlaying ? 'bg-teal-400 text-slate-950 font-bold' : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                  }`}>
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </div>
                </div>

                <div className="font-bold text-xs sm:text-sm text-white truncate">
                  {sound.label}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {sound.sub}
                </div>

                {isPlaying && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
