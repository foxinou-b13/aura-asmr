import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroQuickPlay from './components/HeroQuickPlay';
import FeedView from './components/FeedView';
import TriggerMixer3D from './components/TriggerMixer3D';
import StudioRecorder from './components/StudioRecorder';
import ProfileView from './components/ProfileView';
import VIPModal from './components/VIPModal';
import SleepTimerModal from './components/SleepTimerModal';
import TipModal from './components/TipModal';
import { soundEngine } from './audio/soundEngine';
import { Moon, Sparkles, Volume2, ShieldCheck, Heart, Radio } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_asmr_real_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activePlayingId, setActivePlayingId] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeInstantTrigger, setActiveInstantTrigger] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [sleepRemaining, setSleepRemaining] = useState(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [selectedCreatorForTip, setSelectedCreatorForTip] = useState(null);
  const [isOledMode, setIsOledMode] = useState(false);

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_asmr_real_posts', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  const handleUiClick = (type = 'click') => {
    soundEngine.playUiSound(type);
  };

  const toggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const toggleSoundEffects = () => {
    const enabled = soundEngine.toggleSoundEffects();
    setSoundEffectsEnabled(enabled);
  };

  // Instant trigger toggle in Hero section
  const handleToggleInstantTrigger = (triggerId) => {
    if (activeInstantTrigger === triggerId) {
      soundEngine.stopAmbientChannel(triggerId);
      setActiveInstantTrigger(null);
    } else {
      soundEngine.stopAllAmbient();
      soundEngine.setAmbientChannel(triggerId, 0.7, 0);
      setActiveInstantTrigger(triggerId);
    }
  };

  // Play post from feed
  const handlePlayPost = (post) => {
    setActivePlayingId(post.id);
    setPlaybackProgress(0);
    soundEngine.playTrack(
      post,
      (elapsed, total) => {
        setPlaybackProgress(elapsed);
      },
      () => {
        setActivePlayingId(null);
        setPlaybackProgress(0);
      }
    );
  };

  const handlePausePost = (postId) => {
    soundEngine.stopTrack();
    setActivePlayingId(null);
    setPlaybackProgress(0);
  };

  // Add comment to post
  const handleAddComment = (postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: Date.now(),
              user: "Visiteur",
              text: text,
              time: "À l'instant",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            }
          ]
        };
      }
      return p;
    }));
  };

  // Publish new post
  const handlePublishPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Tip creator modal
  const handleOpenTipModal = (creator) => {
    setSelectedCreatorForTip(creator);
    setIsTipModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 flex flex-col selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* OLED Deep Black Screen Mode for Sleep */}
      {isOledMode && (
        <div 
          onClick={() => { setIsOledMode(false); handleUiClick('tingle'); }}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer p-6 select-none animate-in fade-in duration-300"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-3xl animate-pulse">
              🌙
            </div>
            <h2 className="text-xl font-bold text-slate-300 font-heading">Mode Nuit Profonde OLED</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Écran éteint pour reposer tes yeux et préserver la batterie. L'audio continue en arrière-plan.
            </p>
            <div className="text-[11px] text-teal-400/80 uppercase tracking-widest pt-4">
              Toucher l'écran pour réveiller
            </div>
          </div>
        </div>
      )}

      {/* Main App Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMuted={isMuted}
        toggleMute={toggleMute}
        openVipModal={() => setIsVipModalOpen(true)}
        openSleepModal={() => setIsSleepModalOpen(true)}
        sleepRemaining={sleepRemaining}
        isRecordingActive={currentTab === 'studio'}
        onUiClick={handleUiClick}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 pb-24 md:pb-12">
        
        {/* Feed Tab View */}
        {currentTab === 'feed' && (
          <div className="space-y-6">
            {/* 5-Second Comprehension Hero Quick Play */}
            <HeroQuickPlay
              activeTrigger={activeInstantTrigger}
              onToggleTrigger={handleToggleInstantTrigger}
              onOpenMixer={() => setCurrentTab('mixer')}
              onOpenStudio={() => setCurrentTab('studio')}
              onOpenVip={() => setIsVipModalOpen(true)}
              onUiClick={handleUiClick}
            />

            {/* Social Feed List */}
            <FeedView
              posts={posts}
              activePlayingId={activePlayingId}
              onPlayPost={handlePlayPost}
              onPausePost={handlePausePost}
              playbackProgress={playbackProgress}
              openVipModal={() => setIsVipModalOpen(true)}
              onUiClick={handleUiClick}
              onAddComment={handleAddComment}
              onTipCreator={handleOpenTipModal}
              onOpenStudio={() => setCurrentTab('studio')}
            />
          </div>
        )}

        {/* 3D Mixer Tab View */}
        {currentTab === 'mixer' && (
          <TriggerMixer3D
            soundEngine={soundEngine}
            openSleepModal={() => setIsSleepModalOpen(true)}
            onUiClick={handleUiClick}
          />
        )}

        {/* Studio Recorder Tab View */}
        {currentTab === 'studio' && (
          <StudioRecorder
            onPublishPost={handlePublishPost}
            soundEngine={soundEngine}
            onUiClick={handleUiClick}
            onBackToFeed={() => setCurrentTab('feed')}
          />
        )}

        {/* Profile Tab View */}
        {currentTab === 'profile' && (
          <ProfileView
            openVipModal={() => setIsVipModalOpen(true)}
            onUiClick={handleUiClick}
            soundEffectsEnabled={soundEffectsEnabled}
            toggleSoundEffects={toggleSoundEffects}
            onOpenStudio={() => setCurrentTab('studio')}
          />
        )}
      </main>

      {/* Modals */}
      <VIPModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onUiClick={handleUiClick}
      />

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        soundEngine={soundEngine}
        sleepRemaining={sleepRemaining}
        setSleepRemaining={setSleepRemaining}
        onUiClick={handleUiClick}
        toggleOledMode={() => setIsOledMode(true)}
      />

      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creator={selectedCreatorForTip}
        onUiClick={handleUiClick}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-heading">AURA ASMR</span>
            <span>· Le premier réseau sensoriel & sonore</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button onClick={() => setIsVipModalOpen(true)} className="hover:text-teal-300 transition-colors">Avantages VIP</button>
            <button onClick={() => setCurrentTab('mixer')} className="hover:text-teal-300 transition-colors">Mixer 3D</button>
            <button onClick={() => setIsSleepModalOpen(true)} className="hover:text-teal-300 transition-colors">Minuteur Sommeil</button>
            <a href="#" className="hover:text-teal-300 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
