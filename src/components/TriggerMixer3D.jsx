import React, { useState } from 'react';
import { 
  Sliders, Volume2, VolumeX, Sparkles, Moon, 
  Play, Pause, Compass, Info
} from 'lucide-react';
import { AMBIENT_CHANNELS, SOUNDBOARD_PRESETS } from '../data/mockData';

export default function TriggerMixer3D({ 
  soundEngine, 
  openSleepModal
}) {
  const [volumes, setVolumes] = useState({
    rain: 0,
    tapping: 0,
    whisper: 0,
    waves: 0,
    fire: 0,
    bowl: 0
  });

  const [pans, setPans] = useState({
    rain: -0.2,
    tapping: 0.4,
    whisper: -0.5,
    waves: 0.1,
    fire: 0.3,
    bowl: 0.0
  });

  const [activePreset, setActivePreset] = useState(null);

  const handleVolumeChange = (id, newVol) => {
    const val = parseFloat(newVol);
    setVolumes(prev => ({ ...prev, [id]: val }));
    soundEngine.setAmbientChannel(id, val, pans[id] || 0);
  };

  const handlePanChange = (id, newPan) => {
    const val = parseFloat(newPan);
    setPans(prev => ({ ...prev, [id]: val }));
    if (volumes[id] > 0) {
      soundEngine.setAmbientChannel(id, volumes[id], val);
    }
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    const newVols = { ...preset.volumes };
    setVolumes(newVols);

    Object.keys(newVols).forEach(id => {
      soundEngine.setAmbientChannel(id, newVols[id], pans[id] || 0);
    });
  };

  const stopAll = () => {
    soundEngine.stopAllAmbient();
    setVolumes({
      rain: 0,
      tapping: 0,
      whisper: 0,
      waves: 0,
      fire: 0,
      bowl: 0
    });
    setActivePreset(null);
  };

  const activeCount = Object.values(volumes).filter(v => v > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Presets */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio d'Ambiance 3D</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Mixe ton fond sonore relaxant
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Superpose la pluie, le bois et les vagues avec un réglage stéréo 3D gauche/droite.
            </p>
          </div>

          {/* Master Controls */}
          <div className="flex items-center gap-2.5">
            {activeCount > 0 && (
              <button
                onClick={stopAll}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 transition-all flex items-center gap-1.5"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Tout couper ({activeCount})</span>
              </button>
            )}

            <button
              onClick={openSleepModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Minuteur Sommeil</span>
            </button>
          </div>
        </div>

        {/* 1-Click Mood Presets */}
        <div className="pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            Ambiances pré-réglées :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SOUNDBOARD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all ${
                  activePreset === preset.id
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-200 shadow-md shadow-teal-500/20 scale-[1.02]'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Ambient Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AMBIENT_CHANNELS.map((channel) => {
          const vol = volumes[channel.id] || 0;
          const pan = pans[channel.id] || 0;
          const isChannelActive = vol > 0;

          return (
            <div
              key={channel.id}
              className={`p-5 rounded-3xl border transition-all duration-200 ${
                isChannelActive
                  ? 'bg-gradient-to-br from-[#182030] to-[#0F1420] border-teal-500/40 shadow-xl shadow-teal-500/10'
                  : 'bg-[#101420]/70 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    isChannelActive ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-white/5 text-slate-400'
                  }`}>
                    {channel.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{channel.name}</h3>
                    <p className="text-[11px] text-slate-400">{channel.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleVolumeChange(channel.id, isChannelActive ? 0 : (channel.defaultVol || 0.6))}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isChannelActive 
                      ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/30' 
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  {isChannelActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-teal-400" /> Volume
                  </span>
                  <span className="font-mono text-teal-300">{Math.round(vol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={vol}
                  onChange={(e) => handleVolumeChange(channel.id, e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 3D Spatial Stereo Panning (Left <-> Right) */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-cyan-400" /> Spatialisation 3D
                  </span>
                  <span className="font-mono text-[10px] text-slate-300">
                    {pan < -0.1 ? `Gauche ${Math.round(Math.abs(pan)*100)}%` : pan > 0.1 ? `Droite ${Math.round(pan*100)}%` : 'Centre'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={pan}
                  onChange={(e) => handlePanChange(channel.id, e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong>Conseil d'écoute :</strong> Branche tes écouteurs pour percevoir le son en 3D binaural gauche et droite.
        </span>
      </div>
    </div>
  );
}
