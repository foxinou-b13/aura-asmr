import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroQuickPlay from './components/HeroQuickPlay';
import FeedView from './components/FeedView';
import StudioRecorder from './components/StudioRecorder';
import ProfileView from './components/ProfileView';
import VIPModal from './components/VIPModal';
import SleepTimerModal from './components/SleepTimerModal';
import TipModal from './components/TipModal';
import { soundEngine } from './audio/soundEngine';
import { Moon } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_asmr_real_human_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activePlayingId, setActivePlayingId] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [selectedCreatorForTip, setSelectedCreatorForTip] = useState(null);
  const [isOledMode, setIsOledMode] = useState(false);

  // Save real posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_asmr_real_human_posts', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  const toggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Play real human post from feed
  const handlePlayPost = (post) => {
    setActivePlayingId(post.id);
    setPlaybackProgress(0);
    soundEngine.playTrack(
      post,
      (elapsed) => {
        setPlaybackProgress(elapsed);
      },
      () => {
        setActivePlayingId(null);
        setPlaybackProgress(0);
      }
    );
  };

  const handlePausePost = () => {
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
            ...(p.comments || []),
            {
              id: Date.now(),
              user: "Membre Réel",
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

  // Publish new real post
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
          onClick={() => setIsOledMode(false)}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer p-6 select-none"
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-2xl">
              🌙
            </div>
            <h2 className="text-lg font-bold text-slate-300 font-heading">Mode Nuit Profonde OLED</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Écran éteint. L'audio de ton vocal continue en arrière-plan.
            </p>
            <div className="text-[10px] text-teal-400/80 uppercase tracking-widest pt-3">
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
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 pb-24 md:pb-12">
        
        {/* Feed Tab View */}
        {currentTab === 'feed' && (
          <div className="space-y-6">
            <HeroQuickPlay
              onOpenStudio={() => setCurrentTab('studio')}
            />

            <FeedView
              posts={posts}
              activePlayingId={activePlayingId}
              onPlayPost={handlePlayPost}
              onPausePost={handlePausePost}
              playbackProgress={playbackProgress}
              openVipModal={() => setIsVipModalOpen(true)}
              onAddComment={handleAddComment}
              onTipCreator={handleOpenTipModal}
              onOpenStudio={() => setCurrentTab('studio')}
            />
          </div>
        )}

        {/* Studio Recorder Tab View */}
        {currentTab === 'studio' && (
          <StudioRecorder
            onPublishPost={handlePublishPost}
            onBackToFeed={() => setCurrentTab('feed')}
          />
        )}

        {/* Profile Tab View */}
        {currentTab === 'profile' && (
          <ProfileView
            openVipModal={() => setIsVipModalOpen(true)}
            onOpenStudio={() => setCurrentTab('studio')}
          />
        )}
      </main>

      {/* Modals */}
      <VIPModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
      />

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        soundEngine={soundEngine}
        sleepRemaining={sleepRemaining}
        setSleepRemaining={setSleepRemaining}
        toggleOledMode={() => setIsOledMode(true)}
      />

      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        creator={selectedCreatorForTip}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-heading">AURA ASMR</span>
            <span>· Le réseau social 100% humain</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button onClick={() => setIsVipModalOpen(true)} className="hover:text-teal-300 transition-colors">Avantages VIP</button>
            <button onClick={() => setIsSleepModalOpen(true)} className="hover:text-teal-300 transition-colors">Minuteur Sommeil</button>
            <a href="#" className="hover:text-teal-300 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
