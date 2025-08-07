import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { languages } from '../utils/translations';

const LanguageSelector = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { colors } = useTheme();

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageSelect = async (languageCode) => {
    await changeLanguage(languageCode);
    setIsVisible(false);
    Alert.alert(
      t('languageChanged'),
      t('languageChangedMessage')
    );
  };

  const styles = createStyles(colors);

  return (
    <View>
      <TouchableOpacity style={styles.languageButton} onPress={() => setIsVisible(true)}>
        <Text style={styles.languageButtonText}>
          {currentLang?.flag} {t('language')}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            
            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={styles.languageOptionText}>
                    {language.name}
                  </Text>
                  {currentLanguage === language.code && (
                    <Text style={styles.checkmark}>✅</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.closeButtonText}>✖️ {t('alertCancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  languageButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 10,
    alignSelf: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  languageButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxHeight: '70%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  languageList: {
    maxHeight: 300,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedLanguage: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  languageOptionText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: colors.error,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LanguageSelector;