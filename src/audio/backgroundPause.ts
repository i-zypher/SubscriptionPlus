// Leaving the app (or switching tabs) pauses all of the game's audio, and
// coming back resumes exactly what was playing. Phones otherwise keep the
// music going after you exit.
//
// Every <audio> the game plays goes through HTMLMediaElement.play, so we
// watch that one place instead of editing each player.

import { suspendSounds, resumeSounds } from "./sounds";

const players = new Set<HTMLMediaElement>(); // every audio the game has played
const toResume = new Set<HTMLMediaElement>(); // paused (or held back) by us
let hidden = false;

const realPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
  players.add(this);
  // Something tried to start while we're in the background (an ad burst's
  // jingle, say): hold it until the player comes back.
  if (hidden) {
    toResume.add(this);
    return Promise.resolve();
  }
  return realPlay.call(this);
};

// True while the game is in the background and we paused its audio. Players
// use it to tell our pause apart from the song really stopping.
export function inBackground() {
  return hidden;
}

function goBackground() {
  if (hidden) return;
  hidden = true;
  for (const player of players) {
    if (!player.paused) {
      toResume.add(player);
      player.pause();
    }
  }
  suspendSounds();
}

function comeBack() {
  if (!hidden) return;
  hidden = false;
  for (const player of toResume) realPlay.call(player).catch(() => {});
  toResume.clear();
  resumeSounds();
}

export function startBackgroundPause() {
  document.addEventListener("visibilitychange", () =>
    document.visibilityState === "hidden" ? goBackground() : comeBack(),
  );
  // Capacitor's own app events (iOS/Android), in case visibility lags
  document.addEventListener("pause", goBackground);
  document.addEventListener("resume", comeBack);
}
