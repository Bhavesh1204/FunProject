import Barbar from "./assets/barber1.jpg";
import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";

/* ============================================================
   FONTS
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600&family=Special+Elite&display=swap');

    .font-display { font-family: 'Fraunces', serif; }
    .font-ui { font-family: 'Work Sans', sans-serif; }
    .font-stamp { font-family: 'Special Elite', monospace; }

    @keyframes reelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes eqBar { 0%, 100% { height: 25%; } 50% { height: 100%; } }
    @keyframes slideUp {
      from { transform: translate(-50%, 16px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes panelIn {
      from { transform: translateY(24px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .reel { animation: reelSpin 2.4s linear infinite; }
    .eq-bar { animation: eqBar 0.8s ease-in-out infinite; }
    .glass-pill {
      background: rgba(20, 14, 10, 0.55);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.45);
    }
    .pill-enter { animation: slideUp 0.4s ease-out; }
    .panel-enter { animation: panelIn 0.25s ease-out; }
  `}</style>
);

/* ============================================================
   SPOTIFY ICON
   ============================================================ */
const SpotifyMark = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.439 1.62.361.181.54.78.302 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.72-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

/* ============================================================
   DATA — swap these for your own
   ============================================================ */

// Swap this for your own photo. Can be a URL, or a local import
// (e.g. `import bgPhoto from "./assets/bus.jpg"` then use bgPhoto here).
const BACKGROUND_IMAGE_URL = Barbar;
const SPOTIFY_PLAYLIST_ID =import.meta.env.VITE_SPOTIFY_PLAYLIST_ID;

const SONGS = [
  { title: "Pehla Nasha", artist: "Udit Narayan, Sadhana Sargam", duration: "4:53" },
  { title: "Yeh Kaali Kaali Aankhen", artist: "Kumar Sanu, Anu Malik", duration: "7:48" },
  { title: "Tu Hi Meri Shab Hai", artist: "K.K.", duration: "6:27" },
  { title: "Ole Ole", artist: "Abhijeet Bhattacharya", duration: "5:10" },
  { title: "Ghar Se Nikalte Hi", artist: "Udit Narayan", duration: "7:31" },
  { title: "Aankhon Mein Base Ho Tum", artist: "Abhijeet, Alka Yagnik", duration: "5:40" },
  { title: "Do Dil Mil Rahe Hain", artist: "Kumar Sanu", duration: "6:40" },
  { title: "Kaho Naa Pyaar Hai", artist: "Hrithik Roshan, Amisha Patel", duration: "7:03" },
  { title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", duration: "4:39" },
  { title: "Roop Suhana Lagta Hai", artist: "Kumar Sanu, Alka Yagnik", duration: "5:26" },
  { title: "Meri Pant Bhi Sexy", artist: "Sonu Nigam, Alka Yagnik", duration: "5:31" },
  { title: "Tan Tana Tan Tan Tan Tara", artist: "Abhijeet, Poornima", duration: "6:37" },
];

/* ============================================================
   FLOATING PILL PLAYER
   ============================================================ */
const PillPlayer = ({ song, isPlaying, onPlayPause, onPrev, onNext, onSpotify }) => (
  <div
    className="pill-enter glass-pill rounded-full flex items-center gap-2 pl-2 pr-2.5 py-2 md:pl-2.5 md:pr-3 md:py-2.5"
    style={{ maxWidth: 420, width: "calc(100% - 2rem)" }}
  >
    {/* artwork */}
    <div
      className="w-10 h-10 md:w-11 md:h-11 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #C97A3D, #2E2118)" }}
    >
      <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#EDE4D2]/80 ${isPlaying ? "reel" : ""}`} />
    </div>

    {/* title / artist */}
    <div className="min-w-0 flex-1">
      <p className="font-ui text-[13px] md:text-sm text-[#F5EFE4] font-medium truncate leading-tight">
        {song.title}
      </p>
      <p className="font-ui text-[11px] md:text-xs text-[#F5EFE4]/55 truncate leading-tight">
        {song.artist}
      </p>
    </div>

    {isPlaying && (
      <div className="hidden sm:flex items-end gap-[2px] h-3 shrink-0 mr-1">
        {[0, 1, 2].map((b) => (
          <span
            key={b}
            className="eq-bar w-[2px] rounded-sm bg-[#D4A94C]"
            style={{ animationDelay: `${b * 0.15}s` }}
          />
        ))}
      </div>
    )}

    {/* controls */}
    <button
      onClick={onPrev}
      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#F5EFE4]/70 hover:text-[#F5EFE4] transition-colors shrink-0"
      aria-label="Previous"
    >
      <SkipBack size={15} fill="currentColor" />
    </button>

    <button
      onClick={onPlayPause}
      className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#D4A94C] text-[#1D140D] hover:bg-[#C97A3D] transition-colors shrink-0"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
    </button>

    <button
      onClick={onNext}
      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#F5EFE4]/70 hover:text-[#F5EFE4] transition-colors shrink-0"
      aria-label="Next"
    >
      <SkipForward size={15} fill="currentColor" />
    </button>

    <div className="w-px h-5 bg-[#F5EFE4]/15 shrink-0 mx-0.5" />

    <button
      onClick={onSpotify}
      className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1DB954] hover:scale-110 transition-transform shrink-0"
      aria-label="Open playlist on Spotify"
    >
      <SpotifyMark className="w-5 h-5" />
    </button>
  </div>
);

/* ============================================================
   SPOTIFY PANEL (slides up from behind the pill)
   ============================================================ */
const SpotifyPanel = ({ onClose, isVisible }) => (
  <div
    className={`fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-28 z-30 bg-[#EDE4D2] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isVisible
        ? "opacity-100 translate-y-0 pointer-events-auto"
        : "opacity-0 translate-y-4 pointer-events-none"
    }`}
    style={{ width: "calc(100% - 2rem)", maxWidth: 420 }}
  >
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2E2118]/10">
      <span className="font-stamp text-[11px] tracking-widest uppercase text-[#2E2118]/60">
        Full Playlist
      </span>

      <button
        onClick={onClose}
        className="text-[#2E2118]/50 hover:text-[#A8434A]"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>

    <iframe
      title="Spotify playlist"
      style={{ border: 0, display: "block" }}
      src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`}
      width="100%"
      height="352"
      allowFullScreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  </div>
);

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);

  const song = SONGS[index];
  const next = () => setIndex((i) => (i + 1) % SONGS.length);
  const prev = () => setIndex((i) => (i - 1 + SONGS.length) % SONGS.length);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-ui bg-[#1D140D]">
      <GlobalStyle />

      {/* full-bleed photo background */}
      <img
        src={BACKGROUND_IMAGE_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* bottom gradient so the pill and title stay legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(15,10,7,0.55) 75%, rgba(10,6,4,0.85) 100%)",
        }}
      />

      {/* location label, top area, subtle */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <p className="font-stamp text-[#F5EFE4]/80 text-xs tracking-[0.3em] uppercase mb-1">
          Bus No. 37
        </p>
        <h1 className="font-display italic text-[#F5EFE4] text-2xl md:text-4xl drop-shadow-lg">
          Mumbai • 1998
        </h1>
      </div>

      {/* floating pill player */}
      <div className="fixed bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex justify-center w-full px-4">
        <PillPlayer
          song={song}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onPrev={prev}
          onNext={next}
          onSpotify={() => setShowSpotify((s) => !s)}
        />
      </div>

      <SpotifyPanel
  onClose={() => setShowSpotify(false)}
  isVisible={showSpotify}
/>
    </div>
  );
}

