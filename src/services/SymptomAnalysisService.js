// Advanced Symptom Analysis Service
import AsyncStorage from '@react-native-async-storage/async-storage';

class SymptomAnalysisService {
  constructor() {
    this.severityLevels = {
      LOW: 'low',
      MODERATE: 'moderate', 
      HIGH: 'high',
      EMERGENCY: 'emergency'
    };

    this.emergencyKeywords = [
      'bleeding', 'blood', 'unconscious', 'seizure', 'choking', 'difficulty breathing',
      'pale gums', 'blue tongue', 'collapse', 'severe pain', 'toxin', 'poison',
      'trauma', 'hit by car', 'broken bone', 'paralysis', 'bloating', 'vomiting blood'
    ];

    this.moderateKeywords = [
      'vomiting', 'diarrhea', 'limping', 'coughing', 'sneezing', 'lethargy',
      'loss of appetite', 'excessive drinking', 'frequent urination', 'scratching',
      'shaking head', 'discharge', 'swelling'
    ];
  }

  // Analyze symptom severity using keyword matching and context
  assessSymptomSeverity(symptoms, petProfile = null) {
    const symptomsLower = symptoms.toLowerCase();
    
    // Check for emergency keywords
    const hasEmergencyKeywords = this.emergencyKeywords.some(keyword => 
      symptomsLower.includes(keyword)
    );

    // Check for moderate keywords
    const hasModerateKeywords = this.moderateKeywords.some(keyword =>
      symptomsLower.includes(keyword)
    );

    // Time-sensitive indicators
    const hasTimeIndicators = this.checkTimeIndicators(symptomsLower);
    
    // Combine factors to determine severity
    let severity = this.severityLevels.LOW;
    
    if (hasEmergencyKeywords || hasTimeIndicators.emergency) {
      severity = this.severityLevels.EMERGENCY;
    } else if (hasModerateKeywords || hasTimeIndicators.urgent) {
      severity = this.severityLevels.MODERATE;
    } else if (this.hasMultipleSymptoms(symptomsLower)) {
      severity = this.severityLevels.MODERATE;
    }

    // Age/breed specific adjustments
    if (petProfile) {
      severity = this.adjustSeverityForProfile(severity, petProfile, symptomsLower);
    }

    return {
      level: severity,
      confidence: this.calculateConfidence(symptoms, hasEmergencyKeywords, hasModerateKeywords),
      urgency: this.getUrgencyLevel(severity),
      recommendations: this.getBasicRecommendations(severity)
    };
  }

  checkTimeIndicators(symptoms) {
    const emergencyTimeWords = ['suddenly', 'sudden', 'immediately', 'now', 'minutes ago'];
    const urgentTimeWords = ['hours', 'since yesterday', 'getting worse', 'progressive'];
    
    return {
      emergency: emergencyTimeWords.some(word => symptoms.includes(word)),
      urgent: urgentTimeWords.some(word => symptoms.includes(word))
    };
  }

  hasMultipleSymptoms(symptoms) {
    const symptomSeparators = [',', 'and', 'also', 'plus', 'additionally'];
    return symptomSeparators.some(sep => symptoms.includes(sep)) || 
           symptoms.split(' ').length > 10;
  }

  adjustSeverityForProfile(severity, profile, symptoms) {
    // Age-based adjustments
    const age = parseInt(profile.age);
    if (age < 1 || age > 10) { // Puppies or senior dogs
      if (severity === this.severityLevels.LOW) {
        severity = this.severityLevels.MODERATE;
      }
    }

    // Breed-specific adjustments
    const breedRisks = this.getBreedSpecificRisks(profile.breed.toLowerCase());
    if (breedRisks.some(risk => symptoms.includes(risk))) {
      if (severity === this.severityLevels.LOW) {
        severity = this.severityLevels.MODERATE;
      } else if (severity === this.severityLevels.MODERATE) {
        severity = this.severityLevels.HIGH;
      }
    }

    return severity;
  }

  getBreedSpecificRisks(breed) {
    const breedRisks = {
      'golden retriever': ['hip', 'joint', 'cancer', 'heart'],
      'german shepherd': ['hip dysplasia', 'bloat', 'back'],
      'bulldog': ['breathing', 'respiratory', 'heat'],
      'dachshund': ['back', 'spine', 'disc'],
      'labrador': ['obesity', 'hip', 'eye'],
      'poodle': ['hip', 'eye', 'epilepsy'],
      'beagle': ['ear', 'obesity', 'back'],
      'chihuahua': ['heart', 'trachea', 'dental']
    };

    for (const [breedName, risks] of Object.entries(breedRisks)) {
      if (breed.includes(breedName)) {
        return risks;
      }
    }
    return [];
  }

