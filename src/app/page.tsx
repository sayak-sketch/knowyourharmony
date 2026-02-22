"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { 
  Search, Play, Pause, Disc3, Music, AudioLines, Share2, Clock
} from "lucide-react";
// NEW: Importing the modern image library
import { toPng } from "html-to-image";

interface RecommendedTrack {
  title: string;
  artist: string;
  coverUrl: string | null;
  previewUrl: string | null;
}

interface AnalysisResult {
  genre: string;
  category: string;
  mood: string;
  lyricalEssence: string;
  story: string;
  themes: string[];
  hexColor: string;
  searchedTrack: RecommendedTrack;
  recommendations: RecommendedTrack[];
}

interface RecentSearch {
  title: string;
  coverUrl: string;
}

export default function Home() {
  const [song, setSong] = useState<string>("");
  const [artist, setArtist] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kyh_recent");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveToRecent = (track: RecommendedTrack) => {
    if (!track.coverUrl) return;
    const newEntry = { title: track.title, coverUrl: track.coverUrl };
    const updated = [newEntry, ...recentSearches.filter(r => r.title !== track.title)].slice(0, 4);
    setRecentSearches(updated);
    localStorage.setItem("kyh_recent", JSON.stringify(updated));
  };

  const handleSearch = async (e?: FormEvent<HTMLFormElement>, quickSearchTitle?: string) => {
    if (e) e.preventDefault();
    const searchTarget = quickSearchTitle || song;
    if (!searchTarget) return;
    
    if (playingAudio) {
      playingAudio.pause();
      setPlayingUrl(null);
    }
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: searchTarget, artist }),
      });
      
      if (!res.ok) throw new Error("Failed to analyze track");
      
      const data: AnalysisResult = await res.json();
      setResult(data);
      saveToRecent(data.searchedTrack);
    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing the track.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (url: string) => {
    if (playingUrl === url) {
      playingAudio?.pause();
      setPlayingUrl(null);
    } else {
      if (playingAudio) playingAudio.pause();
      const newAudio = new Audio(url);
      newAudio.play();
      setPlayingAudio(newAudio);
      setPlayingUrl(url);
      newAudio.onended = () => {
        setPlayingUrl(null);
        setPlayingAudio(null);
      };
    }
  };

  // UPDATED: Now using html-to-image to bypass the lab color error
  const shareResult = async () => {
    if (!captureRef.current) return;
    setIsSharing(true);
    try {
      // Tiny delay to ensure React updates the UI (hiding buttons) before capturing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(captureRef.current, { 
        backgroundColor: '#161621', 
        pixelRatio: 2 
      });
      
      const link = document.createElement("a");
      link.download = `${result?.searchedTrack.title}-DNA.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to share", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden selection:bg-[#E97676]/30">
      
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111119]/90 backdrop-blur-xl transition-all duration-500">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-end gap-2 h-16 text-[#E97676]">
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
            </div>
            <h2 className="text-3xl font-serif text-white animate-pulse tracking-wide">Extracting Sonic DNA...</h2>
          </div>
        </div>
      )}

      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-[#111119]" />
          </div>
          <span className="font-bold text-xl tracking-tight">KnowYourHarmony</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 relative">
            <h1 className="text-6xl md:text-7xl font-serif leading-[1.1] mb-6 animate-slide-up">
              Decode your <br />
              <span className="italic font-serif">Music Taste</span>
            </h1>
            
            {/* UPDATED: New descriptive hero text */}
            <p className="text-gray-400 max-w-md mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              KnowYourHarmony is an AI-powered music intelligence engine. Enter any track below to extract its sonic DNA, uncover its lyrical essence, and discover perfect musical matches.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-md relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex bg-white/5 p-2 rounded-full border border-white/10 backdrop-blur-md focus-within:border-[#E97676]/50 transition-colors">
                <input
                  type="text"
                  placeholder="Song name..."
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  className="bg-transparent flex-1 py-3 px-6 text-white outline-none placeholder:text-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Artist (Opt)"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="bg-transparent w-32 py-3 px-4 text-white outline-none border-l border-white/10 placeholder:text-gray-500 hidden sm:block"
                />
                <button 
                  type="submit" 
                  className="bg-[#E97676] hover:bg-[#d46565] text-white px-8 rounded-full font-medium transition-all flex items-center gap-2"
                >
                  Explore
                </button>
              </div>
            </form>

            {recentSearches.length > 0 && (
              <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  <Clock className="w-4 h-4" /> Recent
                </div>
                <div className="flex gap-4">
                  {recentSearches.map((recent, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSearch(undefined, recent.title)}
                      className="w-12 h-12 rounded-full bg-cover bg-center border border-white/10 cursor-pointer hover:scale-110 hover:border-white/50 transition-all shadow-lg"
                      style={{ backgroundImage: `url(${recent.coverUrl})` }}
                      title={recent.title}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative h-[500px] w-full hidden md:block">
            <div className="absolute top-0 right-10 w-72 h-96 bg-[#E97676] rounded-[2rem] rounded-tr-[5rem] overflow-hidden shadow-2xl flex items-center justify-center animate-slide-up">
               <Music className="w-32 h-32 text-white/20" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-12 left-12 w-48 h-48 bg-[#7C3AED] rounded-full overflow-hidden border-8 border-[#111119] shadow-2xl flex items-center justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Disc3 className="w-24 h-24 text-white/20 animate-[spin_10s_linear_infinite]" />
            </div>
          </div>
        </div>
      </main>

      {result && (
        <section className="bg-[#161621] rounded-t-[3rem] pt-24 pb-32 px-8 min-h-screen border-t border-white/5 relative overflow-hidden">
          
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-[140px] pointer-events-none animate-breathe" 
            style={{ backgroundColor: result.hexColor }} 
          />

          <div className="max-w-7xl mx-auto relative z-10">
            
            <div ref={captureRef} className={`pt-4 pb-8 ${isSharing ? 'px-8 bg-[#161621]' : ''}`}>
              
              <div className="flex items-end justify-between mb-20 animate-slide-up">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">
                  
                  {/* UPDATED: Prominent Genre and Vibe Section */}
                  <div className="col-span-1 lg:col-span-1">
                    <p className="text-gray-400 uppercase tracking-widest text-sm mb-4">Sonic Profile For</p>
                    <h2 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
                      <span style={{ color: result.hexColor }}>{result.searchedTrack.title}</span>
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      {/* Prominent Genre Card */}
                      <div className="bg-[#111119] border border-white/5 p-6 rounded-2xl shadow-xl border-l-4" style={{ borderLeftColor: result.hexColor }}>
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                          <AudioLines className="w-4 h-4" style={{ color: result.hexColor }} /> Sonic Genre
                        </p>
                        <p className="text-2xl font-bold text-white tracking-wide">{result.genre}</p>
                        <p className="text-sm text-gray-400 mt-1">{result.category}</p>
                      </div>

                      {/* Vibe Match Card */}
                      <div className="bg-[#111119] border border-white/5 p-6 rounded-2xl shadow-xl">
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Primary Vibe Match</p>
                        <p className="font-serif italic text-2xl text-white">"{result.mood}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 lg:col-span-2 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-3 mb-8">
                      {result.themes.map((theme, idx) => (
                        <span key={idx} className="px-4 py-2 rounded-full border text-sm text-white/80 shadow-md" style={{ borderColor: `${result.hexColor}40`, backgroundColor: `${result.hexColor}10` }}>
                          {theme}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-3xl font-serif text-white mb-6 leading-snug drop-shadow-md">
                      "{result.lyricalEssence}"
                    </h3>
                    
                    <p className="text-xl text-gray-400 font-serif leading-relaxed italic border-l-4 pl-6" style={{ borderLeftColor: result.hexColor }}>
                      {result.story}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-3xl font-serif">The Original Track</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  
                  {!isSharing && (
                    <button onClick={shareResult} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10">
                      <Share2 className="w-4 h-4" /> Share Profile
                    </button>
                  )}
                </div>
                
                <div 
                  className="group relative h-[28rem] w-full max-w-4xl mx-auto bg-[#1A1A26] rounded-[3rem] overflow-hidden p-10 flex flex-col justify-end border border-white/10 shadow-2xl bg-cover bg-center transition-transform hover:-translate-y-2"
                  style={{ backgroundImage: result.searchedTrack.coverUrl ? `url(${result.searchedTrack.coverUrl})` : 'none' }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-[#09090e]/80 to-transparent" />
                  
                  <div className="relative z-10 flex items-end justify-between">
                    <div>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wider uppercase mb-4 text-white">Source Audio</span>
                      <h3 className="text-4xl md:text-5xl font-bold mb-2 text-white drop-shadow-lg">{result.searchedTrack.title}</h3>
                      <p className="text-gray-300 text-xl drop-shadow-lg font-medium tracking-wide uppercase">{result.searchedTrack.artist}</p>
                    </div>
                    
                    {result.searchedTrack.previewUrl && !isSharing && (
                      <div 
                        onClick={() => togglePlay(result.searchedTrack.previewUrl!)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 ${playingUrl === result.searchedTrack.previewUrl ? 'bg-white text-black' : 'bg-[#E97676] text-white hover:scale-105 hover:bg-[#d46565]'}`}
                      >
                        {playingUrl === result.searchedTrack.previewUrl ? (
                           <div className="flex items-end gap-1 h-6">
                             <div className="eq-bar" />
                             <div className="eq-bar" />
                             <div className="eq-bar" />
                           </div>
                        ) : (
                          <Play className="w-8 h-8 ml-1" fill="currentColor" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-4 mb-10">
                <h3 className="text-3xl font-serif">Sonic Matches</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {result.recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="group relative h-[26rem] bg-[#1A1A26] rounded-[2rem] overflow-hidden p-8 flex flex-col justify-end border border-white/5 transition-transform hover:-translate-y-2 bg-cover bg-center shadow-2xl"
                    style={{ backgroundImage: rec.coverUrl ? `url(${rec.coverUrl})` : 'none' }}
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-[#09090e]/80 to-transparent" />
                    
                    <div className="relative z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {rec.previewUrl && (
                        <div 
                          onClick={() => togglePlay(rec.previewUrl!)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-xl cursor-pointer transition-all duration-300 ${playingUrl === rec.previewUrl ? 'bg-white text-black' : 'bg-[#E97676] text-white hover:scale-110'}`}
                        >
                          {playingUrl === rec.previewUrl ? (
                            <div className="flex items-end gap-[3px] h-4">
                              <div className="eq-bar w-[3px]" />
                              <div className="eq-bar w-[3px]" />
                              <div className="eq-bar w-[3px]" />
                            </div>
                          ) : (
                            <Play className="w-6 h-6 ml-1" fill="currentColor" />
                          )}
                        </div>
                      )}

                      <h3 className="text-2xl font-bold mb-2 truncate text-white drop-shadow-lg">{rec.title}</h3>
                      <p className="text-gray-400 text-sm truncate drop-shadow-lg font-medium tracking-wide uppercase">{rec.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      <footer className="border-t border-white/5 bg-[#111119] py-8 text-center mt-20">
        <p className="text-gray-500 font-serif italic">
  &copy; {new Date().getFullYear()} KnowYourHarmony. Developed by <span className="text-white not-italic font-sans font-medium">Sayak Mukherjee</span>. All rights reserved.
</p>
      </footer>
    </div>
  );
}