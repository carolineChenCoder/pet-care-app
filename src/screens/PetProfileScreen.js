
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const PetProfileScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petGender, setPetGender] = useState('unknown');
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Load existing profile when component mounts
  useEffect(() => {
    loadPetProfile();
  }, []);

  const loadPetProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('petProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setPetName(profile.name || '');
        setPetBreed(profile.breed || '');
        setPetAge(profile.age || '');
        setPetGender(profile.gender || 'unknown');
        setHasExistingProfile(true);
      }
    } catch (error) {
      console.error('Error loading pet profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (petName.trim() === '' || petBreed.trim() === '' || petAge.trim() === '' || petGender === '') {
      Alert.alert(t('alertOops'), t('alertFillFields'));
      return;
    }

    try {
      const profile = {
        name: petName.trim(),
        breed: petBreed.trim(),
        age: petAge.trim(),
        gender: petGender,
        savedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('petProfile', JSON.stringify(profile));
      setHasExistingProfile(true);
      
      const genderText = petGender === 'male' ? t('genderMale') : petGender === 'female' ? t('genderFemale') : t('genderUnknown');
      Alert.alert(
        t('alertSaved'),
        `🐕 ${t('petNameLabel').replace('🐕 ', '')}: ${petName}\n🏷️ ${t('petBreedLabel').replace('🏷️ ', '')}: ${petBreed}\n🎂 ${t('petAgeLabel').replace('🎂 ', '')}: ${petAge}\n⚥ ${t('petGenderLabel').replace('⚥ ', '')}: ${genderText}\n\n${t('alertSavedMessage')}`
      );
    } catch (error) {
      console.error('Error saving pet profile:', error);
      Alert.alert('❌ Save Failed', 'Sorry, couldn\'t save your pet\'s profile. Please try again!');
    }
  };

  const handleClearProfile = () => {
    Alert.alert(
      t('alertClear'),
      t('alertClearMessage'),
      [
        { text: t('alertCancel'), style: 'cancel' },
        {
          text: t('alertClearConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('petProfile');
              setPetName('');
              setPetBreed('');
              setPetAge('');
              setPetGender('unknown');
              setHasExistingProfile(false);
              Alert.alert(t('alertCleared'), t('alertClearedMessage'));
            } catch (error) {
              console.error('Error clearing profile:', error);
            }
          }
        }
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>
          {hasExistingProfile ? t('profileTitle') : t('profileTitleCreate')}
        </Text>
        <Text style={styles.subtitle}>
          {hasExistingProfile ? t('profileSubtitle') : t('profileSubtitleCreate')}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('petNameLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('petNamePlaceholder')}
            placeholderTextColor={colors.secondary}
            value={petName}
            onChangeText={setPetName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('petBreedLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('petBreedPlaceholder')}
            placeholderTextColor={colors.secondary}
            value={petBreed}
            onChangeText={setPetBreed}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('petAgeLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('petAgePlaceholder')}
            placeholderTextColor={colors.secondary}
            value={petAge}
            onChangeText={setPetAge}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('petGenderLabel')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, petGender === 'male' && styles.selectedGender]}
              onPress={() => setPetGender('male')}
            >
              <Text style={[styles.genderButtonText, petGender === 'male' && styles.selectedGenderText]}>
                {t('genderMale')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, petGender === 'female' && styles.selectedGender]}
              onPress={() => setPetGender('female')}
            >
              <Text style={[styles.genderButtonText, petGender === 'female' && styles.selectedGenderText]}>
                {t('genderFemale')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, petGender === 'unknown' && styles.selectedGender]}
              onPress={() => setPetGender('unknown')}
            >
              <Text style={[styles.genderButtonText, petGender === 'unknown' && styles.selectedGenderText]}>
                {t('genderUnknown')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>
            {hasExistingProfile ? t('updateButton') : t('saveButton')}
          </Text>
        </TouchableOpacity>

        {hasExistingProfile && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearProfile}>
            <Text style={styles.clearButtonText}>{t('clearButton')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: colors.error,
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedGender: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  selectedGenderText: {
    color: colors.primary,
  },
});

export default PetProfileScreen;
