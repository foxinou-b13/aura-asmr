import React, { useState } from 'react';
import { 
  User, Award, Crown, Sparkles, Headphones, Clock, Mic, 
  Settings, Heart, Bookmark, Flame, Volume2, Shield, Edit3, ArrowRight
} from 'lucide-react';

export default function ProfileView({ 
  openVipModal, 
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
          
          {/* Avatar */}
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
                    Mon Espace Créateur
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold">
                    Membre Réel
                  </span>
                </div>
                <p className="text-xs text-slate-400">Enregistre des vocaux avec ton vrai micro et partage-les avec la communauté.</p>
              </div>

              <button
                onClick={openVipModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all self-center sm:self-auto"
              >
                Passer VIP Diamant
              </button>
            </div>

            <p className="text-xs text-slate-300 max-w-xl">
              Ici, chaque enregistrement provient d'un vrai microphone humain : chuchotements doux, tapping sur objets et relaxation naturelle.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('my-sounds')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'my-sounds'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-rose-400" />
          <span>Enregistrer un Vocal</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'badges'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Badges & Prestige</span>
        </button>
      </div>

      {/* Tab Content: My Sounds */}
      {activeTab === 'my-sounds' && (
        <div className="p-8 rounded-3xl bg-[#0E121D] border border-white/5 text-center space-y-4">
          <Mic className="w-10 h-10 text-teal-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Partage un vrai son avec la communauté</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Utilise ton micro pour enregistrer des chuchotements, du tapping sur bois ou importer un fichier audio.
          </p>
          <button
            onClick={onOpenStudio}
            className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all"
          >
            Ouvrir le Studio d'Enregistrement
          </button>
        </div>
      )}

      {/* Tab Content: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#131826] border border-amber-500/40 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center mx-auto text-xl shadow-lg shadow-amber-500/20">
              💎
            </div>
            <h4 className="font-bold text-xs text-white">VIP Diamant</h4>
            <p className="text-[11px] text-slate-400">Écoute continue pour la nuit et mise en avant des vocaux.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131826] border border-teal-500/30 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-xl">
              🎙️
            </div>
            <h4 className="font-bold text-xs text-white">Créateur Vocal</h4>
            <p className="text-[11px] text-slate-400">Publie des enregistrements authentiques avec ton vrai micro.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#131826] border border-indigo-500/30 space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center mx-auto text-xl">
              🎧
            </div>
            <h4 className="font-bold text-xs text-white">Audio 3D</h4>
            <p className="text-[11px] text-slate-400">Spatialisation stéréo binaurale gauche/droite.</p>
          </div>
        </div>
      )}
    </div>
  );
}
