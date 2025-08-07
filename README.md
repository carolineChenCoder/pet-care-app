# 🐾 Pet Care App

A beautiful and intuitive pet care application built with React Native and Expo, featuring AI-powered health assistance and multilingual support.

## ✨ Features

### 🌍 Multi-Language Support
- **English** 🇺🇸
- **Spanish** 🇪🇸  
- **Chinese** 🇨🇳
- Dynamic language switching with persistent storage

### 🎨 Customizable Themes
- **6 Beautiful Color Themes**: Pink, Blue, Purple, Green, Orange, Red
- Live theme preview and switching
- All UI elements adapt to selected theme

### 🐕 Pet Profile Management
- Complete pet information storage
- Name, breed, age, and gender tracking
- Persistent data storage with AsyncStorage
- Update and manage multiple pet profiles

### 🩺 AI-Powered Health Assistant
- **Symptom Checker**: Describe symptoms and get AI guidance
- **Health Reports**: Comprehensive AI-generated health assessments
- **First Aid Guide**: Emergency procedures for common pet emergencies
- Powered by Google Gemini API

### 🚑 Emergency First Aid
- Choking, bleeding, heatstroke procedures
- Poisoning and fracture guidance
- Emergency contact numbers
- Step-by-step instructions

## 📱 Screenshots

*Beautiful, colorful interface with cute emojis and user-friendly design*

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo Go app on your mobile device
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Pet_google
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Install [Expo Go](https://expo.dev/client) on your phone
   - Scan the QR code displayed in your terminal
   - The app will load on your device!

### Alternative Running Methods

**Run on Android Emulator:**
```bash
npx expo start --android
```

**Run on iOS Simulator:**
```bash
npx expo start --ios
```

**Run on Web:**
```bash
npx expo start --web
```

## 🔧 Configuration

### API Setup
The app uses Google Gemini API for AI features. You'll need to:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/)
2. Replace the API key in:
   - `src/screens/SymptomCheckerScreen.js`
   - `src/screens/HealthReportScreen.js`

**⚠️ Important**: For production apps, never hardcode API keys. Use environment variables or a backend service.

## 🛠 Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation between screens
- **AsyncStorage**: Local data persistence
- **Google Gemini API**: AI-powered health assistance
- **Context API**: State management for themes and language

## 📁 Project Structure

```
Pet_google/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── LanguageSelector.js
│   │   └── ThemeSelector.js
│   ├── context/            # React Context providers
│   │   ├── LanguageContext.js
│   │   └── ThemeContext.js
│   ├── screens/            # App screens
│   │   ├── PetProfileScreen.js
│   │   ├── SymptomCheckerScreen.js
│   │   └── HealthReportScreen.js
│   └── utils/              # Utilities and constants
│       ├── translations.js
│       └── themes.js
├── App.tsx                 # Main app component
└── package.json           # Dependencies
```

## 🌟 Key Features Explained

### Language System
- Uses React Context for global language state
- Translations stored in `src/utils/translations.js`
- Persistent language selection with AsyncStorage
- Easy to add new languages

### Theme System  
- Dynamic color theming with React Context
- 6 predefined color schemes
- All components use theme-aware styling
- Smooth color transitions

### AI Health Assistant
- Integration with Google Gemini API
- Context-aware responses based on pet profiles
- Gender-specific health recommendations
- Professional yet friendly advice

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx expo start --clear
```

**Package version conflicts:**
```bash
npx expo install --fix
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Create an issue in this repository
3. Contact the development team

---

**Made with ❤️ for pet lovers everywhere**

*This app was developed to help pet owners provide better care for their furry friends through technology and AI assistance.*