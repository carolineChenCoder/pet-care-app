import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [report, setReport] = useState('');

  const generateHealthReport = () => {
    if (!petName || !petBreed) {
      Alert.alert('Missing Info', 'Please add your pet information first.');
      return;
    }

    const breedInfo = getBreedAdvice(petBreed);
    const healthReport = `🐾 Health Report for ${petName}
Breed: ${petBreed}
Generated: ${new Date().toLocaleDateString()}

🏥 GENERAL HEALTH
${breedInfo.healthNotes}

🍽️ NUTRITION ADVICE  
${breedInfo.feedingTips}

🏃 EXERCISE NEEDS
${breedInfo.exerciseNeeds}

🩺 ROUTINE CARE
- Annual vet checkups
- Keep vaccinations current  
- Regular dental care
- ${breedInfo.specialCare}

⚠️ WATCH FOR
${breedInfo.commonIssues}

📅 NEXT STEPS
- Schedule vet checkup if overdue
- Monitor behavior changes
- Maintain healthy diet and exercise

**Always consult your veterinarian for professional advice.**`;

    setReport(healthReport);
  };

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) {
      Alert.alert('No Symptoms', 'Please describe your pet\'s symptoms first.');
      return;
    }

    const severityLevel = assessSeverity(symptoms);
    const analysis = `🩺 SYMPTOM ANALYSIS
Pet: ${petName || 'Your pet'}
Symptoms: "${symptoms}"

${getSeverityInfo(severityLevel)}

📋 IMMEDIATE ACTIONS
${getImmediateActions(severityLevel)}

🏥 VETERINARY CARE
${getVetAdvice(severityLevel)}

⚠️ EMERGENCY SIGNS - Seek immediate care if:
• Difficulty breathing
• Loss of consciousness
• Severe bleeding
• Signs of extreme pain

**This is for guidance only. Always consult your veterinarian.**`;

    setReport(analysis);
    setSymptoms('');
  };

  const getBreedAdvice = (breed) => {
    const breedLower = breed.toLowerCase();
    if (breedLower.includes('golden retriever') || breedLower.includes('retriever')) {
      return {
        healthNotes: 'Active, friendly dogs prone to hip dysplasia and heart conditions.',
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

  const assessSeverity = (symptoms) => {
    const emergencyKeywords = ['unconscious', 'collapse', 'bleeding', 'choking', 'poison'];
    const highKeywords = ['vomiting', 'diarrhea', 'limping', 'pain'];
    const symptomLower = symptoms.toLowerCase();

    if (emergencyKeywords.some(word => symptomLower.includes(word))) return 'emergency';
    if (highKeywords.some(word => symptomLower.includes(word))) return 'high';
    return 'moderate';
  };

  const getSeverityInfo = (level) => {
    const info = {
      emergency: '🚨 EMERGENCY - Immediate veterinary care required!',
      high: '⚠️ HIGH PRIORITY - Contact vet within 24 hours',
      moderate: '📋 MODERATE - Monitor closely, vet visit recommended'
    };
    return info[level] || info.moderate;
  };

  const getImmediateActions = (level) => {
    const actions = {
      emergency: '• Seek immediate emergency veterinary care\n• Do not wait - go to nearest vet clinic\n• Keep pet calm during transport',
      high: '• Contact your veterinarian within 24 hours\n• Monitor symptoms closely\n• Keep pet comfortable and limit activity',
      moderate: '• Monitor symptoms for changes\n• Keep detailed notes of behavior\n• Schedule vet appointment soon'
    };
    return actions[level] || actions.moderate;
  };

  const getVetAdvice = (level) => {
    const advice = {
      emergency: 'Immediate emergency care required - do not delay',
      high: 'Contact veterinarian within 24 hours for evaluation',
      moderate: 'Schedule routine appointment for professional assessment'
    };
    return advice[level] || advice.moderate;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🐾 Pet Care Assistant</Text>
          <Text style={styles.subtitle}>AI-powered pet health companion</Text>
        </View>

        {/* Pet Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐕 Pet Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Pet's name"
            value={petName}
            onChangeText={setPetName}
          />
          <TextInput
            style={styles.input}
            placeholder="Breed (e.g., Golden Retriever, Lab, Mixed)"
            value={petBreed}
            onChangeText={setPetBreed}
          />
        </View>

        {/* Symptom Checker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Symptom Checker</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your pet's symptoms..."
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.button} onPress={analyzeSymptoms}>
            <Text style={styles.buttonText}>Analyze Symptoms</Text>
          </TouchableOpacity>
        </View>

        {/* Health Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Health Reports</Text>
          <TouchableOpacity style={styles.button} onPress={generateHealthReport}>
            <Text style={styles.buttonText}>Generate Health Report</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {report ? (
          <View style={styles.reportSection}>
            <Text style={styles.reportTitle}>📄 Report</Text>
            <ScrollView style={styles.reportScroll}>
              <Text style={styles.reportText}>{report}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setReport('')}
            >
              <Text style={styles.clearButtonText}>Clear Report</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Emergency Info */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>🚑 Emergency</Text>
          <Text style={styles.emergencyText}>
            For immediate emergencies, contact your local emergency vet clinic.
            Pet Poison Helpline: (855) 764-7661
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  reportScroll: {
    maxHeight: 400,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#ff5722',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencySection: {
    backgroundColor: '#ffebee',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  emergencyText: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 18,
  },
});