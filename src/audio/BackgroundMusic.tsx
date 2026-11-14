import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";
import type { Stage } from "../state/gameStore";
import { useSettingsStore } from "../state/settingsStore";
import { showMusicNowPlaying } from "./mediaSession";
import { captionMusic } from "./captions";
import { finishJingle } from "./jinglePlayer";

function captionFor(track: string) {
  return track.endsWith("glitchy.mp3")
    ? "♪ Hold music, glitching and falling apart ♪"
    : "♪ Smooth, endless hold music ♪";
}

// The first Brad is still a normal chat, so the smooth music carries on from
// the CAPTCHAs. The glitching starts when the second Brad picks up.
function trackFor(stage: Stage, transferCount: number): string | null {
  switch (stage) {
    case "avalanche":
    case "home":
    case "captcha":
      return `${import.meta.env.BASE_URL}audio/background.mp3`;
    case "brad":
      return `${import.meta.env.BASE_URL}audio/${
        transferCount === 0 ? "background" : "glitchy"
      }.mp3`;
    case "endings":
      return `${import.meta.env.BASE_URL}audio/glitchy.mp3`;
    default:
      return null;
  }
}

function musicVolume(master: number, music: number) {
  return (master / 100) * (music / 100);
}

function BackgroundMusic() {
  const stage = useGameStore((state) => state.currentStage);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const music = useSettingsStore((state) => state.music);
  // Quiet while something needs it (the audio CAPTCHA, Brad's holds) or the
  // jingle is playing
  const musicPaused = useGameStore(
    (state) => state.musicPaused || state.jinglePlaying
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const transferCount = useGameStore((state) => state.transferCount);
  const track = trackFor(stage, transferCount);

  // A jingle from home keeps playing through Settings and the CAPTCHAs, and
  // ends when the game moves on (Brad, an ending, a new trial)
  useEffect(() => {
    if (stage !== "home" && stage !== "captcha") finishJingle();
  }, [stage]);

  useEffect(() => {
    if (!track) return;

    const { masterVolume, music } = useSettingsStore.getState();
    const audio = new Audio(track);
    audio.loop = true;
    audio.volume = musicVolume(masterVolume, music);
    const { musicPaused, jinglePlaying } = useGameStore.getState();
    if (!musicPaused && !jinglePlaying) {
      showMusicNowPlaying(track);
      captionMusic(captionFor(track));
      audio.play().catch(() => {});
    }
    audioRef.current = audio;

    return () => {
      audio.pause();
      captionMusic(null);
      audioRef.current = null;
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume(masterVolume, music);
    }
  }, [masterVolume, music]);

  // Pause/resume when something (like the audio CAPTCHA) needs quiet
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPaused) {
      audio.pause();
      captionMusic(null);
    } else {
      showMusicNowPlaying(audio.src);
      captionMusic(captionFor(audio.src));
      audio.play().catch(() => {});
    }
  }, [musicPaused]);

  return null;
}

export default BackgroundMusic;
