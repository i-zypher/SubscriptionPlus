import { create } from "zustand";
import { jingleVersions } from "./jingleVersions";

// What's playing right now, in words. Always kept up to date; the Captions
// bar only shows it when Settings → Accessibility → Captions is on.
type CaptionState = {
  jingle: string | null; // the jingle (intro, ad bursts, Brad's holds)
  music: string | null; // background music
  clip: string | null; // short clips (audio CAPTCHA, game over)
  effect: string | null; // one-off sound effects
};

export const useCaptions = create<CaptionState>(() => ({
  jingle: null,
  music: null,
  clip: null,
  effect: null,
}));

// The short jingle clip (audio CAPTCHA, game over) is this line of the chorus
export const CLIP_LYRIC = '♪ "Subscription Plus! What\'s it do? It renews!" ♪';

export function editionName(version: string | null) {
  return (
    jingleVersions.find((v) => v.id === version)?.edition ?? "Classic Edition"
  );
}

export function captionJingle(version: string | null) {
  useCaptions.setState({
    jingle: version
      ? `♪ The Subscription Plus jingle (${editionName(version)}) ♪`
      : null,
  });
}

export function captionMusic(text: string | null) {
  useCaptions.setState({ music: text });
}

let clipTimer: ReturnType<typeof setTimeout> | undefined;
export function captionClip(text: string, ms: number) {
  clearTimeout(clipTimer);
  useCaptions.setState({ clip: text });
  clipTimer = setTimeout(() => useCaptions.setState({ clip: null }), ms);
}

let effectTimer: ReturnType<typeof setTimeout> | undefined;
export function captionEffect(text: string) {
  clearTimeout(effectTimer);
  useCaptions.setState({ effect: text });
  effectTimer = setTimeout(() => useCaptions.setState({ effect: null }), 1800);
}
