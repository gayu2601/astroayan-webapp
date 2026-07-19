import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Shield, AlertCircle, Sparkles, RefreshCw, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RemedyItem {
  id: string;
  nameEn: string;
  nameTa: string;
  price: number;
  descEn: string;
  descTa: string;
  img?: string; // Since we don't have local images, we can generate a beautiful SVG/CSS illustration dynamically inside the cards!
  categoryEn: string;
  categoryTa: string;
}

const REMEDY_PRODUCTS: RemedyItem[] = [
  {
    id: 'blue-sapphire',
    nameEn: 'Vedic Royal Blue Sapphire (Neelam)',
    nameTa: 'மங்கள நீலக்கல் (நீலம்)',
    price: 500,
    descEn: 'Authentic Ceylon gemstone certified under Vedic standards. Governed by Saturn (Shani dev), it brings instantaneous focus, mental clarity, spiritual discipline, and rapid professional elevation.',
    descTa: 'வேத தரத்தின் கீழ் சான்றளிக்கப்பட்ட சிலோன் நீலக்கல். சனி பகவானால் ஆளப்படும் இது, உடனடி மனக் குவியலையும், தொழில் உயர்வையும் தரும்.',
    categoryEn: 'Gemstone',
    categoryTa: 'நவரத்தினங்கள்'
  },
  {
    id: 'ek-mukhi-rudraksha',
    nameEn: 'Certified Nepal Ek Mukhi Rudraksha',
    nameTa: 'சான்றளிக்கப்பட்ட ஏகமுக ருத்ராட்சம்',
    price: 350,
    descEn: 'Extremely rare, natural one-faced divine bead representing Lord Shiva Himself. Energized on auspicious Shravan Mondays, it elevates consciousness, balances heart chakras, and ward off cosmic anxiety.',
    descTa: 'சிவபெருமானைக் குறிக்கும் மிகவும் அரிதான இயற்கை ஏகமுக ருத்ராட்சம். ஆன்மீக விழிப்புணர்வையும், அமைதியையும் வழங்க வல்லது.',
    categoryEn: 'Beads',
    categoryTa: 'ருத்ராட்சம்'
  },
  {
    id: 'shree-yantra',
    nameEn: 'Pure Heavy Copper Shree Yantra (3x3 inch)',
    nameTa: 'தூய செம்பு ஸ்ரீ யந்திரம் (3x3 அங்குலம்)',
    price: 200,
    descEn: 'Precision-etched sacred geometry on premium heavy-gauge copper plates. Installed in your home altar, it acts as a magnet for eternal wealth, luxury, celestial order, and positive vastu vibrations.',
    descTa: 'செம்புத் தகட்டில் நுணுக்கமாக வடிவமைக்கப்பட்ட ஸ்ரீ யந்திரம். உங்கள் பூஜை அறையில் வைப்பதன் மூலம் லட்சுமி தேவியின் அருளைப் பெறலாம்.',
    categoryEn: 'Yantra',
    categoryTa: 'யந்திரங்கள்'
  },
  {
    id: 'natural-emerald',
    nameEn: 'Premium Colombian Emerald (Panna)',
    nameTa: 'பிரீமியம் மரகதக் கல் (பச்சைக்கல்)',
    price: 400,
    descEn: 'Untreated, crystal-clear Colombian emerald governed by Mercury (Budha). Dramatically boosts articulation, financial calculations, commercial intellect, and unlocks hidden creative potential.',
    descTa: 'புத பகவானுக்கு உகந்த இயற்கை மரகதக் கல். வியாபார புத்தி கூர்மை, பேச்சுத் திறன், மற்றும் படைப்புத் திறனை அசுர வேகத்தில் மேம்படுத்தும்.',
    categoryEn: 'Gemstone',
    categoryTa: 'நவரத்தினங்கள்'
  }
];

interface RemedyShopProps {
  walletBalance: number;
  onPurchase: (amount: number, itemDetails: any) => void;
  onOpenWallet: () => void;
  language: 'ta' | 'en';
  theme: 'light' | 'dark';
}

