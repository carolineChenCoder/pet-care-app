import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Share, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LocalLLMService from '../services/LocalLLMService';
import PetService from '../services/PetService';
import Environment from '../config/environment';

const HealthReportScreen = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [petProfile, setPetProfile] = useState(null);
  const [healthReport, setHealthReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [llmService] = useState(new LocalLLMService());
  const [petService] = useState(new PetService());
  const [usingLocalLLM, setUsingLocalLLM] = useState(true);
  const [abortController, setAbortController] = useState(null);
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (when user navigates to this tab)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      console.log('🔄 HealthReport: Loading pet data...');
      // Migrate old data first
      await petService.migrateOldData();
      
      // Load current pet
      const currentPet = await petService.getCurrentPet();
      console.log('🐾 HealthReport: Current pet loaded:', currentPet?.name || 'No pet');
      setPetProfile(currentPet);
      
      // Load saved reports for current pet
      if (currentPet) {
        const reports = await petService.getHealthReports(currentPet.id);
        setSavedReports(reports);
        console.log(`📊 HealthReport: Loaded ${reports.length} reports for ${currentPet.name}`);
      } else {
        setSavedReports([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSavedReport = (report) => {
    setHealthReport(report.report);
    setReportGenerated(true);
    Alert.alert(
      '📄 Loaded Saved Report', 
      `Generated: ${new Date(report.generatedAt).toLocaleDateString()}\nSource: ${report.source === 'local_llm' ? 'Local LLM' : 'Cloud LLM'}`
    );
  };

  const generateHealthReport = async (reportType = 'comprehensive') => {
    if (!petProfile) {
      Alert.alert('No Pet Selected', 'Please go to Pet Management to add or select a pet first.');
      return;
    }

    setLoading(true);
    setHealthReport('');
    setReportGenerated(false);

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let reportData;
      
      // Try local LLM
      try {
        const isConnected = await llmService.testConnection();
        if (isConnected) {
          console.log('Using local LLM for health report generation...');
          const currentLanguage = t('currentLanguage') || 'en';
          reportData = await llmService.generateHealthReport(petProfile, currentLanguage, reportType, controller.signal);
          setHealthReport(reportData.fullReport);
          setReportGenerated(true);
          Alert.alert('🖥️ ' + t('reportGenerated'), 'Generated using local LLM');
          return;
        } else {
          console.log('Local LLM not available');
          throw new Error('Local LLM not available');
        }
      } catch (localError) {
        console.log('Local LLM failed:', localError.message);
        
        // Show user-friendly message for no LLM available
        const fallbackReport = createOfflineFallbackReport(petProfile, reportType);
        setHealthReport(fallbackReport);
        setReportGenerated(true);
        Alert.alert(
          '📱 Offline Mode', 
          'Local LLM not available. Generated basic report based on breed information. For AI-powered reports, please ensure Ollama is running with qwen2:1.5b model.'
        );
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation was cancelled by user');
        // Don't show error alert for user cancellation
      } else {
        console.error('Error generating health report:', error);
        Alert.alert(t('reportError'), `${t('reportErrorMessage')} ${error.message}`);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
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
    if (!healthReport || !petProfile) return;

    try {
      await petService.saveHealthReport(petProfile.id, {
        report: healthReport,
        reportType: 'comprehensive',
        source: usingLocalLLM ? 'local_llm' : 'cloud_llm'
      });
      
      // Reload saved reports
      const reports = await petService.getHealthReports(petProfile.id);
      setSavedReports(reports);
      
      Alert.alert('✅ Saved!', `Health report for ${petProfile.name} has been saved successfully!`);
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('❌ Save Failed', 'Could not save the health report.');
    }
  };

  const cancelGeneration = () => {
    if (abortController) {
      console.log('🛑 Cancelling LLM generation...');
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      Alert.alert('🛑 Cancelled', 'Report generation has been cancelled.');
    }
  };

  const createOfflineFallbackReport = (petProfile, reportType = 'comprehensive') => {
    const breedInfo = getBasicBreedInfo(petProfile.breed);
    const ageGroup = getAgeGroup(petProfile.age);
    
    return `📱 **OFFLINE HEALTH REPORT**
Generated: ${new Date().toLocaleDateString()}
Pet: ${petProfile.name} (${petProfile.breed}, ${petProfile.age} years)

🏥 **GENERAL HEALTH OVERVIEW**
Based on breed and age information for ${ageGroup} ${petProfile.breed}s:
${breedInfo.healthNotes}

🍽️ **BASIC NUTRITION**
- Feed high-quality pet food appropriate for ${ageGroup} pets
- ${breedInfo.feedingTips}
- Always provide fresh water

🏃 **EXERCISE NEEDS**  
${breedInfo.exerciseNeeds}

🩺 **ROUTINE CARE**
- Annual vet checkups (twice yearly for senior pets)
- Keep vaccinations current
- Regular dental care and grooming
- ${breedInfo.specialCare}

⚠️ **BREED-SPECIFIC MONITORING**
Watch for: ${breedInfo.commonIssues}

📅 **NEXT STEPS**
- Schedule regular vet checkup if overdue
- Monitor for any changes in behavior or appetite
- Consider professional training if needed

**Note:** This is a basic offline report. For AI-powered detailed analysis, please ensure Ollama is running with the qwen2:1.5b model.

**Always consult your veterinarian for professional medical advice.**`;
  };

  const getBasicBreedInfo = (breed) => {
    const breedLower = breed.toLowerCase();
    
    // Common breed information database
    if (breedLower.includes('golden retriever') || breedLower.includes('retriever')) {
      return {
        healthNotes: 'Generally healthy, active dogs prone to hip dysplasia and heart conditions.',
        feedingTips: '2-3 cups of quality food daily, split into meals.',
        exerciseNeeds: 'Requires 60+ minutes of daily exercise including walks and play.',
        specialCare: 'Regular grooming needed due to long coat.',
        commonIssues: 'hip dysplasia, heart problems, eye conditions'
      };
    } else if (breedLower.includes('labrador') || breedLower.includes('lab')) {
      return {
        healthNotes: 'Energetic and generally healthy with tendency toward obesity.',
        feedingTips: '2-3 cups daily, monitor weight carefully.',
        exerciseNeeds: 'High energy - needs 60+ minutes daily exercise.',
        specialCare: 'Weight management is crucial.',
        commonIssues: 'obesity, hip dysplasia, eye problems'
      };
    } else if (breedLower.includes('bulldog')) {
      return {
        healthNotes: 'Brachycephalic breed with breathing considerations.',
        feedingTips: '1-2 cups daily, avoid overfeeding.',
        exerciseNeeds: 'Moderate exercise, avoid overexertion in heat.',
        specialCare: 'Monitor breathing, keep cool in hot weather.',
        commonIssues: 'breathing problems, hip dysplasia, skin issues'
      };
    } else if (breedLower.includes('poodle')) {
      return {
        healthNotes: 'Intelligent, active breed generally healthy with good longevity.',
        feedingTips: '1-2 cups daily depending on size.',
        exerciseNeeds: 'Moderate to high exercise needs, enjoys mental stimulation.',
        specialCare: 'Regular professional grooming required.',
        commonIssues: 'hip dysplasia, eye problems, epilepsy'
      };
    } else if (breedLower.includes('german shepherd')) {
      return {
        healthNotes: 'Large, active breed prone to joint issues.',
        feedingTips: '3-4 cups daily, high-quality protein important.',
        exerciseNeeds: 'High exercise needs - 2+ hours daily including mental stimulation.',
        specialCare: 'Joint health supplements may be beneficial.',
        commonIssues: 'hip/elbow dysplasia, bloat, degenerative myelopathy'
      };
    } else {
      return {
        healthNotes: 'Every breed has unique characteristics and health considerations.',
        feedingTips: 'Follow feeding guidelines for your pet\'s size and age.',
        exerciseNeeds: 'Most dogs need at least 30 minutes of daily exercise.',
        specialCare: 'Research your specific breed\'s needs.',
        commonIssues: 'varies by breed - consult breed-specific resources'
      };
    }
  };

  const getAgeGroup = (age) => {
    if (age < 1) return 'puppy';
    if (age < 7) return 'adult';
    return 'senior';
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
          <Text style={styles.noProfileText}>🐾 No active pet selected</Text>
          <Text style={styles.noProfileSubtext}>Go to Pet Management to add or select a pet</Text>
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

      {/* Saved Reports Section */}
      {savedReports.length > 0 && (
        <View style={styles.savedReportContainer}>
          <Text style={styles.savedReportTitle}>📄 Saved Reports ({savedReports.length})</Text>
          <ScrollView style={styles.reportsList} horizontal showsHorizontalScrollIndicator={false}>
            {savedReports.map((report, index) => (
              <TouchableOpacity 
                key={report.id}
                style={styles.reportCard}
                onPress={() => loadSavedReport(report)}
              >
                <Text style={styles.reportDate}>
                  {new Date(report.generatedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.reportSource}>
                  {report.source === 'local_llm' ? '🖥️ Local' : report.source === 'cloud_llm' ? '☁️ Cloud' : '📄 Report'}
                </Text>
                <Text style={styles.loadText}>Tap to Load</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.generateButton, loading && styles.disabledButton]} 
          onPress={() => generateHealthReport('comprehensive')} 
          disabled={loading || !petProfile}
        >
          {loading ? (
            <TouchableOpacity 
              style={styles.cancelContent}
              onPress={cancelGeneration}
            >
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.generateButtonText}>{t('generatingReport')}</Text>
              <Text style={styles.cancelHint}>🛑 Tap to Cancel</Text>
            </TouchableOpacity>
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
  cancelContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  cancelHint: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
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
  savedReportContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  savedReportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  reportsList: {
    maxHeight: 100,
  },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  reportSource: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  loadText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '500',
  },
});

export default HealthReportScreen;