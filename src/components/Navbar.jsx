import React from 'react';
import { 
  Volume2, VolumeX, Sparkles, Moon, Radio, Mic, User
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  isMuted, 
  toggleMute, 
  openVipModal, 
  openSleepModal, 
  sleepRemaining,
  isRecordingActive
}) {
  const formatSleepTime = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090A10]/80 backdrop-blur-xl transition-all">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentTab('feed')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-[#0B0E17] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent font-heading">
                  AURA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-semibold tracking-wide">
                  VOCAUX RÉELS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 font-medium hidden sm:block">
                Le réseau social ASMR 100% humain
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setCurrentTab('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'feed'
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4" />
              Fil des Vocaux
            </button>

            <button
              onClick={() => setCurrentTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'studio'
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Mic className="w-4 h-4 text-rose-400" />
                {isRecordingActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              Studio d'enregistrement
            </button>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'profile'
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              Mon Espace
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Sleep Timer button */}
            <button
              onClick={openSleepModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                sleepRemaining 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title="Minuteur de sommeil"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {sleepRemaining ? formatSleepTime(sleepRemaining) : 'Sommeil'}
              </span>
            </button>

            {/* Master Audio Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl text-xs border transition-all ${
                isMuted 
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 text-teal-400'
              }`}
              title={isMuted ? "Son coupé" : "Son actif"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* VIP Diamond Upgrade CTA */}
            <button
              onClick={openVipModal}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Passer VIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md md:hidden">
        <div className="glass-panel rounded-2xl p-1.5 shadow-2xl border border-white/15 flex items-center justify-between">
          <button
            onClick={() => setCurrentTab('feed')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
              currentTab === 'feed' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                : 'text-slate-400'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Fil</span>
          </button>

          <button
            onClick={() => setCurrentTab('studio')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
              currentTab === 'studio' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <Mic className="w-4 h-4 text-rose-400" />
              {isRecordingActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span>Enregistrer</span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
              currentTab === 'profile' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' 
                : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mon Espace</span>
          </button>
        </div>
      </div>
    </>
  );
}