export function RemedyShop({ walletBalance, onPurchase, onOpenWallet, language, theme }: RemedyShopProps) {
  const isLight = theme === 'light';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getProductColor = (id: string) => {
    switch (id) {
      case 'blue-sapphire': return 'from-indigo-600 to-blue-900';
      case 'ek-mukhi-rudraksha': return 'from-amber-800 to-orange-950';
      case 'shree-yantra': return 'from-rose-700 to-amber-800';
      case 'natural-emerald': return 'from-emerald-600 to-teal-900';
      default: return 'from-amber-500 to-amber-700';
    }
  };

  const handleBuy = (item: RemedyItem) => {
    setSuccessMsg(null);
    setErrorMsg(null);

    if (walletBalance < item.price) {
      setErrorMsg(
        language === 'ta'
          ? `போதிய பேலன்ஸ் இல்லை! இந்த உருப்படியை வாங்க மேலும் ₹${item.price - walletBalance} தேவை.`
          : `Insufficient funds! You need ₹${item.price - walletBalance} more in your wallet.`
      );
      return;
    }

    onPurchase(item.price, {
      id: item.id,
      name: language === 'ta' ? item.nameTa : item.nameEn,
      price: item.price,
      date: new Date().toLocaleString()
    });

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSuccessMsg(
      language === 'ta'
        ? `${item.nameTa} வெற்றிகரமாக வாங்கப்பட்டது! அது உங்கள் வீட்டு முகவரிக்கு வேத பூஜைக்கு பின் அனுப்பப்படும்.`
        : `Successfully purchased ${item.nameEn}! Your energized item is being prepared for sacred shipment.`
    );
  };

  const categories = ['all', 'gemstone', 'beads', 'yantra'];

  const filteredProducts = activeCategory === 'all' 
    ? REMEDY_PRODUCTS 
    : REMEDY_PRODUCTS.filter(p => p.categoryEn.toLowerCase() === activeCategory);

  return (
    <div id="remedy-shop-content" className="space-y-6 animate-fade-in">
      {/* Shop Banner header */}
      <div className={`p-6 rounded-3xl border ${
        isLight 
          ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-500/25 text-[#2C241E] shadow-md" 
          : "bg-gradient-to-r from-[#08061a] via-[#180e3c] to-[#3f190b] border-amber-500/25 text-white shadow-2xl"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500">
              <ShoppingBag className="h-5 w-5 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">✦ Divine Remedial Portal</span>
            </div>
            <h2 className="text-2xl font-serif font-bold mt-1 tracking-tight">
              {language === 'ta' ? "பரிகாரக் கடை" : "Astroayan Remedy Shop"}
            </h2>
            <p className={`text-xs mt-1 max-w-xl ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
              {language === 'ta' 
                ? "உங்கள் ஜாதகக் குறைபாடுகளைக் கலைந்து சுபிட்சம் தரும் ஆற்றல் பெற்ற சான்றளிக்கப்பட்ட வேத நவரத்தினங்கள் மற்றும் பக்திப் பொருட்கள்."
                : "Authentic, certified gemstones and divine spiritual accessories energized through Vedic rituals specifically cast in your name."}
            </p>
          </div>
          
          <div className={`flex flex-col items-end p-4 rounded-xl border ${isLight ? "bg-amber-500/5 border-amber-500/20" : "bg-black/35 border-amber-500/20"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>YOUR BALANCE</span>
            <span className="text-xl font-mono font-black text-amber-500 mt-1">₹{walletBalance}</span>
            <button 
              onClick={onOpenWallet}
              className="mt-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wide transition-all"
            >
              + Add Cash
            </button>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeCategory === cat
                ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                : isLight
                  ? "bg-white border-amber-500/10 text-[#2C241E] hover:bg-amber-50"
                  : "bg-[#0b0822] border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {language === 'ta'
              ? cat === 'all' ? 'அனைத்தும்' : cat === 'gemstone' ? 'நவரத்தினங்கள்' : cat === 'beads' ? 'ருத்ராட்சம்' : 'யந்திரங்கள்'
              : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Message alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 animate-fade-in">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
          <button 
            onClick={onOpenWallet}
            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-3 py-1 rounded font-bold uppercase tracking-wider shrink-0"
          >
            Add Now
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((p) => (
          <div 
            key={p.id}
            id={`remedy-card-${p.id}`}
            className={`glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border transition-all hover:scale-[1.01] ${
              isLight ? "bg-white border-amber-500/10" : "bg-[#0b081e] border-amber-500/5"
            }`}
          >
            <div>
              {/* Product graphic card mock */}
              <div className={`h-40 bg-gradient-to-br ${getProductColor(p.id)} relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  {language === 'ta' ? p.categoryTa : p.categoryEn}
                </div>

                {/* Dynamic graphics to look beautiful */}
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center animate-pulse shadow-2xl relative z-10">
                  <span className="text-3xl filter drop-shadow">
                    {p.id === 'blue-sapphire' && '💎'}
                    {p.id === 'ek-mukhi-rudraksha' && '📿'}
                    {p.id === 'shree-yantra' && '🔱'}
                    {p.id === 'natural-emerald' && '✨'}
                  </span>
                </div>

                <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-white/80 font-mono">
                  <Shield className="h-3 w-3 text-amber-400" />
                  100% Certified Energetic
                </div>
              </div>

              {/* Product text description */}
              <div className="p-5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-md font-serif font-bold tracking-tight text-amber-500">
                    {language === 'ta' ? p.nameTa : p.nameEn}
                  </h3>
                  <span className="text-lg font-mono font-black text-amber-500">₹{p.price}</span>
                </div>
                <p className={`text-xs leading-relaxed font-sans ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
                  {language === 'ta' ? p.descTa : p.descEn}
                </p>
              </div>
            </div>

            {/* Buy Action */}
            <div className="px-5 pb-5 pt-1">
              <button
                onClick={() => handleBuy(p)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {language === 'ta' ? "உடனடியாக வாங்கு" : "Order and Energize Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
