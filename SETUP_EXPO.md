# Expo Account Setup Guide

## Issue: "Email or username › Log in to EAS..."

This error occurs because you need an Expo account to use EAS builds. Here's how to fix it:

## Step 1: Create Expo Account (if you don't have one)

1. Go to https://expo.dev/signup
2. Sign up with email or GitHub
3. Verify your email address
4. Choose a username (this will be used in builds)

## Step 2: Login via Command Line

```bash
# Method 1: Interactive login
npx expo login

# Method 2: If interactive doesn't work
npx expo login --username your-username
# You'll be prompted for password

# Method 3: Use token (for CI/CD)
export EXPO_TOKEN=your-personal-access-token
npx expo whoami  # Should show your username
```

## Step 3: Initialize EAS Project

After successful login:

```bash
# This will work now
eas build:configure

# This will generate a unique project ID and update app.json
# The project ID will replace "generate-new-project-id"
```

## Step 4: Update Project Configuration

After `eas build:configure` runs, it will automatically update your `app.json`:

```json
{
  "expo": {
    "owner": "your-actual-username",
    "extra": {
      "eas": {
        "projectId": "generated-uuid-here"
      }
    }
  }
}
```

## Common Login Issues & Solutions

### Issue: "Command not found: npx"
```bash
# Install Node.js from https://nodejs.org
# Or update npm:
npm install -g npm@latest
```

### Issue: "Network error"
```bash
# Check internet connection
# Try with different network
# Use VPN if corporate firewall blocks
```

### Issue: "Invalid credentials"
```bash
# Reset password at https://expo.dev/forgot-password
# Make sure you're using the correct email/username
# Check for typos
```

### Issue: "Two-factor authentication"
```bash
# If you have 2FA enabled, you'll need to:
# 1. Generate a personal access token at https://expo.dev/accounts/[username]/settings/access-tokens
# 2. Use: EXPO_TOKEN=your-token eas build:configure
```

## Alternative: Manual Configuration

If login continues to fail, you can manually configure the project:

1. Create account at https://expo.dev
2. Create a new project in the web dashboard
3. Copy the project ID
4. Update app.json manually:

```json
{
  "expo": {
    "owner": "your-username",
    "extra": {
      "eas": {
        "projectId": "copied-project-id"
      }
    }
  }
}
```

## Next Steps After Login Success

1. Assets creation (icons, splash screens)
2. Test builds: `npm run build:preview`
3. Production builds: `npm run build:all`
4. App store submission preparation

## Important Notes

- **Free Tier**: Expo provides free builds with limits
- **Paid Plans**: Unlimited builds, priority queue
- **Team Collaboration**: Add team members in web dashboard
- **Build History**: View all builds at https://expo.dev/accounts/[username]/projects/[project]/builds