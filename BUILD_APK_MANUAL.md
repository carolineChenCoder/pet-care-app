# Manual APK Build Instructions

The automated build is failing due to interactive keystore generation. Here's how to get your APK:

## 🔑 Step 1: Generate Keystore (Interactive - Required)

You need to run this command and answer the prompts manually:

```bash
cd "/Users/caroline/Applications/Dropbox/Mac/Documents/work/start_up/AI_application/Pet_google"

# This MUST be run interactively in your terminal:
eas credentials:configure --platform android
```

### Prompts and Answers:
```
? Select platform › Android
? What would you like to do? › Generate a new Android Keystore
? Generate a new Android Keystore? › Yes
```

This creates the keystore on Expo's servers for your project.

## 📱 Step 2: Build APK

After keystore generation, build your APK:

```bash
# Build preview APK (faster, for testing)
eas build --platform android --profile preview

# OR build production APK (for final release)
eas build --platform android --profile production
```

## ⏰ Expected Timeline:
- Keystore generation: 2 minutes
- Build process: 10-15 minutes  
- Download link: Provided when complete

## 📲 Step 3: Download and Install

1. **Build completes** → You get a download link
2. **Copy link** → Send to your phone  
3. **Download APK** → On your Android phone
4. **Install APK** → Follow Android installation steps

## 🚀 Alternative: Use Expo Application Services UI

If command line issues persist:

1. **Go to**: https://expo.dev/accounts/ccaroline/projects/pet-care-assistant
2. **Click "Builds"** tab
3. **Click "Create Build"**
4. **Select**: Android, Production/Preview profile
5. **Generate keystore** when prompted
6. **Start build** and wait for completion

## ⚡ Quick Commands Summary

```bash
# 1. Generate keystore (interactive)
eas credentials:configure --platform android

# 2. Build APK  
eas build --platform android --profile preview

# 3. Wait for build completion and download link
```

The keystore generation MUST be done interactively - there's no way around this security requirement. Once done, all future builds will use the same keystore automatically.