
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// IMPORTANT: Replace with your actual Gemini API Key
// For production, never hardcode API keys. Use environment variables or a backend proxy.
const GEMINI_API_KEY = 'AIzaSyDuFWJ7LcUtsoOZfab5YcCT_7yciJnHiSs'; 

const SymptomCheckerScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [symptom, setSymptom] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFirstAid, setShowFirstAid] = useState(false);

  const emergencyItems = [
    {
      emoji: '🫁',
      title: t('choking'),
      content: t('chokingText')
    },
    {
      emoji: '🩸',
      title: t('bleeding'),
      content: t('bleedingText')
    },
    {
      emoji: '🌡️',
      title: t('heatstroke'),
      content: t('heatstrokeText')
    },
    {
      emoji: '☠️',
      title: t('poisoning'),
      content: t('poisoningText')
    },
    {
      emoji: '🦴',
      title: t('fractures'),
      content: t('fracturesText')
    }
  ];

  const callGeminiApi = async (prompt) => {
    setLoading(true);
    setLlmResponse('');

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        setLlmResponse(data.candidates[0].content.parts[0].text);
      } else {
        setLlmResponse('No response from LLM.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      Alert.alert(t('symptomsAlertError'), `${t('symptomsAlertErrorMessage')} ${error.message}`);
      setLlmResponse('Error: Could not get a response from the AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (symptom.trim() === '') {
      Alert.alert(t('symptomsAlertEmpty'), t('symptomsAlertEmptyMessage'));
      return;
    }
    const prompt = `As a helpful pet health assistant, provide general, non-veterinary advice for a pet showing the following symptom(s): "${symptom}". Please keep the response concise and focus on common, mild issues or when to seek professional help. Use friendly, caring language with some emojis.`;
    callGeminiApi(prompt);
    setSymptom('');
  };

  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>🩺</Text>
        <Text style={styles.title}>{t('symptomsTitle')}</Text>
        <Text style={styles.subtitle}>{t('symptomsSubtitle')}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('symptomsLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('symptomsPlaceholder')}
            placeholderTextColor={colors.secondary}
            value={symptom}
            onChangeText={setSymptom}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>{t('symptomsButton')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('symptomsLoading')}</Text>
        </View>
      )}

      {llmResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>{t('symptomsResponse')}</Text>
          <Text style={styles.responseText}>{llmResponse}</Text>
          <Text style={styles.disclaimer}>
            {t('symptomsDisclaimer')}
          </Text>
        </View>
      )}

      {/* First Aid Emergency Guide Section */}
      <View style={styles.firstAidContainer}>
        <TouchableOpacity 
          style={styles.firstAidToggle}
          onPress={() => setShowFirstAid(!showFirstAid)}
        >
          <Text style={styles.firstAidToggleText}>
            🚑 {t('firstAidTitle')} {showFirstAid ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {showFirstAid && (
          <View style={styles.firstAidContent}>
            <Text style={styles.firstAidSubtitle}>{t('firstAidSubtitle')}</Text>
            
            {emergencyItems.map((item, index) => (
              <View key={index} style={styles.emergencyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <Text style={styles.itemContent}>{item.content}</Text>
              </View>
            ))}

            <View style={styles.emergencyNumbers}>
              <Text style={styles.emergencyTitle}>{t('firstAidNumbers')}</Text>
              <TouchableOpacity 
                style={styles.numberCard}
                onPress={() => Linking.openURL('tel:8557647661')}
              >
                <Text style={styles.numberText}>{t('firstAidPoison')}</Text>
                <Text style={styles.numberSubtext}>(855) 764-7661</Text>
              </TouchableOpacity>
              <View style={styles.numberCard}>
                <Text style={styles.numberText}>{t('firstAidEmergency')}</Text>
                <Text style={styles.numberSubtext}>{t('firstAidEmergencyText')}</Text>
              </View>
            </View>

            <View style={styles.disclaimerContainer}>
              <Text style={styles.firstAidDisclaimer}>{t('firstAidDisclaimer')}</Text>
            </View>
          </View>
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  input: {
    height: 120,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: colors.secondary,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
  },
  responseText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 15,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  // First Aid Section Styles
  firstAidContainer: {
    marginTop: 30,
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  firstAidToggle: {
    backgroundColor: colors.error,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  firstAidToggleText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  firstAidContent: {
    padding: 20,
  },
  firstAidSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  emergencyCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
    flex: 1,
  },
  itemContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  emergencyNumbers: {
    backgroundColor: colors.errorLight,
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.error,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  numberCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: 3,
  },
  numberSubtext: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: colors.warningLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  firstAidDisclaimer: {
    fontSize: 11,
    color: colors.warning,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SymptomCheckerScreen;
