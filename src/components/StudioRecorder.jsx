import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Upload, Check, 
  ArrowLeft, FileAudio, AlertCircle, RefreshCw, Volume2, Headphones
} from 'lucide-react';
import { RealAudioRecorder } from '../audio/recorder';

export default function StudioRecorder({ 
  onPublishPost, 
  onBackToFeed 
}) {
  const [step, setStep] = useState('record'); // 'record', 'review', 'published'
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioResult, setAudioResult] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [triggerType, setTriggerType] = useState('Chuchotements');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recorderRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Canvas visualizer for live voice feedback
  const drawVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      let dataArray = recorderRef.current ? recorderRef.current.getFrequencyData() : null;

      if (isRecording && dataArray) {
        const barCount = 28;
        const barWidth = (width / barCount) * 0.7;
        let x = 6;
        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = Math.max(4, (val / 255) * height * 0.9);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#2DD4BF');
          gradient.addColorStop(1, '#38BDF8');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
          x += barWidth + 5;
        }
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(0, height / 2 - 1, width, 2);
      }
    };

    render();
  };

  useEffect(() => {
    drawVisualizer();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current) recorderRef.current.cancel();
    };
  }, [isRecording]);

  // Start recording on any device (phone, AirPods, USB, PC)
  const startRecording = async () => {
    setErrorMessage('');
    setAudioResult(null);
    setIsPlayingPreview(false);

    try {
      const recorder = new RealAudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();

      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMessage("Impossible d'accéder au micro. Vérifie que tu as bien autorisé le micro dans ton navigateur.");
      setIsRecording(false);
    }
  };

  // Stop recording and move to review step
  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (recorderRef.current) {
      try {
        const result = await recorderRef.current.stop();
        if (result && (result.blobUrl || result.base64)) {
          setAudioResult(result);
          setStep('review');
        }
      } catch (err) {
        console.error("Stop recording error:", err);
        setErrorMessage("Une erreur est survenue lors de la sauvegarde de l'enregistrement.");
      }
    }
  };

  // File upload from device
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAudioResult({
        blob: file,
        blobUrl: blobUrl,
        base64: reader.result,
        mimeType: file.type || 'audio/mp3'
      });
      setRecordDuration(45);
      setStep('review');
    };
  };

  // Preview Player controls
  const togglePreviewPlay = () => {
    if (!audioPlayerRef.current) return;

    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play()
        .then(() => setIsPlayingPreview(true))
        .catch(err => {
          console.warn("Playback error:", err);
          setIsPlayingPreview(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current && audioPlayerRef.current.duration) {
      const current = audioPlayerRef.current.currentTime;
      setPreviewProgress(current);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingPreview(false);
    setPreviewProgress(0);
  };

  const resetRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioResult(null);
    setIsPlayingPreview(false);
    setRecordDuration(0);
    setStep('record');
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Publish final vocal to feed
  const handlePublish = () => {
    if (!title.trim()) {
      alert("Ajoute un titre à ton vocal pour le publier !");
      return;
    }
    if (!audioResult || (!audioResult.base64 && !audioResult.blobUrl)) {
      alert("Aucun audio valide à publier.");
      return;
    }

    setIsPublishing(true);
    const displayName = isAnonymous ? "Anonyme" : (authorName.trim() || "Créateur Humain");
    const audioData = audioResult.base64 || audioResult.blobUrl;

    setTimeout(() => {
      const newPost = {
        id: `vocal-${Date.now()}`,
        refCode: `#${Math.floor(Math.random() * 90000 + 10000)}`,
        author: {
          name: displayName,
          handle: isAnonymous ? "@anonyme" : `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          avatar: isAnonymous 
            ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          badge: isAnonymous ? "none" : "creator",
          badgeLabel: isAnonymous ? "" : "Créateur Réel",
          level: "Niveau 1",
          verified: !isAnonymous
        },
        title: title.trim(),
        trigger: triggerType,
        emoji: triggerType === 'Tapping' ? '🪵' : triggerType === 'Sommeil' ? '💤' : triggerType === 'Bruits de Bouche' ? '👄' : '🎙️',
        duration: formatDuration(recordDuration || 15),
        durationSeconds: recordDuration || 15,
        timestamp: "À l'instant",
        likes: 0,
        commentsCount: 0,
        isVipExclusive: false,
        isFeatured: false,
        audioUrl: audioData,
        waveform: [20, 40, 65, 80, 55, 35, 70, 85, 60, 45, 75, 90, 65, 50, 40, 60, 75, 55, 40, 25, 20],
        tags: [`#${triggerType.toLowerCase().replace(/\s+/g, '')}`, "#asmr_humain", "#vrai_vocal"],
        description: `Vocal ASMR authentique enregistré au micro par ${displayName}.`,
        comments: []
      };

      onPublishPost(newPost);
      setIsPublishing(false);
      setStep('published');

      setTimeout(() => {
        onBackToFeed();
      }, 1200);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au fil</span>
        </button>

        <span className="text-xs text-teal-400 font-semibold">
          Studio d'Enregistrement Réel
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 'published' && (
        <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-teal-500/40 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-xl">
            <Check className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Vocal publié avec succès !</h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Ton vocal est maintenant disponible sur le fil d'actualité. Redirection...
          </p>
        </div>
      )}

      {/* Step 1: Recording Stage */}
      {step === 'record' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white font-heading">
              Enregistre ton vocal ASMR
            </h2>
            <p className="text-xs text-slate-400">
              Compatible avec tous les appareils (smartphone, écouteurs, micro USB ou micro PC).
            </p>
          </div>

          {/* Visualizer Box */}
          <div className="rounded-2xl bg-[#0B0E17] border border-white/5 p-6 flex flex-col items-center justify-center space-y-4">
            
            <div className="w-full h-20 flex items-center justify-center relative">
              <canvas 
                ref={canvasRef} 
                width={360} 
                height={80} 
                className="w-full h-full object-contain"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
                  Appuie sur le micro ci-dessous pour parler
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white tracking-wider">
                {formatDuration(recordDuration)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isRecording ? "Enregistrement en cours..." : "Micro prêt"}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Démarrer l'enregistrement</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
                  >
                    <FileAudio className="w-4 h-4 text-teal-400" />
                    <span>Importer un fichier audio</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-slate-950" />
                  <span>Arrêter & Réécouter mon vocal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review & Listen before Publishing (IMPOSSIBLE TO MISS) */}
      {step === 'review' && audioResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 space-y-6 animate-in fade-in">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center justify-center gap-1.5">
              <Headphones className="w-4 h-4" /> Écoute ton vocal avant de le publier
            </span>
            <h2 className="text-lg font-bold text-white font-heading">
              Vérifie la qualité de ton son
            </h2>
          </div>

          {/* Dedicated Audio Player Box */}
          <div className="rounded-2xl bg-[#0B0E17] border border-white/10 p-5 space-y-4 shadow-lg">
            
            {/* Hidden native audio element for bulletproof playback */}
            <audio
              ref={audioPlayerRef}
              src={audioResult.blobUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              preload="auto"
            />

            {/* Custom Visual Player */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePreviewPlay}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/25 shrink-0 hover:scale-105 transition-all"
              >
                {isPlayingPreview ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-teal-300">
                    {isPlayingPreview ? "Lecture de ton enregistrement..." : "Prêt pour écoute"}
                  </span>
                  <span className="font-mono text-slate-400">
                    {formatDuration(previewProgress)} / {formatDuration(recordDuration)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-100"
                    style={{ width: `${recordDuration > 0 ? (previewProgress / recordDuration) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Re-record button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={resetRecording}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ce son ne me plaît pas : Réenregistrer</span>
              </button>
            </div>
          </div>

          {/* Form Fields: Details */}
          <div className="space-y-4 pt-2">
            {!isAnonymous && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Ton Pseudo :
                </label>
                <input
                  type="text"
                  placeholder="ex: Alex_ASMR, Sophie, Nico..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#101422] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Titre de ton vocal :
              </label>
              <input
                type="text"
                placeholder="ex: Chuchotements doux, bruits de bouche, tapping..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#101422] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Catégorie :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Chuchotements', 'Tapping', 'Sommeil', 'Bruits de Bouche'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTriggerType(cat)}
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
              <div>
                <span className="font-bold text-white">Publier en mode Anonyme</span>
                <p className="text-[11px] text-slate-400">Ton pseudo sera masqué sur le fil d'actualité</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
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

          {/* Final Validation & Publish Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 text-slate-950 shadow-xl shadow-teal-500/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isPublishing ? 'Publication en cours...' : 'Valider & Publier mon vocal sur le fil'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
