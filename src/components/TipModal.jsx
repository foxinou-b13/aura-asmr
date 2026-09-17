import React, { useState } from 'react';
import { X, Coffee, Heart, Sparkles, Check } from 'lucide-react';

export default function TipModal({ isOpen, onClose, creator, onUiClick }) {
  const [selectedAmount, setSelectedAmount] = useState(2);
  const [tipped, setTipped] = useState(false);

  if (!isOpen || !creator) return null;

  const handleSendTip = () => {
    onUiClick?.('tingle');
    setTipped(true);
    setTimeout(() => {
      alert(`Merci ! Ton pourboire de ${selectedAmount}€ et tes ondes positives ont bien été envoyés à ${creator.name} ☕✨`);
      setTipped(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#121624] border border-amber-500/30 p-6 shadow-2xl space-y-5">
        
        <button
          onClick={() => { onUiClick?.('click'); onClose(); }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 to-rose-500 mx-auto shadow-lg shadow-amber-500/20">
            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <h3 className="font-bold text-base text-white">Soutenir {creator.name}</h3>
          <p className="text-xs text-slate-400">Offre un petit thé relaxant ou un frisson pour remercier ce créateur.</p>
        </div>

        {/* Amount Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 5].map((amount) => (
            <button
              key={amount}
              onClick={() => { onUiClick?.('tap'); setSelectedAmount(amount); }}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                selectedAmount === amount
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              ☕ {amount} €
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSendTip}
          disabled={tipped}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
        >
          {tipped ? 'Envoi du pourboire...' : `Envoyer ${selectedAmount} € de soutien ✨`}
        </button>
      </div>
    </div>
  );
}
