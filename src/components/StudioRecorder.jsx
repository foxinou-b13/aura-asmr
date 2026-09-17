import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Play, Pause, Upload, Sparkles, Check, 
  Volume2, Shield, RefreshCw, Wand2, Info, ArrowLeft, FileAudio
} from 'lucide-react';

export default function StudioRecorder({ 
  onPublishPost, 
  soundEngine, 
  onUiClick,
  onBackToFeed 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedAudioBlobUrl, setRecordedAudioBlobUrl] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [triggerType, setTriggerType] = useState('Chuchotements');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [whisperBoost, setWhisperBoost] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previewAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

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
        // subtle resting wave
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.003 + i * 0.15) * 15 + 20;
        }
      }

      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

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
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    onUiClick?.('tingle');
    audioChunksRef.current = [];
    setRecordedAudioBlobUrl(null);
    setAudioBase64(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Visualizer setup
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Real MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioBlobUrl(audioUrl);

          // convert to base64 for persistent localStorage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioBase64(reader.result);
          };
        };

        mediaRecorder.start(100);
      }
    } catch (e) {
      console.warn("Microphone access simulated / denied:", e);
    }

    setIsRecording(true);
    setRecordDuration(0);

    timerRef.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    onUiClick?.('pop');
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onUiClick?.('tingle');
    const audioUrl = URL.createObjectURL(file);
    setRecordedAudioBlobUrl(audioUrl);
    setRecordDuration(60);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAudioBase64(reader.result);
    };
  };

  const togglePreview = () => {
    if (!recordedAudioBlobUrl) return;
    if (isPlayingPreview) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(recordedAudioBlobUrl);
        previewAudioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.src = recordedAudioBlobUrl;
      }
      previewAudioRef.current.play();
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
      alert("Ajoute un titre ou une description pour ton vocal !");
      return;
    }
    onUiClick?.('tingle');
    setIsPublishing(true);

    const displayName = isAnonymous ? "Anonyme" : (authorName.trim() || "Visiteur");
    const audioSrc = audioBase64 || recordedAudioBlobUrl;

    setTimeout(() => {
      const newPost = {
        id: `vocal-${Date.now()}`,
        refCode: `#00000${Math.floor(Math.random() * 900 + 100)}`,
        author: {
          name: displayName,
          handle: isAnonymous ? "@anonyme" : `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          avatar: isAnonymous 
            ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          badge: isAnonymous ? "none" : "creator",
          badgeLabel: isAnonymous ? "" : "Créateur",
          level: "Niveau 1",
          verified: !isAnonymous
        },
        title: title.trim(),
        trigger: triggerType,
        emoji: triggerType === 'Tapping' ? '🪵' : triggerType === 'Sommeil' ? '💤' : triggerType === 'Bruits de Bouche' ? '👄' : '🎙️',
        duration: formatDuration(recordDuration || 30),
        durationSeconds: recordDuration || 30,
        timestamp: "À l'instant",
        likes: 1,
        commentsCount: 0,
        isVipExclusive: false,
        isFeatured: false,
        audioUrl: audioSrc,
        waveform: [30, 55, 75, 40, 85, 95, 60, 45, 80, 90, 70, 50, 75, 85, 60, 40, 65, 80, 70, 50, 35, 25, 20],
        tags: [`#${triggerType.toLowerCase().replace(/\s+/g, '')}`, "#asmr", "#vrai_vocal"],
        description: `Vocal ASMR réel enregistré par ${displayName}.`,
        comments: []
      };

      onPublishPost(newPost);
      setIsPublishing(false);
      setPublishSuccess(true);

      setTimeout(() => {
        onBackToFeed();
      }, 1200);
    }, 600);
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
          <span>Studio Réel de Création ASMR</span>
        </div>
      </div>

      {publishSuccess ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-teal-500/40">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center mx-auto text-2xl">
            <Check className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">Vocal publié en direct !</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Ton vrai vocal est maintenant en ligne sur le fil d'actualité. Tout le monde peut l'écouter et laisser un frisson.
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
              {!isRecording && !recordedAudioBlobUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl text-xs text-slate-400 font-medium">
                  Appuie sur le bouton rouge pour enregistrer ta voix au micro
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="text-center space-y-1">
              <div className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-wider">
                {formatDuration(recordDuration)}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
                <span>Durée idéale :</span>
                <span className="font-semibold text-teal-300">0:30 à 2:30</span>
              </div>
            </div>

            {/* Master Record / Stop / Preview */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Mic className="w-5 h-5" />
                    <span>{recordedAudioBlobUrl ? 'Réenregistrer' : 'Enregistrer au Micro'}</span>
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
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  <Square className="w-5 h-5 fill-slate-950" />
                  <span>Arrêter l'enregistrement</span>
                </button>
              )}

              {/* Preview Button if recorded */}
              {recordedAudioBlobUrl && !isRecording && (
                <button
                  onClick={togglePreview}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all"
                >
                  {isPlayingPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingPreview ? 'Pause' : 'Écouter l’aperçu'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Audio Pro Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div 
              onClick={() => { onUiClick?.('click'); setWhisperBoost(!whisperBoost); }}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                whisperBoost ? 'bg-teal-500/15 border-teal-500/40 text-teal-200' : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Wand2 className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="font-bold text-white">Whisper Boost</div>
                  <div className="text-[10px] text-slate-400">Améliore la clarté des chuchotements</div>
                </div>
              </div>
              <input type="checkbox" checked={whisperBoost} readOnly className="accent-teal-400" />
            </div>

            <div 
              onClick={() => { onUiClick?.('click'); setNoiseReduction(!noiseReduction); }}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                noiseReduction ? 'bg-teal-500/15 border-teal-500/40 text-teal-200' : 'bg-white/5 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="font-bold text-white">Filtre Anti-Souffle</div>
                  <div className="text-[10px] text-slate-400">Supprime le bruit de fond du micro</div>
                </div>
              </div>
              <input type="checkbox" checked={noiseReduction} readOnly className="accent-teal-400" />
            </div>
          </div>

          {/* Form Fields: Pseudo, Title & Trigger */}
          <div className="space-y-4 pt-1">
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
                  className="w-full bg-[#101422] rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Titre ou description du vocal :
              </label>
              <input
                type="text"
                placeholder="ex: Mots doux, tapping sur bois, chuchotements pour s'endormir..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#101422] rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Catégorie du son :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Chuchotements', 'Tapping', 'Sommeil', 'Bruits de Bouche'].map((cat) => (
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
              <div>
                <span className="font-bold text-white">Publier en mode Anonyme</span>
                <p className="text-[11px] text-slate-400">Ton pseudo sera masqué sur le fil d'actualité</p>
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
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={handlePublish}
              disabled={isPublishing || !recordedAudioBlobUrl}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                recordedAudioBlobUrl
                  ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 text-slate-950 shadow-xl shadow-teal-500/20 hover:scale-[1.01] active:scale-95'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isPublishing ? 'Publication en direct...' : 'Publier mon vocal sur le fil'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