  calculateConfidence(symptoms, hasEmergency, hasModerate) {
    let confidence = 0.5; // Base confidence

    // Length and detail of description
    if (symptoms.length > 50) confidence += 0.2;
    if (symptoms.length > 100) confidence += 0.1;

    // Presence of specific keywords
    if (hasEmergency) confidence += 0.3;
    if (hasModerate) confidence += 0.2;

    // Time indicators
    const timeWords = ['today', 'yesterday', 'hours', 'minutes', 'days'];
    if (timeWords.some(word => symptoms.toLowerCase().includes(word))) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  getUrgencyLevel(severity) {
    switch (severity) {
      case this.severityLevels.EMERGENCY:
        return 'Seek immediate veterinary care';
      case this.severityLevels.HIGH:
        return 'Contact veterinarian within 24 hours';
      case this.severityLevels.MODERATE:
        return 'Monitor closely, vet visit recommended';
      case this.severityLevels.LOW:
      default:
        return 'Continue monitoring, routine care';
    }
  }

  getBasicRecommendations(severity) {
    switch (severity) {
      case this.severityLevels.EMERGENCY:
        return [
          'Call emergency vet immediately',
          'Keep pet calm and quiet',
          'Do not give food or water',
          'Prepare for immediate transport'
        ];
      case this.severityLevels.HIGH:
        return [
          'Schedule vet appointment today',
          'Monitor symptoms closely',
          'Keep pet comfortable',
          'Note any changes'
        ];
      case this.severityLevels.MODERATE:
        return [
          'Schedule vet visit within few days',
          'Monitor eating and drinking',
          'Ensure pet is comfortable',
          'Document symptom progression'
        ];
      case this.severityLevels.LOW:
      default:
        return [
          'Continue normal routine',
          'Monitor for changes',
          'Ensure good nutrition',
          'Regular exercise as tolerated'
        ];
    }
  }

  // Generate enhanced prompt for LLM
  generateEnhancedPrompt(symptoms, petProfile, analysisResult, language = 'en') {
    const languageInstructions = {
      en: 'Respond in English',
      es: 'Responde en español',
      zh: 'Please respond in Chinese'
    };

    const contextualInfo = petProfile ? `
**Pet Information:**
- Name: ${petProfile.name}
- Breed: ${petProfile.breed}
- Age: ${petProfile.age} years old
- Gender: ${petProfile.gender}` : '';

    const prompt = `You are an expert veterinary advisor AI. ${languageInstructions[language] || languageInstructions.en}.

${contextualInfo}

**Reported Symptoms:** "${symptoms}"

**Initial Analysis Results:**
- Severity Level: ${analysisResult.level.toUpperCase()}
- Confidence: ${(analysisResult.confidence * 100).toFixed(0)}%
- Urgency: ${analysisResult.urgency}

**Instructions:**
1. **SEVERITY ASSESSMENT**: Confirm or adjust the severity level based on your analysis
2. **IMMEDIATE ACTIONS**: Provide specific immediate care steps
3. **MONITORING GUIDANCE**: What to watch for and how often
4. **VET RECOMMENDATIONS**: When and why to seek professional care
5. **PREVENTION TIPS**: How to prevent similar issues
6. **RED FLAGS**: Warning signs that require immediate emergency care

**Response Requirements:**
- Use clear sections with emojis (🚨 Emergency, 📋 Assessment, 🏥 Care Steps, etc.)
- Include specific timeframes (e.g., "within 2 hours", "monitor for 24-48 hours")
- Mention breed/age-specific considerations when relevant
- Provide actionable, practical advice
- Use caring, professional tone
- Include disclaimer about not replacing veterinary care

**Special Considerations:**
${petProfile ? `- This is a ${petProfile.age}-year-old ${petProfile.breed}` : ''}
- Current severity assessment: ${analysisResult.level}
- Consider breed-specific health risks
- Factor in age-related vulnerabilities

Please provide a comprehensive yet concise analysis and recommendations.`;

    return prompt;
  }

  // Store symptom history for pattern analysis
  async storeSymptomHistory(symptoms, analysis, response, petProfile) {
    try {
      const historyKey = `symptom_history_${petProfile?.name || 'unknown'}`;
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      const entry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        symptoms: symptoms,
        analysis: analysis,
        response: response,
        petInfo: petProfile ? {
          name: petProfile.name,
          breed: petProfile.breed,
          age: petProfile.age,
          gender: petProfile.gender
        } : null
      };

      history.unshift(entry); // Add to beginning
      
      // Keep only last 20 entries
      const limitedHistory = history.slice(0, 20);
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      
      return entry;
    } catch (error) {
      console.error('Error storing symptom history:', error);
      return null;
    }
  }

  // Get symptom history for pattern analysis
  async getSymptomHistory(petName = 'unknown') {
    try {
      const historyKey = `symptom_history_${petName}`;
      const history = await AsyncStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting symptom history:', error);
      return [];
    }
  }

  // Analyze patterns in symptom history
  analyzeSymptomPatterns(history) {
    if (history.length < 2) {
      return {
        hasPatterns: false,
        message: 'Not enough history to analyze patterns'
      };
    }

    const recentEntries = history.slice(0, 5);
    const commonSymptoms = this.findCommonSymptoms(recentEntries);
    const frequency = this.calculateSymptomFrequency(history);

    return {
      hasPatterns: commonSymptoms.length > 0,
      commonSymptoms: commonSymptoms,
      frequency: frequency,
      suggestion: this.generatePatternSuggestion(commonSymptoms, frequency)
    };
  }

  findCommonSymptoms(entries) {
    const symptomWords = {};
    
    entries.forEach(entry => {
      const words = entry.symptoms.toLowerCase().split(/[\s,]+/);
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          symptomWords[word] = (symptomWords[word] || 0) + 1;
        }
      });
    });

    return Object.entries(symptomWords)
      .filter(([word, count]) => count > 1)
      .map(([word, count]) => ({ symptom: word, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  calculateSymptomFrequency(history) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentEntries = history.filter(entry => 
      new Date(entry.timestamp) > thirtyDaysAgo
    );

    return {
      total: history.length,
      recent: recentEntries.length,
      averagePerMonth: recentEntries.length
    };
  }

  generatePatternSuggestion(commonSymptoms, frequency) {
    if (frequency.recent > 3) {
      return "Your pet has had several health concerns recently. Consider scheduling a comprehensive vet checkup to identify any underlying issues.";
    }

    if (commonSymptoms.length > 0) {
      const mainSymptom = commonSymptoms[0].symptom;
      return `"${mainSymptom}" appears frequently in your reports. This might indicate a chronic condition that needs veterinary attention.`;
    }

    return "No concerning patterns detected in recent symptom reports.";
  }
}

export default SymptomAnalysisService;