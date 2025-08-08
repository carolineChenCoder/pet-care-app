// Local LLM Service for Health Report Generation
class LocalLLMService {
  constructor() {
    // Try different localhost variations for React Native compatibility
    this.possibleURLs = [
      'http://localhost:11434/api',
      'http://127.0.0.1:11434/api',
      'http://192.168.199.204:11434/api', // Your machine's local IP
      'http://0.0.0.0:11434/api'
    ];
    this.baseURL = 'http://localhost:11434/api';
    this.model = 'llama3.1:latest';
    this.timeout = 60000; // 60 seconds timeout
  }

  async generateHealthReport(petProfile, language = 'en', reportType = 'comprehensive') {
    const prompt = this.createHealthReportPrompt(petProfile, language, reportType);
    
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          }
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Local LLM Error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseHealthReport(data.response);
      
    } catch (error) {
      console.error('Local LLM generation failed:', error);
      throw error;
    }
  }

  createHealthReportPrompt(petProfile, language, reportType) {
    const genderText = this.getGenderText(petProfile.gender, language);
    
    const basePrompt = `
You are a professional veterinary health advisor. Generate a comprehensive health report for the following pet:

**Pet Information:**
- Name: ${petProfile.name}
- Breed: ${petProfile.breed}
- Age: ${petProfile.age}
- Gender: ${genderText}

**Report Requirements:**
Please provide a well-structured health report in ${language === 'es' ? 'Spanish' : language === 'zh' ? 'Chinese' : 'English'} with the following sections:

🏥 **HEALTH OVERVIEW**
- Current health status assessment
- Age-appropriate health considerations
- Breed-specific health profile

🍽️ **NUTRITION RECOMMENDATIONS**
- Age and breed-specific dietary needs
- Portion size recommendations
- Special nutritional considerations

🏃 **EXERCISE & ACTIVITY**
- Daily exercise requirements
- Age-appropriate activities
- Breed-specific exercise needs

🩺 **PREVENTIVE CARE SCHEDULE**
- Vaccination schedule
- Regular checkup frequency
- Dental care recommendations
- Parasite prevention

⚠️ **HEALTH MONITORING**
- Warning signs to watch for
- Breed-specific health risks
- Gender-specific health considerations
- Emergency signs requiring immediate vet attention

📅 **ACTION ITEMS**
- Immediate actions needed
- Upcoming care requirements
- Long-term health goals

**Important:** 
- Use appropriate emojis for sections
- Keep recommendations practical and actionable
- Include specific timeframes where relevant
- Maintain a friendly but professional tone
- Focus on preventive care and early detection
`;

    return this.addReportTypeSpecifics(basePrompt, reportType);
  }

  addReportTypeSpecifics(basePrompt, reportType) {
    switch (reportType) {
      case 'basic':
        return basePrompt + '\n**Note:** Provide a concise, essential-only report focusing on immediate needs.';
      case 'detailed':
        return basePrompt + '\n**Note:** Include detailed explanations, additional tips, and comprehensive guidance.';
      case 'emergency':
        return basePrompt + '\n**Note:** Focus on urgent health concerns and immediate action items for this specific pet.';
      default:
        return basePrompt;
    }
  }

  getGenderText(gender, language) {
    const genderMap = {
      en: { male: 'Male', female: 'Female', unknown: 'Unknown' },
      es: { male: 'Macho', female: 'Hembra', unknown: 'Desconocido' },
      zh: { male: '雄性', female: '雌性', unknown: '未知' }
    };
    
    return genderMap[language]?.[gender] || genderMap.en[gender] || 'Unknown';
  }

  parseHealthReport(rawResponse) {
    // Parse the raw response and structure it
    const sections = this.extractSections(rawResponse);
    const actionItems = this.extractActionItems(rawResponse);
    
    return {
      fullReport: rawResponse,
      sections: sections,
      actionItems: actionItems,
      generatedAt: new Date().toISOString(),
      source: 'local_llm',
      model: this.model
    };
  }

  extractSections(text) {
    const sections = {};
    const sectionPatterns = {
      overview: /🏥.*?HEALTH OVERVIEW.*?\n(.*?)(?=🍽️|$)/s,
      nutrition: /🍽️.*?NUTRITION.*?\n(.*?)(?=🏃|$)/s,
      exercise: /🏃.*?EXERCISE.*?\n(.*?)(?=🩺|$)/s,
      preventive: /🩺.*?PREVENTIVE.*?\n(.*?)(?=⚠️|$)/s,
      monitoring: /⚠️.*?MONITORING.*?\n(.*?)(?=📅|$)/s,
      actions: /📅.*?ACTION.*?\n(.*?)$/s
    };

    Object.entries(sectionPatterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      sections[key] = match ? match[1].trim() : '';
    });

    return sections;
  }

  extractActionItems(text) {
    const actionItems = [];
    const actionPattern = /📅.*?ACTION ITEMS.*?\n(.*?)$/s;
    const match = text.match(actionPattern);
    
    if (match) {
      const actionsText = match[1];
      const items = actionsText.split('\n').filter(line => line.trim());
      
      items.forEach(item => {
        if (item.trim()) {
          actionItems.push({
            text: item.trim(),
            priority: this.determinePriority(item),
            completed: false
          });
        }
      });
    }
    
    return actionItems;
  }

  determinePriority(item) {
    const highPriorityKeywords = ['immediate', 'urgent', 'emergency', 'asap', 'now'];
    const mediumPriorityKeywords = ['soon', 'week', 'month', 'schedule'];
    
    const itemLower = item.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => itemLower.includes(keyword))) {
      return 'high';
    } else if (mediumPriorityKeywords.some(keyword => itemLower.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Test connection to local LLM
  async testConnection() {
    // Try each possible URL
    for (let i = 0; i < this.possibleURLs.length; i++) {
      const testURL = this.possibleURLs[i];
      console.log(`Testing connection to: ${testURL}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`${testURL}/tags`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Connection test response for ${testURL}:`, response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Available models:', data.models?.length || 0);
          
          if (data.models && data.models.length > 0) {
            // Update baseURL to working URL
            this.baseURL = testURL;
            console.log(`✅ Successfully connected using: ${testURL}`);
            return true;
          }
        }
      } catch (error) {
        console.error(`Connection failed for ${testURL}:`, error.message);
        continue; // Try next URL
      }
    }
    
    console.error('❌ All connection attempts failed');
    return false;
  }

  // Get available models
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }

  // Generate symptom analysis using local LLM
  async analyzeSymptoms(symptoms, petProfile, analysisResult, language = 'en') {
    const prompt = this.createSymptomAnalysisPrompt(symptoms, petProfile, analysisResult, language);
    
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1500,
            stop: ['---', 'END_ANALYSIS'],
          }
        }),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Local LLM Error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseSymptomAnalysis(data.response, analysisResult);
      
    } catch (error) {
      console.error('Local LLM symptom analysis failed:', error);
      throw error;
    }
  }

  createSymptomAnalysisPrompt(symptoms, petProfile, analysisResult, language) {
    const languageInstructions = {
      en: 'Respond in English',
      es: 'Responde en español',
      zh: 'Please respond in Chinese (中文)'
    };

    const contextualInfo = petProfile ? `
**Pet Information:**
- Name: ${petProfile.name}
- Breed: ${petProfile.breed}
- Age: ${petProfile.age} years old
- Gender: ${this.getGenderText(petProfile.gender, language)}` : '';

    const severityContext = {
      emergency: '🚨 This appears to be an EMERGENCY situation requiring immediate veterinary care.',
      high: '⚠️ This is a HIGH PRIORITY concern that needs prompt veterinary attention.',
      moderate: '📋 This is a MODERATE concern that should be monitored and may need veterinary care.',
      low: '✅ This appears to be a LOW PRIORITY concern for routine monitoring.'
    };

    const prompt = `You are an expert veterinary health advisor AI. ${languageInstructions[language] || languageInstructions.en}.

${contextualInfo}

**Reported Symptoms:** "${symptoms}"

**Initial Severity Assessment:** ${analysisResult.level.toUpperCase()}
${severityContext[analysisResult.level] || severityContext.low}

**Your Task:** Provide a comprehensive yet concise analysis with specific, actionable recommendations.

**Required Response Structure:**

🔍 **SYMPTOM ASSESSMENT**
- Confirm or adjust severity level
- Explain your reasoning
- Consider pet's age, breed, and gender

📋 **IMMEDIATE ACTIONS** 
- What to do RIGHT NOW
- Step-by-step care instructions
- What NOT to do

👁️ **MONITORING GUIDANCE**
- What specific signs to watch for
- How often to check
- When situation becomes more serious

🏥 **VETERINARY CARE**
- When to contact vet (be specific about timeframes)
- What information to provide to vet
- Emergency vs routine visit

🛡️ **PREVENTION & CARE**
- How to prevent similar issues
- Long-term care considerations
- ${petProfile ? `Specific advice for ${petProfile.breed} breed` : 'General breed considerations'}

⚠️ **RED FLAGS**
- Warning signs requiring IMMEDIATE emergency care
- Signs situation is worsening

**Important Guidelines:**
- Use friendly, caring, but professional tone
- Include specific timeframes (e.g., "within 2 hours", "monitor for 24-48 hours")
- ${petProfile ? `Consider this is a ${petProfile.age}-year-old ${petProfile.breed}` : 'Consider general pet care principles'}
- Add appropriate emojis for clarity
- Always include veterinary disclaimer
- Keep response under 500 words but comprehensive

**Language:** ${languageInstructions[language] || languageInstructions.en}`;

    return prompt;
  }

  parseSymptomAnalysis(rawResponse, analysisResult) {
    // Parse the structured response
    const sections = this.extractSymptomSections(rawResponse);
    
    // Extract any severity adjustments from the AI response
    const aiSeverity = this.extractAISeverity(rawResponse);
    
    return {
      fullResponse: rawResponse,
      sections: sections,
      originalSeverity: analysisResult.level,
      aiAdjustedSeverity: aiSeverity || analysisResult.level,
      confidence: analysisResult.confidence,
      urgency: analysisResult.urgency,
      generatedAt: new Date().toISOString(),
      source: 'local_llm',
      model: this.model
    };
  }

  extractSymptomSections(text) {
    const sections = {};
    const sectionPatterns = {
      assessment: /🔍.*?SYMPTOM ASSESSMENT.*?\n(.*?)(?=📋|$)/s,
      actions: /📋.*?IMMEDIATE ACTIONS.*?\n(.*?)(?=👁️|$)/s,
      monitoring: /👁️.*?MONITORING.*?\n(.*?)(?=🏥|$)/s,
      veterinary: /🏥.*?VETERINARY.*?\n(.*?)(?=🛡️|$)/s,
      prevention: /🛡️.*?PREVENTION.*?\n(.*?)(?=⚠️|$)/s,
      redflags: /⚠️.*?RED FLAGS.*?\n(.*?)$/s
    };

    Object.entries(sectionPatterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      sections[key] = match ? match[1].trim() : '';
    });

    return sections;
  }

  extractAISeverity(text) {
    const severityPatterns = {
      emergency: /emergency|immediate|urgent.*care|critical|serious/i,
      high: /high.*priority|prompt.*attention|soon.*vet/i,
      moderate: /moderate|monitor.*closely|routine.*care/i,
      low: /low.*priority|minor|routine.*monitoring/i
    };

    // Check first few lines for severity indicators
    const firstParagraph = text.split('\n').slice(0, 3).join(' ').toLowerCase();
    
    for (const [severity, pattern] of Object.entries(severityPatterns)) {
      if (pattern.test(firstParagraph)) {
        return severity;
      }
    }
    
    return null;
  }

  // Quick symptom analysis for simple cases
  async quickSymptomCheck(symptoms, language = 'en') {
    const prompt = `As a pet health assistant, provide brief advice for: "${symptoms}". 
    ${language === 'es' ? 'Responde en español.' : language === 'zh' ? '请用中文回答。' : 'Respond in English.'}
    
    Keep response under 150 words. Include:
    - Severity level (Low/Moderate/High/Emergency)
    - 2-3 immediate care steps
    - When to see vet
    
    Use caring tone with emojis.`;

    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.6,
            max_tokens: 200,
          }
        }),
        timeout: 30000, // Shorter timeout for quick check
      });

      if (!response.ok) {
        throw new Error(`Quick check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.response,
        source: 'local_llm_quick',
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Quick symptom check failed:', error);
      throw error;
    }
  }
}

export default LocalLLMService;