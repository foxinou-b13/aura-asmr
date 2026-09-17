import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Upload, Check, 
  ArrowLeft, FileAudio, AlertCircle, RefreshCw
} from 'lucide-react';
import { RealAudioRecorder } from '../audio/recorder';

export default function StudioRecorder({ 
  onPublishPost, 
  onBackToFeed 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioResult, setAudioResult] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [triggerType, setTriggerType] = useState('Chuchotements');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recorderRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const previewAudioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Live visualizer drawing
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
        const barWidth = (width / 32) * 0.8;
        let x = 0;
        for (let i = 0; i < 32; i++) {
          const val = dataArray[i * 2] || 0;
          const barHeight = Math.max(4, (val / 255) * height * 0.9);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#2DD4BF');
          gradient.addColorStop(1, '#38BDF8');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
          x += barWidth + 4;
        }
      } else {
        // Flat resting line
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
      if (previewAudioRef.current) previewAudioRef.current.pause();
    };
  }, [isRecording]);

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
      console.error("Microphone error:", err);
      setErrorMessage("Impossible d'accéder à ton micro. Vérifie que tu as accordé l'autorisation au navigateur.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (recorderRef.current) {
      try {
        const result = await recorderRef.current.stop();
        if (result) {
          setAudioResult(result);
        }
      } catch (err) {
        console.error("Stop recording error:", err);
        setErrorMessage("Une erreur est survenue lors de l'enregistrement de l'audio.");
      }
    }
  };

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
      setRecordDuration(60);
    };
  };

  const togglePreview = () => {
    if (!audioResult || !audioResult.blobUrl) return;

    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(audioResult.blobUrl);
        previewAudioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.src = audioResult.blobUrl;
      }
      previewAudioRef.current.play().catch(() => setIsPlayingPreview(false));
      setIsPlayingPreview(true);
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert("Ajoute un petit titre ou une description pour ton vocal !");
      return;
    }
    if (!audioResult || (!audioResult.base64 && !audioResult.blobUrl)) {
      alert("Enregistre un son au micro ou importe un fichier audio avant de publier.");
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
        waveform: [25, 45, 70, 85, 60, 40, 75, 90, 65, 50, 80, 95, 70, 55, 40, 65, 80, 60, 45, 30, 20],
        tags: [`#${triggerType.toLowerCase().replace(/\s+/g, '')}`, "#asmr_humain", "#vrai_vocal"],
        description: `Vocal ASMR réel enregistré au micro par ${displayName}.`,
        comments: []
      };

      onPublishPost(newPost);
      setIsPublishing(false);
      setPublishSuccess(true);

      setTimeout(() => {
        onBackToFeed();
      }, 1000);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          onClick={onBackToFeed}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au fil</span>
        </button>

        <span className="text-xs text-teal-400 font-semibold">
          Enregistrement Réel au Micro
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {publishSuccess ? (
        <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-teal-500/40">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-xl">
            <Check className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading">Vocal publié avec succès !</h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Ton enregistrement est maintenant disponible pour tous les membres sur le fil d'actualité.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
          
          {/* Visualizer Canvas & Record Controls */}
          <div className="rounded-2xl bg-[#0B0E17] border border-white/5 p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
            
            {/* Real Audio Oscilloscope Canvas */}
            <div className="w-full h-20 flex items-center justify-center relative">
              <canvas 
                ref={canvasRef} 
                width={360} 
                height={80} 
                className="w-full h-full object-contain"
              />
              {!isRecording && !audioResult && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium">
                  Appuie sur le bouton rouge pour enregistrer ta voix
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-white tracking-wider">
                {formatDuration(recordDuration)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isRecording ? "Enregistrement en cours..." : audioResult ? "Audio prêt à être publié" : "Prêt à enregistrer"}
              </div>
            </div>

            {/* Record / Stop / Upload Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{audioResult ? 'Réenregistrer' : 'Enregistrer au Micro'}</span>
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
                    className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
                  >
                    <FileAudio className="w-4 h-4 text-teal-400" />
                    <span>Fichier audio</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-slate-950" />
                  <span>Arrêter l'enregistrement</span>
                </button>
              )}

              {/* Preview Button */}
              {audioResult && !isRecording && (
                <button
                  onClick={togglePreview}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingPreview ? 'Pause' : 'Écouter l’audio'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Fields: Pseudo & Title */}
          <div className="space-y-4 pt-1">
            {!isAnonymous && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Ton Pseudo :
                </label>
                <input
                  type="text"
                  placeholder="ex: Alex_ASMR, Sarah, Nino..."
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#101422] rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Titre du vocal :
              </label>
              <input
                type="text"
                placeholder="ex: Chuchotements doux, bruits de bouche, tapping sur livre..."
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
                <p className="text-[11px] text-slate-400">Ton nom ne sera pas affiché</p>
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

          {/* Publish CTA */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handlePublish}
              disabled={isPublishing || !audioResult}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                audioResult
                  ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 text-slate-950 shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-95'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isPublishing ? 'Publication...' : 'Publier mon vocal réel'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
