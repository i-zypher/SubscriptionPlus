import { useState, useEffect } from "react";
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
    <label>
      {label}: {value}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
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
    <div>
      <p>{label}</p>
      {options.map((value) => (
        <label key={value}>
          <input
            type="radio"
            name={setting}
            checked={current === value}
            onChange={() => {
              setChoice(setting, value);
              playSuccessTone();
            }}
          />
          {value}
        </label>
      ))}
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
    <label>
      <input
        type="checkbox"
        checked={isOn}
        onChange={() => {
          toggleSetting(setting);
          playSuccessTone();
        }}
      />
      {label}
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
    <div>
      <label>
        <input type="checkbox" checked={on} onChange={handleChange} />
        {label}
      </label>
      {(flipped || refused) && flipMessage && <p>{flipMessage}</p>}
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
    <div>
      <label>
        {label}: {value}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onPointerUp={handleRelease}
          onKeyUp={handleRelease}
        />
      </label>
      {snapped && flipMessage && <p>{flipMessage}</p>}
    </div>
  );
}

const swatchStyle = {
  width: "7dvw",
  aspectRatio: "1",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
};

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
    <div style={{ position: "relative" }}>
      <button
        aria-label={`Color option ${index + 1}`}
        style={{ ...swatchStyle, background: color }}
        onClick={handleClick}
      />
      {showLocked && (
        <span
          style={{
            position: "absolute",
            top: "-28px",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          Plus+ members only
        </span>
      )}
    </div>
  );
}

function ExitSwatch({ color, index }: { color: string; index: number }) {
  const goToStage = useGameStore((state) => state.goToStage);

  return (
    <div style={{ position: "relative" }}>
      <button
        aria-label={`Color option ${index + 1}`}
        style={{ ...swatchStyle, background: color }}
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
    <div>
      <button onClick={handleBack}>← Back</button>
      <h2>Settings</h2>

      {settingsSections.map((section) => (
        <div key={section.title}>
          <h3>{section.title}</h3>
          <div
            style={
              section.layout === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                    paddingTop: "32px",
                  }
                : undefined
            }
          >
            {section.options.map((option, i) => (
              <OptionView key={i} option={option} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SettingsScreen;