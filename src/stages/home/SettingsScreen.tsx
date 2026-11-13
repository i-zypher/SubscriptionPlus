import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import "./settings.css";
import { settingsSections } from "./settingsContent";
import type { SettingOption } from "./settingsContent";
import { useSettingsStore } from "../../state/settingsStore";
import type {
  ToggleSettingKey,
  ChoiceSettingKey,
  SliderSettingKey,
} from "../../state/settingsStore";
import { useGameStore } from "../../state/gameStore";
import { playSuccessTone, playFailureTone } from "../../audio/sounds";



function SliderControl({
  label,
  setting,
  min,
  max,
}: {
  label: string;
  setting: SliderSettingKey;
  min: number;
  max: number;
}) {
  const value = useSettingsStore((state) => state[setting]);
  const setSlider = useSettingsStore((state) => state.setSlider);

  return (
    <label className="set-row set-slider">
      <span className="set-row-top">
        <span>{label}</span>
        <span className="set-value">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
        onChange={(e) => setSlider(setting, Number(e.target.value))}
        onPointerUp={playSuccessTone}
        onKeyUp={playSuccessTone}
      />
    </label>
  );
}

function ChoiceControl({
  label,
  setting,
  options,
}: {
  label: string;
  setting: ChoiceSettingKey;
  options: string[];
}) {
  const current = useSettingsStore((state) => state[setting]);
  const setChoice = useSettingsStore((state) => state.setChoice);

  return (
    <div className="set-row set-choice">
      <span>{label}</span>
      <div className="set-segments" role="radiogroup" aria-label={label}>
        {options.map((value) => (
          <button
            key={value}
            role="radio"
            aria-checked={current === value}
            className={current === value ? "is-on" : ""}
            onClick={() => {
              setChoice(setting, value);
              playSuccessTone();
            }}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

function RealToggle({
  label,
  setting,
}: {
  label: string;
  setting: ToggleSettingKey;
}) {
  const isOn = useSettingsStore((state) => state[setting]);
  const toggleSetting = useSettingsStore((state) => state.toggleSetting);

  return (
    <label className="set-row">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        className="set-switch"
        checked={isOn}
        onChange={() => {
          toggleSetting(setting);
          playSuccessTone();
        }}
      />
    </label>
  );
}

function FakeToggle({
  label,
  startsOn,
  flipMessage,
  refuses,
}: {
  label: string;
  startsOn: boolean;
  flipMessage?: string;
  refuses?: boolean;
}) {
  const addDesperation = useGameStore((state) => state.addDesperation);
  const [on, setOn] = useState(startsOn);
  const [refused, setRefused] = useState(false);
  const flipped = on !== startsOn;

  useEffect(() => {
    if (!refused) return;
    const timeout = setTimeout(() => setRefused(false), 3000);
    return () => clearTimeout(timeout);
  }, [refused]);

  function handleChange() {
    playFailureTone();
    addDesperation();
    if (refuses) {
      setRefused(true);
    } else {
      setOn((prev) => !prev);
    }
  }

  return (
    <div className="set-item">
      <label className="set-row">
        <span>{label}</span>
        <input
          type="checkbox"
          role="switch"
          className={`set-switch${refused ? " is-refused" : ""}`}
          checked={on}
          onChange={handleChange}
        />
      </label>
      {(flipped || refused) && flipMessage && <p className="set-note">{flipMessage}</p>}
    </div>
  );
}


function FakeSlider({
  label,
  snapsBackTo,
  flipMessage,
}: {
  label: string;
  snapsBackTo: number;
  flipMessage?: string;
}) {
  const addDesperation = useGameStore((state) => state.addDesperation);
  const [value, setValue] = useState(snapsBackTo);
  const [snapped, setSnapped] = useState(false);

  useEffect(() => {
    if (!snapped) return;
    const timeout = setTimeout(() => setSnapped(false), 3000);
    return () => clearTimeout(timeout);
  }, [snapped]);

  function handleRelease() {
    setValue(snapsBackTo);
    setSnapped(true);
    playFailureTone();
    addDesperation();
  }

  return (
    <div className="set-item">
      <label className="set-row set-slider">
        <span className="set-row-top">
          <span>{label}</span>
          <span className="set-value">{value}</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          style={{ "--fill": `${value}%` } as CSSProperties}
          onChange={(e) => setValue(Number(e.target.value))}
          onPointerUp={handleRelease}
          onKeyUp={handleRelease}
        />
      </label>
      {snapped && flipMessage && <p className="set-note">{flipMessage}</p>}
    </div>
  );
}

// Real 3D buttons: a darker "side" underneath that disappears when pressed
function darken(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (shift: number) =>
    Math.max(0, Math.round(((n >> shift) & 255) * (1 - amount)));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function swatchVars(color: string) {
  return {
    "--face": color,
    "--side": darken(color, 0.38),
  } as CSSProperties;
}

function LockedSwatch({ color, index }: { color: string; index: number }) {
  const addDesperation = useGameStore((state) => state.addDesperation);
  const [showLocked, setShowLocked] = useState(false);

  useEffect(() => {
    if (!showLocked) return;
    const timeout = setTimeout(() => setShowLocked(false), 2000);
    return () => clearTimeout(timeout);
  }, [showLocked]);

  function handleClick() {
    addDesperation();
    setShowLocked(true);
    playSuccessTone();
  }

  return (
    <div className="set-swatch-wrap">
      <button
        aria-label={`Color option ${index + 1}`}
        className="set-swatch"
        style={swatchVars(color)}
        onClick={handleClick}
      />
      {showLocked && <span className="set-locked">🔒 Plus+ members only</span>}
    </div>
  );
}

function ExitSwatch({ color, index }: { color: string; index: number }) {
  const goToStage = useGameStore((state) => state.goToStage);

  return (
    <div className="set-swatch-wrap">
      <button
        aria-label={`Color option ${index + 1}`}
        className="set-swatch"
        style={swatchVars(color)}
        onClick={() => {
          playFailureTone();
          goToStage("captcha");
        }}
      />
    </div>
  );
}

function OptionView({ option, index }: { option: SettingOption; index: number }) {
  switch (option.kind) {
    case "toggle":
      return (
        <FakeToggle
          label={option.label}
          startsOn={option.startsOn}
          flipMessage={option.flipMessage}
          refuses={option.refuses}
        />
      );
    case "real-toggle":
      return <RealToggle label={option.label} setting={option.setting} />;
    case "choice":
      return (
        <ChoiceControl
          label={option.label}
          setting={option.setting}
          options={option.options}
        />
      );
    case "slider":
      return (
        <SliderControl
          label={option.label}
          setting={option.setting}
          min={option.min}
          max={option.max}
        />
      );
    case "fake-slider":
      return (
        <FakeSlider
          label={option.label}
          snapsBackTo={option.snapsBackTo}
          flipMessage={option.flipMessage}
        />
      );
    case "locked":
      return <LockedSwatch color={option.color} index={index} />;
    case "exit":
      return <ExitSwatch color={option.color} index={index} />;
  }
}

function SettingsScreen({ onClose }: { onClose: () => void }) {
  function handleBack() {
    playFailureTone();
    onClose();
  }

  return (
    <div className="set">
      <div className="set-inner">
        <header className="set-top">
          <button className="set-back" onClick={handleBack}>
            ‹ Back
          </button>
        </header>
        <h2>Settings</h2>

        {settingsSections.map((section) => (
          <section key={section.title} className="set-section">
            <h3>{section.title}</h3>
            <div className={section.layout === "grid" ? "set-grid" : "set-group"}>
              {section.options.map((option, i) => (
                <OptionView key={i} option={option} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default SettingsScreen;