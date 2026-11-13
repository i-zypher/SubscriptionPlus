import type { CapacitorConfig } from "@capacitor/cli";

// The iOS and Android apps. Build them with `npm run build:app`, which builds
// the game for the app (served from the root, not /subscriptionplus/).
const config: CapacitorConfig = {
  appId: "net.ceymer.subscriptionplus",
  appName: "Subscription Plus",
  webDir: "dist",
  backgroundColor: "#f5f9fa",
  plugins: {
    LocalNotifications: {
      // White silhouette of the logo for Android's status bar
      smallIcon: "ic_stat_sp",
      iconColor: "#1cd1ee",
    },
  },
};

export default config;
