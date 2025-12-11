const IS_DEV = process.env.APP_ENV === "development";

const getUniqueBundleIdentifier = () => {
  return IS_DEV ? "com.unrealxqt.split.dev" : "com.unrealxqt.split";
};

const getAppName = () => {
  return IS_DEV ? "split-app-dev" : "split-app";
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  slug: "split-app",
  version: "0.2.0",
  orientation: "portrait",
  icon: "./assets/images/android-icon-foreground.png",
  scheme: "splitapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  jsEngine: "hermes",
  ios: {
    supportsTablet: true,
    associatedDomains: ["applinks:splitapp.app", "applinks:splitapp.app"],
    bundleIdentifier: getUniqueBundleIdentifier(),
  },
  "expo-router": { appRoot: "src/app" },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme: "https", host: "splitapp.app", pathPrefix: "/" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    package: "com.unrealxqt.split",
    permissions: ["com.google.android.gms.permission.AD_ID"],
  },
  web: { output: "static", favicon: "./assets/images/favicon.png" },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" },
      },
    ],
    "expo-localization",
    [
      "@sentry/react-native/expo",
      { url: "https://sentry.io/", project: "split", organization: "unrealxqt" },
    ],
    [
      "react-native-google-mobile-ads",
      {
        androidAppId: "ca-app-pub-2182810282927105~6464041380",
        iosAppId: "test",
        userTrackingUsageDescription:
          "This identifier will be used to deliver personalized ads to you.",
        skAdNetworkItems: [],
      },
    ],
    "expo-tracking-transparency",
    [
      "expo-build-properties",
      {
        android: {
          enableProguardInReleaseBuilds: true,
          extraProguardRules: "-keep class com.google.android.gms.** { *; }",
          enableMinifyInReleaseBuilds: true,
        },
      },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    ...config.extra,
    router: {},
    eas: { projectId: "68cf90f4-90e6-4992-bd65-cee54355a85d" },
    APP_ENV: process.env.APP_ENV || "development",
  },
});
