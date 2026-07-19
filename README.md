# ✦ Jothidam — Tamil Celestial Guide

A beautiful Expo React Native app with 6 screens, deployable as both a **web app** and **Android APK**.

## Features
- 📅 **Panchang** — Daily Tithi, Nakshatra, Yoga, Rahu Kalam & more
- ♥ **Porutham** — Marriage compatibility by star or birth date
- ★ **Stars** — Nakshatra compatibility finder
- ♈ **Horoscope** — 1-page birth chart with South Indian Kattam
- ⏳ **Age Calculator** — Precise age with nakshatra & rasi
- ✨ **Baby Names** — Generator by letter, gender & nakshatra

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run on Web
```bash
npm run web
# Opens http://localhost:8081
```

### 3. Run on Android
```bash
# With Android emulator or physical device connected:
npm run android

# Or scan QR code with Expo Go app:
npm start
```

### 4. Build for Production

**Web (static export):**
```bash
npx expo export --platform web
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

**Android APK via Expo Dev Build (local, no EAS account needed):**

Prerequisites — make sure these are installed and on your PATH:
- [Android Studio](https://developer.android.com/studio) with Android SDK (API 33+)
- Java JDK 17 (`java -version` should show 17.x)
- Set `ANDROID_HOME` env var pointing to your SDK folder

```bash
# 1. Install expo-dev-client
npx expo install expo-dev-client

# 2. Generate native android/ folder
npx expo prebuild --platform android

# 3a. Build a debug APK (fastest, good for testing)
cd android
./gradlew assembleDebug
# APK → android/app/build/outputs/apk/debug/app-debug.apk

# 3b. Or build a release APK
./gradlew assembleRelease
# APK → android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Signing the release APK (required to install on devices):**
```bash
# Generate a keystore (one-time)
keytool -genkey -v -keystore jothidam.keystore \
  -alias jothidam -keyalg RSA -keysize 2048 -validity 10000

# Sign the APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore jothidam.keystore \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  jothidam

# Align the APK
zipalign -v 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  jothidam-release.apk
```

**Install directly to a connected device:**
```bash
adb install jothidam-release.apk
# Or for debug build:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Live reload during development (no rebuild needed for JS changes):**
```bash
# Terminal 1 — start Metro bundler
npm start

# Terminal 2 — launch on connected device/emulator
npm run android
```

---

## Project Structure
```
jothidam/
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab navigation
│       ├── index.tsx        # Panchang
│       ├── porutham.tsx     # Marriage compatibility
│       ├── stars.tsx        # Star compatibility
│       ├── horoscope.tsx    # Horoscope generator
│       ├── age.tsx          # Age calculator
│       └── names.tsx        # Baby names
├── components/
│   ├── Screen.tsx           # Base screen wrapper
│   ├── ui.tsx               # Shared UI components
│   ├── DatePicker.tsx       # Cross-platform date picker
│   └── Select.tsx           # Cross-platform dropdown
├── data/
│   ├── constants.ts         # All jyotish data
│   └── theme.ts             # Colors, fonts, helpers
├── app.json
└── package.json
```

## Notes
- All calculations are traditional Tamil/Vedic jyotish algorithms
- The date picker shows a native modal on Android and HTML input on web
- Dropdowns use a scrollable modal on Android and native `<select>` on web
- Expo Router handles both web routing and native navigation automatically
