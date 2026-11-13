import { create } from "zustand";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isApp } from "./platform";
import { useSettingsStore } from "./state/settingsStore";

// Win-back reminders, scheduled on the phone (no server). Every time the app
// opens, the series is pushed back, so only players who stop coming back
// ever see them. Settings → Notifications → Push Notifications is the switch.

const DAY = 24 * 60 * 60 * 1000;
const REMINDERS = [
  {
    id: 101,
    after: 1 * DAY,
    body: "Your free trial misses you. It's still running. Technically.",
  },
  {
    id: 102,
    after: 3 * DAY,
    body: "Brad here. I've been on hold waiting for you for 3 days. 🎵",
  },
  {
    id: 103,
    after: 7 * DAY,
    body: "Good news: your subscription renewed! Bad news: you weren't there to see it.",
  },
  {
    id: 104,
    after: 14 * DAY,
    body: "This is Brad's final notice. (It is not Brad's final notice.)",
  },
];
const ASKED_KEY = "sp-notifications-asked";

// A short note under the Settings switch when it can't turn on
export const useNotificationNote = create<{ note: string | null }>(() => ({
  note: null,
}));

async function cancelReminders() {
  await LocalNotifications.cancel({
    notifications: REMINDERS.map(({ id }) => ({ id })),
  });
}

async function scheduleReminders() {
  await cancelReminders();
  const now = Date.now();
  await LocalNotifications.schedule({
    notifications: REMINDERS.map(({ id, after, body }) => ({
      id,
      title: "Subscription Plus",
      body,
      schedule: { at: new Date(now + after), allowWhileIdle: true },
      // Android: a rough time is fine (no exact-alarm permission needed)
      isExactNotification: false,
    })),
  });
}

// Push the whole series back from "now" (app opened or came back to the front)
async function refresh() {
  if (!isApp) return;
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (useSettingsStore.getState().push && display === "granted")
      await scheduleReminders();
    else await cancelReminders();
  } catch {
    // Notifications are a bonus; never let them break the game
  }
}

// Ask the phone for permission; turns the setting on only if allowed
export async function enableNotifications(): Promise<boolean> {
  if (!isApp) return false;
  try {
    let { display } = await LocalNotifications.checkPermissions();
    if (display !== "granted")
      ({ display } = await LocalNotifications.requestPermissions());
    const allowed = display === "granted";
    useNotificationNote.setState({
      note: allowed
        ? null
        : "Allow notifications for Subscription Plus in your phone's Settings first.",
    });
    if (useSettingsStore.getState().push !== allowed)
      useSettingsStore.setState({ push: allowed });
    return allowed;
  } catch {
    return false;
  }
}

// Brad's opt-in card shows once, the first time an app player reaches home
export function shouldAskForNotifications() {
  if (!isApp || useSettingsStore.getState().push) return false;
  try {
    return localStorage.getItem(ASKED_KEY) !== "yes";
  } catch {
    return false;
  }
}
export function markNotificationsAsked() {
  try {
    localStorage.setItem(ASKED_KEY, "yes");
  } catch {
    // Private mode: they may see the card again, which is fine
  }
}

export function startNotifications() {
  if (!isApp) return;
  refresh();
  // The app coming back to the front counts as opening it
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
  // The Settings switch: on asks the phone, off cancels everything
  let wasOn = useSettingsStore.getState().push;
  useSettingsStore.subscribe((s) => {
    if (s.push === wasOn) return;
    wasOn = s.push;
    if (s.push) enableNotifications().then(refresh);
    else refresh(); // (keeps any "allow it in Settings" note showing)
  });
}
