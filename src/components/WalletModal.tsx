import React, { useState } from 'react';
import { X, Shield, CreditCard, Lock, CheckCircle, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUp: (amount: number) => void;
  language: 'ta' | 'en';
  theme: 'light' | 'dark';
}

export function WalletModal({ isOpen, onClose, onTopUp, language, theme }: WalletModalProps) {
  if (!isOpen) return null;
  const isLight = theme === 'light';
  
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('upi');
  const [name, setName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const presets = [100, 250, 500, 1000, 2000];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    
    // Simulate premium secure payment gateway check
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    
    // Hold success message momentarily
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    onTopUp(amount);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        id="wallet-modal-container"
        className={`w-full max-w-md rounded-2xl border p-6 relative shadow-2xl transition-all ${
          isLight 
            ? "bg-[#FFFDF9] border-amber-500/30 text-[#2C241E]" 
            : "bg-[#0c0a24]/95 border-amber-500/25 text-white"
        }`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="h-10 w-10 animate-pulse" />
            </div>
            <h3 className="text-xl font-cinzel font-black text-emerald-500">
              {language === 'ta' ? "பணம் வெற்றிகரமாக சேர்க்கப்பட்டது!" : "Top-up Successful!"}
            </h3>
            <p className={`text-sm ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
              {language === 'ta' 
                ? `₹${amount} உங்கள் கணக்கில் வெற்றிகரமாக சேர்க்கப்பட்டுள்ளது.`
                : `₹${amount} has been successfully added to your celestial wallet.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <div className="inline-flex p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-cinzel font-black text-amber-500 tracking-wide">
                {language === 'ta' ? "நிதியினைச் சேர்" : "Add Funds to Wallet"}
              </h3>
              <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>
                {language === 'ta' ? "பரிகாரங்கள் மற்றும் ஆலோசனைகளைப் பெற கணக்கை நிரப்பவும்." : "Securely fund your wallet for instant remedy shopping & consultations."}
              </p>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>
                {language === 'ta' ? "தொகையைத் தேர்ந்தெடுக்கவும்" : "Select Preset Amount"}
              </label>
              <div className="grid grid-cols-5 gap-1.5 font-mono">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      amount === p && !customAmount
                        ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10"
                        : isLight
                          ? "bg-amber-50/10 border-amber-500/20 text-[#2C241E] hover:bg-amber-50/20"
                          : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>
                {language === 'ta' ? "வேறு ஒரு தொகை (₹)" : "Or Enter Custom Amount (₹)"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-amber-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="E.g. 1500"
                  className={`w-full pl-8 pr-4 py-2 rounded-lg border text-sm font-bold font-mono focus:outline-none focus:border-amber-500 ${
                    isLight ? "bg-white border-amber-500/30 text-[#2C241E]" : "bg-black/40 border-white/10 text-white"
                  }`}
                />
              </div>
            </div>

            {/* Pay Method Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPayMethod('upi')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  payMethod === 'upi'
                    ? "bg-amber-500/15 border-amber-500 text-amber-400"
                    : "border-gray-700/30 text-gray-400"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                UPI ID (Instant)
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  payMethod === 'card'
                    ? "bg-amber-500/15 border-amber-500 text-amber-400"
                    : "border-gray-700/30 text-gray-400"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Debit/Credit Card
              </button>
            </div>

            {/* Pay Method details */}
            <div className="space-y-3">
              {payMethod === 'upi' ? (
                <div>
                  <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>BHIM / GPay UPI ID</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="E.g. ayandev@okhdfcbank"
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none focus:border-amber-500 ${
                      isLight ? "bg-white border-amber-500/30 text-[#2C241E]" : "bg-black/40 border-white/10 text-white"
                    }`}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="E.g. 4321 5678 9876 5432"
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:outline-none focus:border-amber-500 ${
                        isLight ? "bg-white border-amber-500/30 text-[#2C241E]" : "bg-black/40 border-white/10 text-white"
                      }`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.g. Srinivasan"
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:border-amber-500 ${
                        isLight ? "bg-white border-amber-500/30 text-[#2C241E]" : "bg-black/40 border-white/10 text-white"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Secure indicator */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400/80 font-mono">
              <Lock className="h-3 w-3" />
              <span>256-BIT SSL BANK-LEVEL ENCRYPTION SECURED</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#B45309] text-white font-black text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{language === 'ta' ? "சரிபார்க்கிறது..." : "Processing secure payment..."}</span>
                </>
              ) : (
                <span>{language === 'ta' ? `₹${amount} சேர்` : `Authorize Payment of ₹${amount}`}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
