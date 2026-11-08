import { settingsSections } from "./settingsContent"

function SettingsScreen({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <button onClick={onClose}>← Back</button>
      <h2>Settings</h2>

      {settingsSections.map((section) => (
        <div key={section.title}>
          <h3>{section.title}</h3>
          <p>{section.options.length} options</p>
        </div>
      ))}
    </div>
  )
}

export default SettingsScreen