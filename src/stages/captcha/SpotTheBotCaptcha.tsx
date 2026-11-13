import { useState, useRef, useEffect } from "react";
import type { PointerEvent, WheelEvent } from "react";
import { playSuccessTone, playFailureTone } from "../../audio/sounds";
import { VerifiedHumanUpsell } from "./VerifiedHumanUpsell";
import type { CaptchaProps } from "./VerifiedHumanUpsell";
import { pickSpotTheBotScene, spotTheBotSrc } from "./spotTheBotScenes";
import type { BotBox } from "./spotTheBotScenes";

// A crowded scene with a robot hiding in it. Pinch or use the buttons to
// zoom, drag to look around, tap the bot.

const MAX_ZOOM = 6;
const TAP_SLOP_PX = 8; // more movement than this is a drag, not a tap
const HIT_PADDING = 1; // percent of the image, so taps near the edge still count
const MAX_MISSES = 6;

const MISS_TAUNTS = [
  "That's Gary. Gary has a mortgage.",
  "That's Linda. She's been here since 2009.",
  "That's a human. Probably.",
  "Not a robot. Just a very tired man.",
  "That person has feelings. Rude.",
  "Close! That's someone who's been on hold for years.",
  "That's a mannequin. Different department.",
];

type View = { scale: number; x: number; y: number };

function hits(box: BotBox, px: number, py: number) {
  return (
    px >= box.x - HIT_PADDING &&
    px <= box.x + box.w + HIT_PADDING &&
    py >= box.y - HIT_PADDING &&
    py <= box.y + box.h + HIT_PADDING
  );
}

function SpotTheBotCaptcha({ onPass }: CaptchaProps) {
  const [scene] = useState(pickSpotTheBotScene);
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [found, setFound] = useState<BotBox | null>(null);
  const [misses, setMisses] = useState(0);
  const [taunt, setTaunt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, moved: false, pinchDistance: 0 });

  const botCount = scene.bots.length;

  useEffect(() => {
    if (!found) return;
    const timer = setTimeout(onPass, 1400);
    return () => clearTimeout(timer);
  }, [found, onPass]);

  // Keep the picture covering the frame so you can't drag it off screen
  function clamp(next: View): View {
    const frame = frameRef.current;
    if (!frame) return next;
    const { width, height } = frame.getBoundingClientRect();
    const scale = Math.min(MAX_ZOOM, Math.max(1, next.scale));
    return {
      scale,
      x: Math.min(0, Math.max(width - width * scale, next.x)),
      y: Math.min(0, Math.max(height - height * scale, next.y)),
    };
  }

  // Zoom so the point under (cx, cy) stays put
  function zoomAt(factor: number, cx: number, cy: number) {
    setView((v) => {
      const scale = Math.min(MAX_ZOOM, Math.max(1, v.scale * factor));
      const ratio = scale / v.scale;
      return clamp({ scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio });
    });
  }

  function zoomCenter(factor: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const { width, height } = frame.getBoundingClientRect();
    zoomAt(factor, width / 2, height / 2);
  }

  function localPoint(e: PointerEvent<HTMLDivElement> | WheelEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleTap(fx: number, fy: number) {
    const frame = frameRef.current;
    if (!frame || found) return;
    const { width, height } = frame.getBoundingClientRect();
    // Frame position → percent of the image
    const px = ((fx - view.x) / view.scale / width) * 100;
    const py = ((fy - view.y) / view.scale / height) * 100;

    const bot = scene.bots.find((box) => hits(box, px, py));
    if (bot) {
      playSuccessTone();
      setTaunt(null);
      setFound(bot);
      return;
    }

    playFailureTone();
    const nextMisses = misses + 1;
    setMisses(nextMisses);
    if (nextMisses >= MAX_MISSES) {
      setFailed(true);
      return;
    }
    const options = MISS_TAUNTS.filter((t) => t !== taunt);
    setTaunt(options[Math.floor(Math.random() * options.length)]);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = localPoint(e);
    pointers.current.set(e.pointerId, point);
    if (pointers.current.size === 1) {
      gesture.current = { startX: point.x, startY: point.y, moved: false, pinchDistance: 0 };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.moved = true; // a pinch is never a tap
      gesture.current.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    const point = localPoint(e);
    pointers.current.set(e.pointerId, point);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.current.pinchDistance > 0) {
        zoomAt(distance / gesture.current.pinchDistance, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      gesture.current.pinchDistance = distance;
      return;
    }

    const { startX, startY } = gesture.current;
    if (Math.hypot(point.x - startX, point.y - startY) > TAP_SLOP_PX) {
      gesture.current.moved = true;
    }
    if (gesture.current.moved) {
      const dx = point.x - previous.x;
      const dy = point.y - previous.y;
      setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const wasOnlyPointer = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (wasOnlyPointer && !gesture.current.moved) {
      const point = localPoint(e);
      handleTap(point.x, point.y);
    }
    if (pointers.current.size < 2) gesture.current.pinchDistance = 0;
  }

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    const point = localPoint(e);
    zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, point.x, point.y);
  }

  if (failed) {
    return (
      <VerifiedHumanUpsell
        onRetry={() => {
          setFailed(false);
          setMisses(0);
          setTaunt(null);
        }}
        onPass={onPass}
      />
    );
  }

  return (
    <div>
      <p>
        <strong>Spot the Bot.</strong> Tap the robot hiding {scene.name}.
        {botCount > 1 && ` (There are ${botCount}. Any one will do.)`}
      </p>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
          aspectRatio: "2576 / 1438",
          overflow: "hidden",
          touchAction: "none", // we handle pinch and drag ourselves
          cursor: view.scale > 1 ? "grab" : "zoom-in",
          border: "2px solid #ccc",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "0 0",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          <img
            src={spotTheBotSrc(scene.id)}
            alt="A crowded scene with a robot hidden somewhere in it"
            draggable={false}
            style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
          />
          {found && (
            <div
              style={{
                position: "absolute",
                left: `${found.x}%`,
                top: `${found.y}%`,
                width: `${found.w}%`,
                height: `${found.h}%`,
                border: `${3 / view.scale}px solid #1db954`,
                borderRadius: "8px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
              }}
            />
          )}
        </div>
      </div>
      <p style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
        <button type="button" onClick={() => zoomCenter(1.5)} aria-label="Zoom in">
          ＋
        </button>
        <button type="button" onClick={() => zoomCenter(1 / 1.5)} aria-label="Zoom out">
          －
        </button>
        <button type="button" onClick={() => setView({ scale: 1, x: 0, y: 0 })}>
          Reset
        </button>
      </p>
      {found && <p>🤖 Bot spotted. Suspiciously good at this, aren't you?</p>}
      {!found && taunt && <p>{taunt}</p>}
    </div>
  );
}

export default SpotTheBotCaptcha;
