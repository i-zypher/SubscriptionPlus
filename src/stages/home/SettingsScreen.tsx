import { settingsSections } from "./settingsContent";
import type { SettingOption } from "./settingsContent";
import { useState } from "react"
import { useEffect } from "react"
import { useSettingsStore } from "../../state/settingsStore"
import type { ToggleSettingKey } from "../../state/settingsStore"
import type { ChoiceSettingKey } from "../../state/settingsStore"

function ChoiceControl({ label, setting, options }: { label: string; setting: ChoiceSettingKey; options: string[] }) {
  const current = useSettingsStore((state) => state[setting])
  const setChoice = useSettingsStore((state) => state.setChoice)

  return (
    <div>
      <p>{label}</p>
      {options.map((value) => (
        <label key={value}>
          <input
            type="radio"
            name={setting}
            checked={current === value}
            onChange={() => setChoice(setting, value)}
          />
          {value}
        </label>
      ))}
    </div>
  )
}


function RealToggle({ label, setting }: { label: string; setting: ToggleSettingKey }) {
  const isOn = useSettingsStore((state) => state[setting])
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)

  return (
    <label>
      <input type="checkbox" checked={isOn} onChange={() => toggleSetting(setting)} />
      {label}
    </label>
  )
}

function FakeToggle({ label, startsOn, flipMessage, refuses }: { label: string; startsOn: boolean; flipMessage?: string; refuses?: boolean }) {
  const [on, setOn] = useState(startsOn)
  const [refused, setRefused] = useState(false)
  const flipped = on !== startsOn

  useEffect(() => {
    if (!refused) return
    const timeout = setTimeout(() => setRefused(false), 3000)
    return () => clearTimeout(timeout)
  }, [refused])

  function handleChange() {
    if (refuses) {
      setRefused(true)
    } else {
      setOn((prev) => !prev)
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
  )
}

function OptionView({ option }: { option: SettingOption }) {
  switch (option.kind) {
    case "toggle":
  return <FakeToggle label={option.label} startsOn={option.startsOn} flipMessage={option.flipMessage} refuses={option.refuses} />
    case "locked":
      return <p>Locked button: {option.color}</p>;
    case "real-toggle":
  return <RealToggle label={option.label} setting={option.setting} />
    case "choice":
      return <ChoiceControl label={option.label} setting={option.setting} options={option.options} />;
    case "slider":
      return <p>{option.label}: slider</p>;
    case "fake-slider":
      return <p>{option.label}: fake slider</p>;
    case "exit":
      return <p>Exit button: {option.color}</p>;
  }
}

function SettingsScreen({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <button onClick={onClose}>← Back</button>
      <h2>Settings</h2>

      {settingsSections.map((section) => (
        <div key={section.title}>
          <h3>{section.title}</h3>
          {section.options.map((option, i) => (
            <OptionView key={i} option={option} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default SettingsScreen;
