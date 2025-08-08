import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LocalLLMService from '../services/LocalLLMService';

// Fallback Gemini API Key for when local LLM is unavailable
const GEMINI_API_KEY = 'AIzaSyDuFWJ7LcUtsoOZfab5YcCT_7yciJnHiSs';

const HealthReportScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [petProfile, setPetProfile] = useState(null);
  const [healthReport, setHealthReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [llmService] = useState(new LocalLLMService());
  const [usingLocalLLM, setUsingLocalLLM] = useState(true);

  useEffect(() => {
    loadPetProfile();
  }, []);

  const loadPetProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('petProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setPetProfile(profile);
      }
    } catch (error) {
      console.error('Error loading pet profile:', error);
    }
  };

  const generateHealthReport = async (reportType = 'comprehensive') => {
    if (!petProfile) {
      Alert.alert(t('noProfileAlert'), t('noProfileMessage'));
      return;
    }

    setLoading(true);
    setHealthReport('');
    setReportGenerated(false);

    try {
      let reportData;
      
      // Try local LLM first
      if (usingLocalLLM) {
        try {
          const isConnected = await llmService.testConnection();
          if (isConnected) {
            console.log('Using local LLM for health report generation...');
            const currentLanguage = t('currentLanguage') || 'en';
            reportData = await llmService.generateHealthReport(petProfile, currentLanguage, reportType);
            setHealthReport(reportData.fullReport);
            setReportGenerated(true);
            Alert.alert('🖥️ ' + t('reportGenerated'), 'Generated using local LLM');
            return;
          } else {
            console.log('Local LLM not available, falling back to Gemini...');
            setUsingLocalLLM(false);
          }
        } catch (localError) {
          console.log('Local LLM failed, falling back to Gemini:', localError.message);
          setUsingLocalLLM(false);
        }
      }

      // Fallback to Gemini API
      console.log('Using Gemini API for health report generation...');
      const genderText = petProfile.gender === 'male' ? 'Male' : petProfile.gender === 'female' ? 'Female' : 'Unknown gender';
      const prompt = `Generate a comprehensive health report for a pet with the following information:
      - Name: ${petProfile.name}
      - Breed: ${petProfile.breed}
      - Age: ${petProfile.age}
      - Gender: ${genderText}
      
      Please provide:
      1. General health assessment based on breed, age, and gender
      2. Common health concerns for this breed (including gender-specific issues)
      3. Recommended preventive care schedule (considering gender-specific needs)
      4. Nutrition recommendations based on breed, age, and gender
      5. Exercise requirements
      6. Gender-specific health monitoring recommendations
      7. Warning signs to watch for
      8. Veterinary visit recommendations
      
      Make the report professional yet friendly, and include specific recommendations. Consider gender-specific health issues (like spaying/neutering considerations, reproductive health, etc.). Use emojis to make it engaging but keep it informative and helpful.`;

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
        setHealthReport(data.candidates[0].content.parts[0].text);
        setReportGenerated(true);
        Alert.alert('☁️ ' + t('reportGenerated'), 'Generated using cloud LLM');
      } else {
        setHealthReport('No response from AI.');
      }
    } catch (error) {
      console.error('Error generating health report:', error);
      Alert.alert(t('reportError'), `${t('reportErrorMessage')} ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const shareReport = async () => {
    if (!healthReport) return;
    
    try {
      const reportContent = `${t('reportTitle')} - ${petProfile?.name}\n\n${healthReport}\n\n${t('reportDisclaimer')}`;
      await Share.share({
        message: reportContent,
        title: `${t('reportTitle')} - ${petProfile?.name}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const saveReport = async () => {
    if (!healthReport) return;

    try {
      const reportData = {
        petName: petProfile?.name,
        petBreed: petProfile?.breed,
        petAge: petProfile?.age,
        petGender: petProfile?.gender,
        report: healthReport,
        generatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('lastHealthReport', JSON.stringify(reportData));
      Alert.alert('✅ Saved!', 'Health report has been saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('❌ Save Failed', 'Could not save the health report.');
    }
  };

  const testLocalLLMConnection = async () => {
    try {
      console.log('Starting manual connection test...');
      const isConnected = await llmService.testConnection();
      const models = await llmService.getAvailableModels();
      
      Alert.alert(
        '🔍 Connection Test Results',
        `Connection: ${isConnected ? '✅ Success' : '❌ Failed'}\nModels Available: ${models.length}\nOllama URL: http://localhost:11434\n\nCheck console for detailed logs.`
      );
    } catch (error) {
      Alert.alert('🔍 Connection Test', `❌ Test failed: ${error.message}`);
    }
  };

  const styles = createStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.emoji}>📊</Text>
        <Text style={styles.title}>{t('healthReportTitle')}</Text>
        <Text style={styles.subtitle}>{t('healthReportSubtitle')}</Text>
      </View>

      {petProfile && (
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>🐾 Pet Information</Text>
          <Text style={styles.profileText}>🐕 Name: {petProfile.name}</Text>
          <Text style={styles.profileText}>🏷️ Breed: {petProfile.breed}</Text>
          <Text style={styles.profileText}>🎂 Age: {petProfile.age}</Text>
          <Text style={styles.profileText}>
            ⚥ Gender: {petProfile.gender === 'male' ? t('genderMale') : 
                       petProfile.gender === 'female' ? t('genderFemale') : 
                       t('genderUnknown')}
          </Text>
        </View>
      )}

      {!petProfile && (
        <View style={styles.noProfileCard}>
          <Text style={styles.noProfileText}>🐾 No pet profile found</Text>
          <Text style={styles.noProfileSubtext}>{t('noProfileMessage')}</Text>
        </View>
      )}

      {/* LLM Status Indicator */}
      <View style={styles.llmStatusContainer}>
        <Text style={styles.llmStatusText}>
          {usingLocalLLM ? '🖥️ Using Local LLM' : '☁️ Using Cloud LLM'}
        </Text>
        <TouchableOpacity 
          style={styles.switchLLMButton}
          onPress={() => setUsingLocalLLM(!usingLocalLLM)}
        >
          <Text style={styles.switchLLMText}>
            Switch to {usingLocalLLM ? 'Cloud' : 'Local'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={testLocalLLMConnection}
        >
          <Text style={styles.testButtonText}>🔍 Test</Text>
        </TouchableOpacity>
      </View>

      {/* Report Type Selection */}
      <View style={styles.reportTypeContainer}>
        <Text style={styles.reportTypeTitle}>📋 Report Type:</Text>
        <View style={styles.reportTypeButtons}>
          <TouchableOpacity 
            style={styles.reportTypeButton}
            onPress={() => generateHealthReport('basic')}
            disabled={loading || !petProfile}
          >
            <Text style={styles.reportTypeButtonText}>🔸 Basic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.reportTypeButton}
            onPress={() => generateHealthReport('comprehensive')}
            disabled={loading || !petProfile}
          >
            <Text style={styles.reportTypeButtonText}>📊 Full Report</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.reportTypeButton}
            onPress={() => generateHealthReport('detailed')}
            disabled={loading || !petProfile}
          >
            <Text style={styles.reportTypeButtonText}>📝 Detailed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.disabledButton]} 
          onPress={() => generateHealthReport('comprehensive')} 
          disabled={loading || !petProfile}
        >
          {loading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.generateButtonText}>{t('generatingReport')}</Text>
            </View>
          ) : (
            <Text style={styles.generateButtonText}>{t('generateReportButton')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('generatingReport')}</Text>
        </View>
      )}

      {reportGenerated && healthReport && (
        <View style={styles.reportContainer}>
          <Text style={styles.reportTitle}>{t('reportTitle')}</Text>
          <ScrollView style={styles.reportContent}>
            <Text style={styles.reportText}>{healthReport}</Text>
          </ScrollView>
          
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.actionButton} onPress={shareReport}>
              <Text style={styles.actionButtonText}>{t('shareReport')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={saveReport}>
              <Text style={styles.actionButtonText}>{t('saveReport')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimer}>{t('reportDisclaimer')}</Text>
          </View>
        </View>
      )}
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
  profileCard: {
    backgroundColor: colors.successLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
  },
  profileText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  noProfileCard: {
    backgroundColor: colors.errorLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
  },
  noProfileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  noProfileSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  actionContainer: {
    marginBottom: 20,
  },
  generateButton: {
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
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
  reportContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  reportContent: {
    maxHeight: 400,
    marginBottom: 20,
  },
  reportText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerContainer: {
    backgroundColor: colors.warningLight,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.warning,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  // New styles for LLM selection and report types
  llmStatusContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  llmStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  switchLLMButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  switchLLMText: {
    fontSize: 12,
    color: colors.surface,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: colors.warning,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  testButtonText: {
    fontSize: 10,
    color: colors.surface,
    fontWeight: '500',
  },
  reportTypeContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  reportTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportTypeButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  reportTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});

export default HealthReportScreen;