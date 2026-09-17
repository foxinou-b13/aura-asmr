import React, { useState } from 'react';
import { 
  Play, Pause, Heart, MessageSquare, Share2, Sparkles, 
  Search, Flame, Zap, Award, Crown, Check, Send, Coffee,
  Headphones, Bookmark, Shuffle, Filter, Volume2
} from 'lucide-react';
import { TRIGGER_CATEGORIES } from '../data/mockData';

export default function FeedView({ 
  posts, 
  activePlayingId, 
  onPlayPost, 
  onPausePost, 
  playbackProgress,
  openVipModal,
  onUiClick,
  onAddComment,
  onTipCreator
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilterTab, setActiveFilterTab] = useState('trending');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [followingUsers, setFollowingUsers] = useState(new Set());

  // Filter posts based on category, tab, and search
  const filteredPosts = posts.filter(post => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchAuthor = post.author.name.toLowerCase().includes(q);
      const matchTag = post.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchTag) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'sleep' && !post.trigger.toLowerCase().includes('sommeil') && !post.trigger.toLowerCase().includes('mots')) return false;
      if (selectedCategory === 'whispers' && !post.trigger.toLowerCase().includes('chuchotement')) return false;
      if (selectedCategory === 'tapping' && !post.trigger.toLowerCase().includes('tapping')) return false;
      if (selectedCategory === 'rain' && !post.trigger.toLowerCase().includes('pluie') && !post.trigger.toLowerCase().includes('nature')) return false;
      if (selectedCategory === 'care' && !post.trigger.toLowerCase().includes('soin')) return false;
    }

    // Tab filter
    if (activeFilterTab === 'vip' && !post.isVipExclusive && post.author.badge !== 'vip-diamond') return false;

    return true;
  });

  const toggleLike = (postId, e) => {
    e.stopPropagation();
    onUiClick?.('tingle');
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleBookmark = (postId, e) => {
    e.stopPropagation();
    onUiClick?.('click');
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleFollow = (authorHandle, e) => {
    e.stopPropagation();
    onUiClick?.('tap');
    setFollowingUsers(prev => {
      const next = new Set(prev);
      if (next.has(authorHandle)) next.delete(authorHandle);
      else next.add(authorHandle);
      return next;
    });
  };

  const handleSendComment = (postId) => {
    if (!commentInput.trim()) return;
    onUiClick?.('pop');
    if (onAddComment) {
      onAddComment(postId, commentInput.trim());
    }
    setCommentInput('');
  };

  const playRandomPost = () => {
    onUiClick?.('tingle');
    if (filteredPosts.length > 0) {
      const randomIdx = Math.floor(Math.random() * filteredPosts.length);
      const randomPost = filteredPosts[randomIdx];
      onPlayPost(randomPost.id);
    }
  };

  return (
    <div className="space-y-6">

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {TRIGGER_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { onUiClick?.('tap'); setSelectedCategory(cat.id); }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md shadow-teal-500/10'
                : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className="text-[10px] text-slate-400 opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E121D] p-3 rounded-2xl border border-white/5">
        
        {/* Tab Filters */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { onUiClick?.('tap'); setActiveFilterTab('trending'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilterTab === 'trending'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Tendances</span>
          </button>

          <button
            onClick={() => { onUiClick?.('tap'); setActiveFilterTab('recent'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilterTab === 'recent'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Récents</span>
          </button>

          <button
            onClick={() => { onUiClick?.('tingle'); setActiveFilterTab('vip'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeFilterTab === 'vip'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Exclusifs</span>
          </button>
        </div>

        {/* Random button & Search input */}
        <div className="flex items-center gap-2">
          <button
            onClick={playRandomPost}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
            title="Écouter un vocal au hasard"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Aléatoire</span>
          </button>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un son..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141926] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0E121D] border border-white/5 space-y-3">
            <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">Aucun vocal ne correspond</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Essaie de changer de filtre ou clique sur "Tout explorer" pour retrouver tous les vocaux communautaires.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setActiveFilterTab('trending'); }}
              className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isPlaying = activePlayingId === post.id;
            const isLiked = likedPosts[post.id];
            const isBookmarked = bookmarkedIds.has(post.id);
            const isFollowing = followingUsers.has(post.author.handle);
            const isCommentsOpen = activeCommentPostId === post.id;
            const isVipCard = post.author.badge === 'vip-diamond' || post.isVipExclusive;

            return (
              <div
                key={post.id}
                className={`rounded-3xl p-5 sm:p-6 transition-all duration-200 border relative overflow-hidden ${
                  isVipCard ? 'glass-card-vip' : 'glass-card'
                }`}
              >
                {/* VIP Featured Badge Banner */}
                {post.isFeatured && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-rose-500 to-transparent text-[10px] font-bold text-slate-950 px-4 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Mise en avant VIP</span>
                  </div>
                )}

                {/* Author Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className={`w-11 h-11 rounded-2xl object-cover border-2 ${
                        isVipCard ? 'border-amber-400 shadow-md shadow-amber-500/20' : 'border-teal-500/30'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                          {post.author.name}
                        </span>

                        {/* Author Badge */}
                        {post.author.badge === 'vip-diamond' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-extrabold flex items-center gap-1 shadow-sm">
                            <Crown className="w-2.5 h-2.5 fill-slate-950" /> VIP
                          </span>
                        )}
                        {post.author.badge === 'creator' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold">
                            Créateur Pro
                          </span>
                        )}
                        {post.author.badge === 'beta' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                            Pionnier
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-normal">
                          · {post.timestamp}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{post.author.handle}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-teal-400 font-medium">{post.author.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={(e) => toggleFollow(post.author.handle, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                      isFollowing
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Suivi</span>
                      </>
                    ) : (
                      <span>+ Suivre</span>
                    )}
                  </button>
                </div>

                {/* Content Title & Trigger */}
                <div className="mb-3 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                      <span>{post.emoji}</span>
                      <span>{post.trigger}</span>
                    </span>
                    {post.isVipExclusive && (
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        🔒 Exclusivité VIP
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Audio Waveform Player Bar */}
                <div className="p-4 rounded-2xl bg-[#090C14]/80 border border-white/5 mb-4 space-y-3">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => {
                        onUiClick?.('pop');
                        if (isPlaying) onPausePost(post.id);
                        else onPlayPost(post.id);
                      }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        isPlaying 
                          ? 'bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-teal-400/30 scale-105' 
                          : 'bg-gradient-to-tr from-white/10 to-white/5 text-white hover:bg-white/20'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform Bars */}
                    <div className="flex-1 flex items-center gap-1 h-10 px-2 cursor-pointer select-none">
                      {post.waveform.map((barHeight, idx) => {
                        const progressRatio = isPlaying ? (playbackProgress / 30) : 0;
                        const barRatio = idx / post.waveform.length;
                        const isPast = isPlaying && barRatio <= progressRatio;

                        return (
                          <div
                            key={idx}
                            style={{ height: `${barHeight}%` }}
                            className={`flex-1 rounded-full transition-all duration-150 ${
                              isPast 
                                ? 'bg-gradient-to-t from-teal-400 to-cyan-300 shadow-sm shadow-teal-400/50' 
                                : isPlaying 
                                ? 'bg-slate-600 hover:bg-teal-400/50' 
                                : 'bg-slate-700/80 hover:bg-slate-500'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Duration */}
                    <div className="text-xs font-mono font-bold text-slate-400 shrink-0">
                      {isPlaying ? `${Math.round(playbackProgress)}s / 30s` : post.duration}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {post.tags?.map((t, idx) => (
                      <span key={idx} className="text-[11px] text-teal-400/80 hover:text-teal-300 cursor-pointer">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions & Reactions Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Frisson / Like */}
                    <button
                      onClick={(e) => toggleLike(post.id, e)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isLiked 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                          : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                      <span className="hidden sm:inline">Frissons</span>
                    </button>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => {
                        onUiClick?.('tap');
                        setActiveCommentPostId(isCommentsOpen ? null : post.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isCommentsOpen 
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                          : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.comments.length}</span>
                      <span className="hidden sm:inline">Avis</span>
                    </button>

                    {/* Tip Creator */}
                    <button
                      onClick={() => { onUiClick?.('tingle'); onTipCreator?.(post.author); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
                      title="Offrir un thé relaxant au créateur"
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Pourboire</span>
                    </button>
                  </div>

                  {/* Bookmark & Share */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className={`p-2 rounded-xl transition-all ${
                        isBookmarked ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title="Enregistrer dans mes favoris"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        onUiClick?.('click');
                        navigator.clipboard?.writeText(window.location.href);
                        alert("Lien du vocal copié dans le presse-papier !");
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Partager"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Comments Section */}
                {isCommentsOpen && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Commentaires de la communauté ({post.comments.length})
                    </span>

                    {/* Comment List */}
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {post.comments.map(c => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                          <img src={c.avatar} alt={c.user} className="w-6 h-6 rounded-lg object-cover mt-0.5" />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{c.user}</span>
                              <span className="text-[10px] text-slate-500">{c.time}</span>
                            </div>
                            <p className="text-slate-300 mt-0.5">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Écris un message doux ou un retour..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(post.id); }}
                        className="flex-1 bg-[#141926] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-teal-500/50 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        className="p-2 rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all font-bold"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
