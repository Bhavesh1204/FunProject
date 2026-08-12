import Barbar from "./assets/barber1.jpg";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, ExternalLink } from "lucide-react";

/* ============================================================
   FONTS + EFFECTS
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600&family=Special+Elite&display=swap');
    .font-display { font-family: 'Fraunces', serif; }
    .font-ui { font-family: 'Work Sans', sans-serif; }
    .font-stamp { font-family: 'Special Elite', monospace; }
    @keyframes reelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes slideUp {
      from { transform: translate(-50%, 16px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .reel { animation: reelSpin 2.4s linear infinite; }
    .glass-pill {
      background: rgba(20, 14, 10, 0.55);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.45);
    }
    .pill-enter { animation: slideUp 0.4s ease-out; }
  `}</style>
);

/* ============================================================
   DATA — real track IDs (needed for real playback + artwork)
   ============================================================ */
const BACKGROUND_IMAGE_URL = Barbar;
const SPOTIFY_PLAYLIST_URL = import.meta.env.VITE_SPOTIFY_PLAYLIST_URL

const ENV_INFO = {
  tag: "MEN'S HAIR CUTTING SALOON", 
  place: "Lucknow • 2001",
  line: "The mirror has a crack. The cassette doesn't.",
};

const SONGS = [
  { title: "Pehla Nasha", artist: "Udit Narayan, Sadhana Sargam", trackId: "6cCSo8zu3bRck519ZqRGfk" },
  { title: "Yeh Kaali Kaali Aankhen", artist: "Ritesh Kumar", trackId: "5Y5RgC7r4PR7bXpHFPkZY6" },
  { title: "Tu Hi Meri Shab Hai", artist: "Pritam, KK", trackId: "55EKNmIHPp3ejwwe3FlAKx" },
  { title: "Ole Ole", artist: "Abhijeet, Sameer Anjaan", trackId: "4cHkNpAIlCFbNQKGHfMVaw" },
  { title: "Ghar Se Nikalte Hi", artist: "Amaal Mallik, Armaan Malik", trackId: "1Dw8GkFpFjUpNTUpfF5lee" },
  { title: "Aankhon Mein Base Ho Tum", artist: "Anu Malik, Alka Yagnik, Abhijeet", trackId: "2gcxE9tLP1pAnK5Np1MVKp" },
  { title: "Do Dil Mil Rahe Hai", artist: "Kumar Sanu", trackId: "7qzsNpJvOR8attSueN3zqq" },
  { title: "Kaho Naa Pyar Hai", artist: "Udit Narayan, Alka Yagnik", trackId: "2uTjTDdPoshZ2S3vnYiSPT" },
  { title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu, R. D. Burman", trackId: "3rLSVdt9C2Pg2jo90oltnU" },
  { title: "Roop Suhana Lagta Hai", artist: "S. P. Balasubrahmanyam, K. S. Chithra", trackId: "2C1dpBqWm9qJc5bGJvRWB9" },
  { title: "Meri Pant Bhi Sexy", artist: "Govinda, Alka Yagnik", trackId: "2UhM3YgYQTmhcp1v9RLHyU" },
  { title: "Tan Tana Tan Tan", artist: "Abhijeet, Poornima", trackId: "7a3KIYVlTcT7n7bRLGJAM7" },
];

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ============================================================
   ALBUM ART — fetched via Spotify's public oEmbed endpoint.
   No API key needed, works for any public track.
   ============================================================ */
function useArtwork(songs) {
  const [artwork, setArtwork] = useState({});

  useEffect(() => {
    let cancelled = false;
    songs.forEach(async (s) => {
      try {
        const res = await fetch(
          `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${s.trackId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.thumbnail_url) {
          setArtwork((prev) => ({ ...prev, [s.trackId]: data.thumbnail_url }));
        }
      } catch {
        /* silently fall back to placeholder */
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return artwork;
}

/* ============================================================
   HIDDEN SPOTIFY PLAYBACK CONTROLLER (iFrame API)
   No credentials needed — this is the public embed control API.
   ============================================================ */
function useSpotifyController(initialTrackId, onUpdate) {
  const controllerRef = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!initialTrackId) return;

    function setup(IFrameAPI) {
      if (!containerRef.current || controllerRef.current) return;
      IFrameAPI.createController(
        containerRef.current,
        { uri: `spotify:track:${initialTrackId}`, width: "1", height: "1" },
        (EmbedController) => {
          controllerRef.current = EmbedController;
          setReady(true);
          EmbedController.addListener("playback_update", (e) => onUpdate(e.data));
        }
      );
    }

    if (window.Spotify && window.Spotify.Iframe) {
      setup(window.Spotify.Iframe);
      return;
    }
    const prevReady = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (prevReady) prevReady(IFrameAPI);
      setup(IFrameAPI);
    };
    if (!document.getElementById("spotify-iframe-api-script")) {
      const script = document.createElement("script");
      script.id = "spotify-iframe-api-script";
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackId]);

  const loadTrack = useCallback((trackId) => {
    if (!controllerRef.current) return;
    controllerRef.current.loadUri(`spotify:track:${trackId}`);
    controllerRef.current.play();
  }, []);

  const togglePlay = useCallback(() => {
    if (!controllerRef.current) return;
    controllerRef.current.togglePlay();
  }, []);

  const seekTo = useCallback((seconds) => {
    if (!controllerRef.current) return;
    controllerRef.current.seek(seconds);
  }, []);

  return { containerRef, ready, loadTrack, togglePlay, seekTo };
}

/* ============================================================
   PILL PLAYER
   ============================================================ */
const PillPlayer = ({
  song,
  artworkUrl,
  isPlaying,
  ready,
  position,
  duration,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onOpenSpotify,
}) => {
  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const remaining = duration > 0 ? duration - position : 0;

  const handleBarClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div
      className="pill-enter glass-pill rounded-full flex items-center gap-2 pl-2 pr-3 py-2 md:pl-2.5 md:pr-4 md:py-2.5"
      style={{ maxWidth: 440, width: "calc(100% - 2rem)" }}
    >
      <div
        className={`w-10 h-10 md:w-11 md:h-11 rounded-full shrink-0 overflow-hidden flex items-center justify-center ${isPlaying ? "reel" : ""}`}
        style={{ background: "linear-gradient(135deg, #C97A3D, #2E2118)" }}
      >
        {artworkUrl ? (
          <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#EDE4D2]/80" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-ui text-[13px] md:text-sm text-[#F5EFE4] font-medium truncate leading-tight">
            {song.title}
          </p>
          <span className="font-stamp text-[10px] text-[#F5EFE4]/45 shrink-0">
            -{formatTime(remaining)}
          </span>
        </div>
        <p className="font-ui text-[11px] md:text-xs text-[#F5EFE4]/55 truncate leading-tight mb-1">
          {song.artist}
        </p>
        <div
          onClick={handleBarClick}
          className="h-1 rounded-full bg-[#F5EFE4]/15 cursor-pointer overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-[#D4A94C]"
            style={{ width: `${pct}%`, transition: "width 0.25s linear" }}
          />
        </div>
      </div>

      <button
        onClick={onPrev}
        disabled={!ready}
        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#F5EFE4]/70 hover:text-[#F5EFE4] transition-colors shrink-0 disabled:opacity-30"
        aria-label="Previous"
      >
        <SkipBack size={15} fill="currentColor" />
      </button>

      <button
        onClick={onPlayPause}
        disabled={!ready}
        className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#D4A94C] text-[#1D140D] hover:bg-[#C97A3D] transition-colors shrink-0 disabled:opacity-40"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      <button
        onClick={onNext}
        disabled={!ready}
        className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[#F5EFE4]/70 hover:text-[#F5EFE4] transition-colors shrink-0 disabled:opacity-30"
        aria-label="Next"
      >
        <SkipForward size={15} fill="currentColor" />
      </button>

      <div className="w-px h-5 bg-[#F5EFE4]/15 shrink-0 mx-0.5" />

      <button
        onClick={onOpenSpotify}
        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1DB954] hover:scale-110 transition-transform shrink-0"
        aria-label="Open playlist on Spotify"
        title="Open on Spotify"
      >
        <ExternalLink size={18} />
      </button>
    </div>
  );
};

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const artwork = useArtwork(SONGS);

  const handleUpdate = useCallback((data) => {
    if (typeof data.isPaused === "boolean") setIsPlaying(!data.isPaused);
    if (typeof data.position === "number") setPosition(data.position);
    if (typeof data.duration === "number") setDuration(data.duration);
  }, []);

  const { containerRef, ready, loadTrack, togglePlay, seekTo } = useSpotifyController(
    SONGS[0].trackId,
    handleUpdate
  );

  const song = SONGS[index];

  const goTo = (newIndex) => {
    setIndex(newIndex);
    setPosition(0);
    loadTrack(SONGS[newIndex].trackId);
  };
  const next = () => goTo((index + 1) % SONGS.length);
  const prev = () => goTo((index - 1 + SONGS.length) % SONGS.length);
  const openSpotify = () => window.open(SPOTIFY_PLAYLIST_URL, "_blank", "noopener,noreferrer");

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-ui bg-[#1D140D]">
      <GlobalStyle />

      <img
        src={BACKGROUND_IMAGE_URL}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 35%, rgba(15,10,7,0.55) 75%, rgba(10,6,4,0.85) 100%)",
        }}
      />

      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <p className="font-stamp text-[#F5EFE4]/80 text-xs tracking-[0.3em] uppercase mb-1">
          {ENV_INFO.tag}
        </p>
        <h1 className="font-display italic text-[#F5EFE4] text-2xl md:text-4xl drop-shadow-lg">
          {ENV_INFO.place}
        </h1>
        <p className="font-ui text-[#F5EFE4]/60 text-sm mt-1">{ENV_INFO.line}</p>
      </div>

      <div className="fixed bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex justify-center w-full px-4">
        <PillPlayer
          song={song}
          artworkUrl={artwork[song.trackId]}
          isPlaying={isPlaying}
          ready={ready}
          position={position}
          duration={duration}
          onPlayPause={togglePlay}
          onPrev={prev}
          onNext={next}
          onSeek={seekTo}
          onOpenSpotify={openSpotify}
        />
      </div>

      {/* hidden Spotify embed — this is what actually plays audio */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          bottom: 0,
          left: 0,
        }}
      />
    </div>
  );
}
