import React, { useState } from 'react';
import { X, Moon, Clock, EyeOff } from 'lucide-react';

export default function SleepTimerModal({ 
  isOpen, 
  onClose, 
  soundEngine, 
  sleepRemaining, 
  setSleepRemaining,
  toggleOledMode 
}) {
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  if (!isOpen) return null;

  const handleStartTimer = (mins) => {
    setSelectedMinutes(mins);
    soundEngine.startSleepTimer(
      mins,
      (rem) => setSleepRemaining(rem),
      () => {
        setSleepRemaining(null);
        alert("Minuteur de sommeil terminé. Bonne nuit ! 🌙");
      }
    );
    onClose();
  };

  const handleCancelTimer = () => {
    soundEngine.cancelSleepTimer();
    setSleepRemaining(null);
    onClose();
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0F131E] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-500/15 overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pb-5 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center mx-auto text-xl">
            <Moon className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">Minuteur de Sommeil</h3>
          <p className="text-xs text-slate-400">
            Le son diminuera en douceur sur la dernière minute pour t'endormir paisiblement.
          </p>
        </div>

        {/* Active Timer Display if running */}
        {sleepRemaining ? (
          <div className="my-5 p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 text-center space-y-2">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">Temps restant avant extinction :</span>
            <div className="font-mono text-3xl font-bold text-white">{formatSeconds(sleepRemaining)}</div>
            <button
              onClick={handleCancelTimer}
              className="px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all mt-2"
            >
              Annuler le minuteur
            </button>
          </div>
        ) : (
          <div className="my-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Choisis ta durée d'endormissement :
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartTimer(mins)}
                  className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/40 text-slate-200 hover:text-indigo-200 font-bold text-sm transition-all text-center flex flex-col items-center gap-1"
                >
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{mins} min</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OLED Night Dimmer Mode */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              toggleOledMode();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <EyeOff className="w-4 h-4 text-indigo-400" />
            <span>Activer l'Écran Noir OLED (Repos des yeux)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
