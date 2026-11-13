import { useCaptions } from "../audio/captions";
import { useSettingsStore } from "../state/settingsStore";
import "./captions.css";

// Settings → Accessibility → Captions: what you'd hear, written at the bottom
// of the screen. Visual only (screen readers would just get spammed).
function Captions() {
  const on = useSettingsStore((s) => s.captions);
  const { jingle, music, clip, effect } = useCaptions();
  if (!on) return null;

  const playing = clip ?? jingle ?? music;
  if (!playing && !effect) return null;

  return (
    <div className="captions" aria-hidden="true">
      {playing && <p>{playing}</p>}
      {effect && <p className="captions-effect">{effect}</p>}
    </div>
  );
}

export default Captions;
