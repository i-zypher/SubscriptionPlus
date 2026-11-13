import { Capacitor } from "@capacitor/core";

// True inside the iOS and Android apps, false on the website
export const isApp = Capacitor.isNativePlatform();
