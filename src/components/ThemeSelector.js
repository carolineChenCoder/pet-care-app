import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { themeOptions } from '../utils/themes';

const ThemeSelector = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();
  const { currentTheme, changeTheme, colors } = useTheme();

  const handleThemeSelect = async (themeId) => {
    await changeTheme(themeId);
    setIsVisible(false);
    Alert.alert(
      t('themeChanged'),
      t('themeChangedMessage')
    );
  };

  const styles = createStyles(colors);

  return (
    <View>
      <TouchableOpacity 
        style={[styles.themeButton, { backgroundColor: colors.primary }]} 
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.themeButtonText}>
          🎨 {t('themeSelector')}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderColor: colors.primary }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              {t('selectTheme')}
            </Text>
            
            <ScrollView style={styles.themeList}>
              {themeOptions.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: colors.background,
                      borderColor: currentTheme === theme.id ? colors.primary : colors.border 
                    },
                    currentTheme === theme.id && { borderWidth: 3 }
                  ]}
                  onPress={() => handleThemeSelect(theme.id)}
                >
                  <View style={styles.themePreview}>
                    <View 
                      style={[styles.colorCircle, { backgroundColor: theme.color }]} 
                    />
                    <Text style={[styles.themeOptionText, { color: colors.text }]}>
                      {t(`theme${theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}`)}
                    </Text>
                  </View>
                  {currentTheme === theme.id && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✅</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.error }]}
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
  themeButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 10,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  themeButtonText: {
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
    borderWidth: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  themeList: {
    maxHeight: 400,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 2,
  },
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
  },
  closeButton: {
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

export default ThemeSelector;