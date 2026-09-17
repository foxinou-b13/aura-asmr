import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Upload, Sparkles, Check, 
  Volume2, Shield, RefreshCw, Wand2, Info, ArrowLeft
} from 'lucide-react';
import { TRIGGER_CATEGORIES } from '../data/mockData';

export default function StudioRecorder({ 
  onPublishPost, 
  soundEngine, 
  onUiClick,
  onBackToFeed 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [triggerType, setTriggerType] = useState('Chuchotements');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [whisperBoost, setWhisperBoost] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Real-time canvas waveform visualization
  const drawWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const analyser = analyserRef.current;
    let dataArray = new Uint8Array(128);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      if (analyser && isRecording) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // idle animation
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.005 + i * 0.2) * 20 + 25;
        }
      }

      ctx.clearRect(0, 0, width, height);
      
      const barWidth = (width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.8;

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#2DD4BF');
        gradient.addColorStop(0.5, '#38BDF8');
        gradient.addColorStop(1, '#818CF8');

        ctx.fillStyle = isRecording ? gradient : 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();
  };

  useEffect(() => {
    drawWaveform();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    onUiClick?.('tingle');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      }
    } catch (e) {
      console.warn("Microphone access simulation:", e);
    }

    setIsRecording(true);
    setRecordDuration(0);
    setRecordedAudioUrl(null);

    timerRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    onUiClick?.('pop');
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    // Set preview ready
    setRecordedAudioUrl("recorded-ready");
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert("Ajoute un petit titre à ton vocal !");
      return;
    }
    onUiClick?.('tingle');
    setIsPublishing(true);

    setTimeout(() => {
      const newPost = {
        id: `asmr-${Date.now()}`,
        author: {
          name: isAnonymous ? "Anonyme" : "Toi (Créateur)",
          handle: isAnonymous ? "@anonyme" : "@toi_pro",
          avatar: isAnonymous 
            ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          badge: isAnonymous ? "none" : "creator",
          badgeLabel: isAnonymous ? "" : "Créateur Pro",
          level: "Niveau 1",
          verified: !isAnonymous
        },
        title: title.trim(),
        trigger: triggerType,
        emoji: triggerType === 'Tapping' ? '🪵' : triggerType === 'Sommeil' ? '💤' : '👄',
        duration: formatDuration(recordDuration || 45),
        durationSeconds: recordDuration || 45,
        timestamp: "À l'instant",
        likes: 1,
        commentsCount: 0,
        isVipExclusive: false,
        isFeatured: false,
        waveform: [35, 60, 80, 45, 90, 70, 50, 85, 95, 65, 40, 75, 85, 60, 50, 80, 90, 75, 55, 40, 70, 85, 50, 30, 20],
        tags: [`#${triggerType.toLowerCase()}`, "#binaural", "#nouveau"],
        description: `Vocal ASMR fraîchement enregistré avec filtre Whisper Boost et réduction de souffle.`,
        comments: []
      };

      onPublishPost(newPost);
      setIsPublishing(false);
      setPublishSuccess(true);

      setTimeout(() => {
        onBackToFeed();
      }, 1500);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          onClick={() => { onUiClick?.(); onBackToFeed(); }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au fil</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio Audio Haute Définition</span>
        </div>
      </div>

      {publishSuccess ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-teal-500/40">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-2xl">
            <Check className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">Vocal publié avec succès !</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Ton enregistrement est maintenant en ligne sur le fil d'actualité communautaire. Redirection immédiate...
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          
          {/* Visualizer Canvas & Record Button */}
          <div className="rounded-2xl bg-[#0B0E17] border border-white/5 p-6 flex flex-col items-center justify-center space-y-5 relative overflow-hidden">
            
            {/* Live Audio Oscilloscope Canvas */}
            <div className="w-full h-28 flex items-center justify-center relative">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={100} 
                className="w-full h-full object-contain"
              />
              {!isRecording && !recordedAudioUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl text-xs text-slate-400 font-medium">
                  Appuie sur le micro pour démarrer l'enregistrement
                </div>
              )}
            </div>

            {/* Timer & Ideal Zone Indicator */}
            <div className="text-center space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-wider">
                {formatDuration(recordDuration)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
                <span>Zone recommandée :</span>
                <span className="font-semibold text-teal-300">0:30 à 2:30</span>
              </div>
            </div>

            {/* Master Record / Stop Button */}
            <div className="flex items-center gap-4 pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  <span>{recordedAudioUrl ? 'Réenregistrer' : 'Démarrer l’enregistrement'}</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  <Square className="w-5 h-5 fill-slate-950" />
                  <span>Arrêter & Sauvegarder</span>
                </button>
              )}
            </div>
          </div>

          {/* Audio Pro Enhancers Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div 
              onClick={() => { onUiClick?.('click'); setWhisperBoost(!whisperBoost); }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                whisperBoost ? 'bg-teal-500/15 border-teal-500/40 text-teal-200' : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <Wand2 className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="font-bold text-white">Whisper Boost 3D</div>
                  <div className="text-[10px] text-slate-400">Améliore la clarté des chuchotis</div>
                </div>
              </div>
              <input type="checkbox" checked={whisperBoost} readOnly className="accent-teal-400" />
            </div>

            <div 
              onClick={() => { onUiClick?.('click'); setNoiseReduction(!noiseReduction); }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                noiseReduction ? 'bg-teal-500/15 border-teal-500/40 text-teal-200' : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <Shield className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="font-bold text-white">Filtre Anti-Souffle</div>
                  <div className="text-[10px] text-slate-400">Supprime le bruit de fond du micro</div>
                </div>
              </div>
              <input type="checkbox" checked={noiseReduction} readOnly className="accent-teal-400" />
            </div>
          </div>

          {/* Form Fields: Title & Trigger */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Titre de ta publication ASMR :
              </label>
              <input
                type="text"
                placeholder="ex: Chuchotements doux sous la pluie pour s'endormir..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#101422] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Catégorie & Déclencheur :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Chuchotements', 'Tapping', 'Sommeil', 'Soin Visage'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { onUiClick?.('tap'); setTriggerType(cat); }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      triggerType === cat
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
              <div>
                <span className="font-bold text-white">Publier en mode Anonyme</span>
                <p className="text-[11px] text-slate-400">Ton pseudo et ta photo de profil seront masqués</p>
              </div>
              <button
                type="button"
                onClick={() => { onUiClick?.('click'); setIsAnonymous(!isAnonymous); }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isAnonymous ? 'bg-teal-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isAnonymous ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Publish CTA */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handlePublish}
              disabled={isPublishing || !recordedAudioUrl}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                recordedAudioUrl
                  ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 text-slate-950 shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-95'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isPublishing ? 'Publication en cours...' : 'Publier sur le fil communautaire'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
