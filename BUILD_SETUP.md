# Pet Care Assistant - Build & Deployment Guide

## Prerequisites

1. **Expo Account**: Create an account at https://expo.dev
2. **Apple Developer Account**: Required for iOS App Store submission
3. **Google Play Console Account**: Required for Android Play Store submission
4. **EAS CLI**: Already installed globally

## Step 1: Initialize EAS Project

```bash
# Login to your Expo account
eas login

# Initialize the project (this will generate a unique project ID)
eas build:configure

# The system will update app.json with your actual project ID
```

## Step 2: Update Configuration

After running `eas build:configure`, update the following in `app.json`:

```json
{
  "expo": {
    "owner": "your-actual-expo-username",
    "extra": {
      "eas": {
        "projectId": "generated-project-id-will-be-here"
      }
    }
  }
}
```

## Step 3: App Store Connect Setup (iOS)

1. Go to https://appstoreconnect.apple.com
2. Create a new app with bundle ID: `com.petcare.assistant`
3. Fill in app information:
   - **Name**: Pet Care Assistant
   - **Category**: Medical
   - **Content Rating**: 4+ (No objectionable content)
4. Update `eas.json` with your Apple ID and app information

## Step 4: Google Play Console Setup (Android)

1. Go to https://play.google.com/console
2. Create a new app with package name: `com.petcare.assistant`
3. Create a service account key for automated uploads
4. Save the key as `android-service-account.json` (do not commit to git!)

## Step 5: Build Commands

```bash
# Preview build (for testing)
eas build --platform all --profile preview

# Production build (for app stores)
eas build --platform all --profile production

# iOS only
eas build --platform ios --profile production

# Android only
eas build --platform android --profile production
```

## Step 6: Submission

```bash
# Submit to App Store (after production build)
eas submit --platform ios --profile production

# Submit to Google Play (after production build)
eas submit --platform android --profile production
```

## Build Profiles Explained

- **development**: For development with Expo Dev Client
- **preview**: Internal testing builds (APK for Android, Ad Hoc for iOS)
- **production**: App store ready builds

## Security Notes

- The app is fully local-only, no API keys needed in production
- No server infrastructure required
- All data stored locally on device
- HTTPS requirements configured for localhost LLM access

## App Store Requirements Met

✅ **iOS App Store**:
- Bundle identifier: `com.petcare.assistant`
- App Transport Security configured
- Privacy policy (will be created)
- App icons and splash screens (to be created)

✅ **Google Play Store**:
- Package name: `com.petcare.assistant` 
- Target SDK configured
- Required permissions listed
- Content rating appropriate

## Next Steps

1. Create app icons and splash screens
2. Write privacy policy and terms of service
3. Test production builds
4. Submit to app stores

## Troubleshooting

- If build fails, check logs with `eas build:list`
- For iOS signing issues, ensure Apple Developer account is active
- For Android, verify Google Play Console service account permissions