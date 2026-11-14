import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";
import { playJingleOnce, pauseJingle } from "../../audio/jinglePlayer";

// The first time the player reaches Home each run, this run's jingle plays all
// the way through before the hold music comes back.
function JingleIntro() {
  const jingleVersion = useGameStore((state) => state.jingleVersion);
  const setJingleIntro = useGameStore((state) => state.setJingleIntro);
  const setMusicPaused = useGameStore((state) => state.setMusicPaused);

  useEffect(() => {
    if (!jingleVersion) return;
    if (useGameStore.getState().jingleIntro === "done") return;

    setJingleIntro("playing");
    setMusicPaused(true);
    playJingleOnce(jingleVersion, () => {
      setJingleIntro("done");
      setMusicPaused(false);
    });

    // Off to the CAPTCHAs mid-song: the song keeps going (BackgroundMusic ends
    // it if the game moves on past them). Anywhere else: stop it, and finish
    // the song next time they're back.
    return () => {
      const { jingleIntro, currentStage } = useGameStore.getState();
      if (jingleIntro === "playing" && currentStage !== "captcha") {
        pauseJingle();
        setMusicPaused(false);
        setJingleIntro("pending");
      }
    };
  }, [jingleVersion, setJingleIntro, setMusicPaused]);

  return null;
}

export default JingleIntro;
