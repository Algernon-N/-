
import React, { useState, useRef, useEffect } from 'react';
import { Scene } from './components/Scene';
import { generateChristmasWish } from './services/geminiService';
import { useHandTracker } from './hooks/useHandTracker';
import { 
  Sparkles, 
  Heart, 
  Snowflake, 
  Zap, 
  Info, 
  Minimize2, 
  Maximize2,
  Star, 
  Image as ImageIcon, 
  Camera,
  Hand,
  Gift
} from 'lucide-react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, isReady: isTrackerReady } = useHandTracker(videoRef);
  
  const [wish, setWish] = useState<string>("Show hand to start...");
  const [loading, setLoading] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const isSpread = handData.gesture === 'open';

  const handleGenerateWish = async () => {
    if (loading) return;
    setLoading(true);
    const newWish = await generateChristmasWish();
    setWish(newWish);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const toggleImage = () => setIsImageEnlarged(!isImageEnlarged);

  const cursorStyle: React.CSSProperties = {
    left: `${(1 - handData.x) * 100}%`,
    top: `${handData.y * 100}%`,
    display: handData.gesture === 'none' ? 'none' : 'block'
  };

  return (
    <div className="relative w-full h-full select-none bg-[#020a05] overflow-hidden">
      <Scene isSpread={isSpread} handRotationY={handData.rotationY} />

      {/* Hand Cursor */}
      <div 
        className={`fixed w-10 h-10 -ml-5 -mt-5 border-2 rounded-full pointer-events-none z-[100] transition-all duration-300 flex items-center justify-center ${
          handData.gesture === 'pinched' ? 'border-amber-400 bg-amber-500/20 scale-75' : 'border-emerald-300 bg-emerald-500/10 scale-100 shadow-[0_0_15px_#10b981]'
        }`}
        style={cursorStyle}
      >
        <div className={`w-2 h-2 rounded-full ${handData.gesture === 'pinched' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      </div>

      {/* Interface Layer */}
      <div className={`absolute inset-0 transition-all duration-700 pointer-events-none ${isImageEnlarged ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {showUI && (
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 z-10">
            {/* Top Bar - Header (Left) and AI Wish (Right) */}
            <header className="flex justify-between items-start w-full">
              {/* Logo / Title */}
              <div className="space-y-1 pointer-events-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
                  <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-500 to-amber-500 tracking-tighter uppercase italic drop-shadow-sm">
                    Evergreen
                  </h1>
                </div>
                <div className="flex items-center space-x-3 pl-4">
                    <p className="text-emerald-500/50 text-[10px] md:text-xs font-mono uppercase tracking-[0.4em]">
                    {isSpread ? 'STARFIELD_ACTIVE' : 'TREE_GATHERED'}
                    </p>
                </div>
              </div>

              {/* AI Wish Label (Top Right) */}
              <div className="max-w-xs md:max-w-md pointer-events-auto mt-4">
                 <div className="relative group cursor-pointer" onClick={handleGenerateWish}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-amber-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative px-6 py-5 bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl shadow-2xl transition-all hover:border-emerald-500/40">
                      {loading ? (
                          <div className="flex items-center space-x-2">
                              <Zap className="text-amber-400 w-4 h-4 animate-pulse" />
                              <p className="text-emerald-300 font-mono text-[10px] tracking-widest uppercase animate-pulse">Invoking festive code...</p>
                          </div>
                      ) : (
                          <div className="space-y-3 text-right">
                             <p className="text-emerald-100 text-sm md:text-base font-medium leading-relaxed italic">
                                "{wish}"
                             </p>
                             <div className="flex items-center justify-end space-x-2 text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest">
                                <span>Click to refresh blessing</span>
                                <Sparkles className="w-3 h-3 text-amber-500" />
                             </div>
                          </div>
                      )}
                    </div>
                  </div>
              </div>
            </header>

            {/* Bottom Controls */}
            <footer className="flex flex-col md:flex-row justify-between items-end gap-6">
              {/* Hand Tracking Display */}
              <div className="pointer-events-auto bg-black/80 p-1.5 rounded-2xl backdrop-blur-3xl border border-emerald-500/20 shadow-2xl overflow-hidden group">
                <div className="relative w-40 h-28 md:w-56 md:h-40 rounded-xl overflow-hidden bg-emerald-950/20">
                  <video ref={videoRef} autoPlay playsInline className="mirror-video w-full h-full object-cover opacity-60" />
                  {!cameraActive && (
                    <button 
                      onClick={startCamera} 
                      className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500/80 space-y-2 hover:bg-emerald-500/10 transition-colors"
                    >
                        <Camera className="w-8 h-8 animate-pulse" />
                        <span className="text-[9px] font-mono tracking-widest uppercase">Start Neural Interface</span>
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center space-x-2">
                        <Hand className={`w-3.5 h-3.5 ${handData.gesture !== 'none' ? 'text-emerald-400' : 'text-gray-700'}`} />
                        <span className="text-[9px] text-emerald-500/70 font-mono uppercase tracking-[0.2em]">
                            {handData.gesture === 'none' ? 'Scanning...' : 'Locked'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                      <ImageIcon onClick={toggleImage} className="w-3.5 h-3.5 text-emerald-500/40 hover:text-emerald-300 cursor-pointer transition-colors" />
                    </div>
                </div>
              </div>

              {/* Status / Instruction Labels */}
              <div className="text-right pointer-events-auto space-y-3">
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex gap-2">
                        <div className="bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-2">
                            <Hand className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] text-amber-200 uppercase tracking-widest">Pinch to Gather</span>
                        </div>
                        <div className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                            <Star className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] text-emerald-200 uppercase tracking-widest">Open to Spread</span>
                        </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <Gift className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">Gifts Processed</span>
                      </div>
                      <Heart className="w-6 h-6 text-red-600 fill-red-600 shadow-[0_0_15px_#dc2626]" />
                  </div>
              </div>
            </footer>
          </div>
        )}
      </div>

      {/* Memory Layer */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-700 ${isImageEnlarged ? 'opacity-100 pointer-events-auto scale-100 backdrop-blur-3xl' : 'opacity-0 pointer-events-none scale-150'}`}>
        <div className="absolute inset-0 bg-emerald-950/30" onClick={toggleImage}></div>
        <div className="relative w-[85vw] max-w-5xl aspect-[16/9] bg-black rounded-[2.5rem] overflow-hidden border border-emerald-500/30 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#020a05] via-[#051a0b] to-[#0a2e16] flex items-center justify-center">
                <div className="text-center space-y-8">
                    <div className="relative inline-block">
                        <Snowflake className="w-32 h-32 text-emerald-100 mx-auto animate-[spin_12s_linear_infinite] opacity-60 filter blur-[1px]" />
                        <Sparkles className="absolute inset-0 w-full h-full text-amber-400 animate-pulse scale-150" />
                    </div>
                    <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                        Regal Cyber
                    </h2>
                    <p className="text-amber-500 font-mono text-sm tracking-[1em] uppercase">Evergreen_Protocol_2025</p>
                </div>
            </div>
            <button onClick={toggleImage} className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/5 hover:bg-emerald-600 text-white flex items-center justify-center transition-all backdrop-blur-xl border border-white/10 group">
                <Minimize2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};

export default App;
