import React, { useState } from 'react';
import { 
  User, Award, Crown, Sparkles, Headphones, Clock, Mic, 
  Settings, Heart, Bookmark, Flame, Volume2, Shield, Edit3, ArrowRight
} from 'lucide-react';

export default function ProfileView({ 
  openVipModal, 
  onUiClick, 
  soundEffectsEnabled, 
  toggleSoundEffects,
  onOpenStudio 
}) {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-teal-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Animated VIP Glow Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-xl shadow-amber-500/20">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover rounded-[22px]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Crown className="w-3 h-3 fill-slate-950" /> VIP
            </div>
          </div>

          {/* User Bio & Meta */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                    Luna ASMR
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold">
                    Créatrice Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400">@luna_asmr · Membre depuis Août 2026</p>
              </div>

              <button
                onClick={() => { onUiClick?.('tingle'); openVipModal(); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all self-center sm:self-auto"
              >
                Gérer mon abonnement VIP
              </button>
            </div>

            <p className="text-xs text-slate-300 max-w-xl">
              Passionnée de sons binauraux doux, brossage de micros et chuchotements immersifs. Objectif : t'aider à t'endormir sereinement 🌙✨
            </p>

            {/* XP Level Progress */}
            <div className="pt-2 space-y-1.5 max-w-md">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-teal-300">Niveau 12 — Maître des Ondes</span>
                <span className="text-slate-400">4 850 / 5 000 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Quick Stats Counter */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-lg sm:text-2xl font-bold text-teal-300 font-mono">42h</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Écoute relaxante</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-lg sm:text-2xl font-bold text-rose-300 font-mono">1 240</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Frissons déclenchés</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-lg sm:text-2xl font-bold text-amber-300 font-mono">18</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Vocaux partagés</div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => { onUiClick?.('tap'); setActiveTab('badges'); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'badges'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Badges & Succès</span>
        </button>

        <button
          onClick={() => { onUiClick?.('tap'); setActiveTab('my-sounds'); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'my-sounds'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-rose-400" />
          <span>Mes Créations</span>
        </button>

        <button
          onClick={() => { onUiClick?.('tap'); setActiveTab('settings'); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-cyan-400" />
          <span>Paramètres Audio</span>
        </button>
      </div>

      {/* Tab Content: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#131826] border border-amber-500/40 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
              💎
            </div>
            <h4 className="font-bold text-xs text-white">VIP Diamant Actif</h4>
            <p className="text-[11px] text-slate-400">Qualité sonore HD débloquée et bordure dorée animée.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131826] border border-teal-500/30 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-xl">
              🚀
            </div>
            <h4 className="font-bold text-xs text-white">Pionnier Bêta</h4>
            <p className="text-[11px] text-slate-400">Parmi les 1 000 premiers membres fondateurs de la plateforme.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131826] border border-indigo-500/30 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center mx-auto text-xl">
              🎧
            </div>
            <h4 className="font-bold text-xs text-white">Audiophile 3D</h4>
            <p className="text-[11px] text-slate-400">+20 heures d'écoute en spatialisation binaurale.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131826] border border-rose-500/30 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center mx-auto text-xl">
              🪄
            </div>
            <h4 className="font-bold text-xs text-white">Créateur Célébré</h4>
            <p className="text-[11px] text-slate-400">+1 000 mentions « Frissons » reçues de la part des auditeurs.</p>
          </div>
        </div>
      )}

      {/* Tab Content: My Sounds */}
      {activeTab === 'my-sounds' && (
        <div className="p-8 rounded-3xl bg-[#0E121D] border border-white/5 text-center space-y-4">
          <Mic className="w-10 h-10 text-teal-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Envie de partager un nouveau trigger ?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Utilise notre studio d'enregistrement intégré avec filtre anti-souffle pour enregistrer des chuchotements ou des bruits de tapping.
          </p>
          <button
            onClick={() => { onUiClick?.('tingle'); onOpenStudio(); }}
            className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all"
          >
            Ouvrir le Studio d'Enregistrement
          </button>
        </div>
      )}

      {/* Tab Content: Audio Settings */}
      {activeTab === 'settings' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white">Préférences de confort sonore</h3>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div>
              <span className="font-bold text-white">Micro-sons haptiques de l'interface</span>
              <p className="text-[11px] text-slate-400">Petits clics doux et bulles sonores lors des interactions</p>
            </div>
            <button
              onClick={() => { onUiClick?.('click'); toggleSoundEffects(); }}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEffectsEnabled ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                soundEffectsEnabled ? 'right-1' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div>
              <span className="font-bold text-white">Spatialisation Binaurale HRTF</span>
              <p className="text-[11px] text-slate-400">Traitement audio 3D stéréo pour casque</p>
            </div>
            <span className="text-teal-400 font-semibold">Activé (Haute fidélité)</span>
          </div>
        </div>
      )}
    </div>
  );
}
