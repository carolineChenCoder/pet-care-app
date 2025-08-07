// Local LLM Service for Health Report Generation
class LocalLLMService {
  constructor() {
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
    try {
      const response = await fetch(`${this.baseURL}/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
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
}

export default LocalLLMService;