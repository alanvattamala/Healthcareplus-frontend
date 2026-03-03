// Symptom Analysis Service
// This service provides AI-powered symptom analysis capabilities
// It can be extended to integrate with real medical AI APIs like:
// - Hugging Face medical models
// - IBM Watson Health
// - Google Cloud Healthcare AI
// - Custom trained models

class SymptomAnalysisService {
  constructor() {
    // Note: We now primarily use the backend API for analysis
    // This client-side service is kept for emergency fallback only
    this.apiEndpoint = import.meta.env?.VITE_AI_API_ENDPOINT || null;
    this.huggingFaceToken = import.meta.env?.VITE_HUGGING_FACE_TOKEN || null;
    
    // Medical knowledge base for symptom mapping
    this.medicalKnowledge = {
      symptoms: {
        fever: {
          weight: 0.8,
          associatedWith: ['infection', 'flu', 'covid', 'bacterial_infection'],
          urgency: 'moderate'
        },
        'chest pain': {
          weight: 0.95,
          associatedWith: ['heart_attack', 'angina', 'pneumonia', 'anxiety'],
          urgency: 'high'
        },
        'shortness of breath': {
          weight: 0.9,
          associatedWith: ['asthma', 'heart_failure', 'pneumonia', 'covid'],
          urgency: 'high'
        },
        headache: {
          weight: 0.6,
          associatedWith: ['tension', 'migraine', 'dehydration', 'hypertension'],
          urgency: 'low'
        },
        cough: {
          weight: 0.5,
          associatedWith: ['cold', 'flu', 'bronchitis', 'pneumonia'],
          urgency: 'low'
        },
        'sore throat': {
          weight: 0.4,
          associatedWith: ['strep_throat', 'viral_infection', 'allergies'],
          urgency: 'low'
        },
        nausea: {
          weight: 0.5,
          associatedWith: ['gastroenteritis', 'food_poisoning', 'pregnancy', 'migraine'],
          urgency: 'low'
        },
        fatigue: {
          weight: 0.3,
          associatedWith: ['anemia', 'depression', 'thyroid', 'infection'],
          urgency: 'low'
        },
        dizziness: {
          weight: 0.6,
          associatedWith: ['vertigo', 'low_blood_pressure', 'dehydration', 'anemia'],
          urgency: 'moderate'
        },
        'abdominal pain': {
          weight: 0.7,
          associatedWith: ['appendicitis', 'gastroenteritis', 'gallstones', 'ulcer'],
          urgency: 'moderate'
        }
      },
      
      conditions: {
        viral_upper_respiratory: {
          name: 'Viral Upper Respiratory Infection',
          description: 'Common cold or flu-like illness caused by viral infection',
          symptoms: ['fever', 'cough', 'sore throat', 'runny nose', 'fatigue'],
          treatmentAdvice: [
            'Rest and stay hydrated',
            'Use over-the-counter pain relievers if needed',
            'Gargle with warm salt water for sore throat',
            'Avoid antibiotics (ineffective against viruses)'
          ],
          duration: '3-7 days',
          urgency: 'low'
        },
        influenza: {
          name: 'Influenza (Flu)',
          description: 'Seasonal flu with typical symptoms including body aches',
          symptoms: ['fever', 'cough', 'fatigue', 'muscle aches', 'headache'],
          treatmentAdvice: [
            'Rest and increase fluid intake',
            'Antiviral medication if started within 48 hours',
            'Monitor temperature and symptoms',
            'Isolate to prevent spread'
          ],
          duration: '5-10 days',
          urgency: 'moderate'
        },
        tension_headache: {
          name: 'Tension Headache',
          description: 'Most common type of headache, often stress-related',
          symptoms: ['headache', 'neck tension', 'fatigue'],
          treatmentAdvice: [
            'Apply hot or cold compress to head/neck',
            'Practice relaxation techniques',
            'Maintain regular sleep schedule',
            'Stay hydrated and limit caffeine'
          ],
          duration: '30 minutes to several hours',
          urgency: 'low'
        },
        migraine: {
          name: 'Migraine',
          description: 'Severe headache often with sensitivity to light and sound',
          symptoms: ['severe headache', 'nausea', 'sensitivity to light', 'sensitivity to sound'],
          treatmentAdvice: [
            'Rest in quiet, dark room',
            'Apply cold compress to forehead',
            'Stay hydrated',
            'Consider prescription migraine medications'
          ],
          duration: '4-72 hours',
          urgency: 'moderate'
        },
        gastroenteritis: {
          name: 'Gastroenteritis',
          description: 'Stomach flu or intestinal infection causing digestive symptoms',
          symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'],
          treatmentAdvice: [
            'Stay hydrated with clear fluids',
            'Follow BRAT diet (Bananas, Rice, Applesauce, Toast)',
            'Rest and avoid dairy/fatty foods',
            'Seek medical attention if dehydration occurs'
          ],
          duration: '1-3 days',
          urgency: 'moderate'
        },
        cardiac_concern: {
          name: 'Possible Cardiac Issue',
          description: 'Chest pain or related symptoms requiring immediate medical evaluation',
          symptoms: ['chest pain', 'shortness of breath', 'sweating', 'nausea'],
          treatmentAdvice: [
            'Seek immediate medical attention',
            'Call emergency services if severe',
            'Do not ignore chest pain',
            'Avoid physical exertion'
          ],
          duration: 'Variable',
          urgency: 'high'
        }
      }
    };
  }

  // Main analysis method
  async analyzeSymptoms(symptomText, context = {}) {
    try {
      // Try AI API first, fall back to rule-based analysis
      if (this.apiEndpoint || this.huggingFaceToken) {
        return await this.aiAnalysis(symptomText, context);
      } else {
        return await this.ruleBasedAnalysis(symptomText, context);
      }
    } catch (error) {
      console.error('Symptom analysis error:', error);
      // Fallback to rule-based analysis
      return await this.ruleBasedAnalysis(symptomText, context);
    }
  }

  // Hugging Face AI Integration
  async aiAnalysis(symptomText, context) {
    if (!this.huggingFaceToken) {
      throw new Error('Hugging Face token not configured');
    }

    try {
      // Use multiple medical models for better analysis
      const models = [
        'microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext',
        'emilyalsentzer/Bio_ClinicalBERT',
        'microsoft/DialoGPT-medium'
      ];
      
      // Try the primary medical model first
      const primaryModel = models[0];
      
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${primaryModel}`,
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `Analyze these medical symptoms and provide diagnosis suggestions: ${symptomText}. Consider severity: ${context.severity}, duration: ${context.duration}`,
            parameters: {
              max_length: 200,
              temperature: 0.3, // Lower temperature for medical accuracy
              do_sample: true,
              return_full_text: false
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        }
      );

      if (!response.ok) {
        // Try fallback model
        return await this.tryFallbackModel(symptomText, context);
      }

      const result = await response.json();
      
      // Process AI response and combine with rule-based knowledge
      return this.processAIResponse(result, symptomText, context);
      
    } catch (error) {
      console.error('Hugging Face API error:', error);
      // Fallback to rule-based analysis
      return await this.ruleBasedAnalysis(symptomText, context);
    }
  }

  // Try fallback AI model if primary fails
  async tryFallbackModel(symptomText, context) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `Medical symptom analysis: ${symptomText}`,
            parameters: {
              max_length: 150,
              temperature: 0.5
            }
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return this.processAIResponse(result, symptomText, context);
      }
    } catch (error) {
      console.error('Fallback model error:', error);
    }
    
    // Final fallback to rule-based
    return await this.ruleBasedAnalysis(symptomText, context);
  }

  // Process AI response and enhance with medical knowledge
  processAIResponse(aiResponse, symptomText, context) {
    // Extract insights from AI response
    const aiInsights = aiResponse[0]?.generated_text || '';
    
    // Combine with rule-based analysis
    const ruleBasedResult = this.ruleBasedAnalysisSync(symptomText, context);
    
    // Enhance with AI insights
    return {
      ...ruleBasedResult,
      aiInsights,
      analysisMethod: 'ai-enhanced'
    };
  }

  // Rule-based analysis (synchronous version)
  ruleBasedAnalysisSync(symptomText, context = {}) {
    const lowerSymptoms = symptomText.toLowerCase();
    const { severity = 'mild', duration = '', additionalInfo = {} } = context;
    
    // Extract symptoms from text
    const detectedSymptoms = this.extractSymptoms(lowerSymptoms);
    
    // Calculate condition probabilities
    const possibleConditions = this.calculateConditionProbabilities(detectedSymptoms, context);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(possibleConditions, detectedSymptoms, context);
    
    // Determine urgency
    const urgencyLevel = this.determineUrgency(detectedSymptoms, severity);
    
    return {
      possibleConditions: possibleConditions.slice(0, 3), // Top 3 conditions
      recommendations,
      urgencyLevel,
      detectedSymptoms,
      confidence: Math.max(...possibleConditions.map(c => c.confidence)),
      disclaimer: 'This analysis is for informational purposes only and should not replace professional medical consultation.',
      analysisMethod: 'rule-based'
    };
  }

  // Rule-based analysis (async wrapper)
  async ruleBasedAnalysis(symptomText, context = {}) {
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    return this.ruleBasedAnalysisSync(symptomText, context);
  }

  // Extract symptoms from text
  extractSymptoms(text) {
    const symptoms = [];
    Object.keys(this.medicalKnowledge.symptoms).forEach(symptom => {
      if (text.includes(symptom)) {
        symptoms.push({
          name: symptom,
          weight: this.medicalKnowledge.symptoms[symptom].weight,
          urgency: this.medicalKnowledge.symptoms[symptom].urgency
        });
      }
    });
    return symptoms;
  }

  // Calculate condition probabilities based on symptoms
  calculateConditionProbabilities(detectedSymptoms, context) {
    const conditionScores = {};
    
    // Initialize scores
    Object.keys(this.medicalKnowledge.conditions).forEach(conditionKey => {
      conditionScores[conditionKey] = 0;
    });
    
    // Calculate scores based on symptom matches
    detectedSymptoms.forEach(symptom => {
      const symptomData = this.medicalKnowledge.symptoms[symptom.name];
      if (symptomData && symptomData.associatedWith) {
        symptomData.associatedWith.forEach(condition => {
          if (conditionScores.hasOwnProperty(condition)) {
            conditionScores[condition] += symptom.weight;
          }
        });
      }
    });
    
    // Special logic for common combinations
    const symptomNames = detectedSymptoms.map(s => s.name);
    
    // Fever + respiratory symptoms = likely viral infection
    if (symptomNames.includes('fever') && 
        (symptomNames.includes('cough') || symptomNames.includes('sore throat'))) {
      conditionScores.viral_upper_respiratory += 0.3;
      conditionScores.influenza += 0.25;
    }
    
    // Chest pain or shortness of breath = cardiac concern
    if (symptomNames.includes('chest pain') || symptomNames.includes('shortness of breath')) {
      conditionScores.cardiac_concern += 0.5;
    }
    
    // Digestive symptoms = gastroenteritis
    if (symptomNames.includes('nausea') && symptomNames.includes('abdominal pain')) {
      conditionScores.gastroenteritis += 0.4;
    }
    
    // Convert scores to conditions with confidence percentages
    const conditions = Object.entries(conditionScores)
      .filter(([_, score]) => score > 0.1)
      .map(([conditionKey, score]) => {
        const condition = this.medicalKnowledge.conditions[conditionKey];
        return {
          condition: condition.name,
          confidence: Math.min(Math.round(score * 100), 95), // Cap at 95%
          description: condition.description,
          treatmentAdvice: condition.treatmentAdvice,
          duration: condition.duration,
          urgency: condition.urgency
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
    
    return conditions.length > 0 ? conditions : [{
      condition: 'General Health Concern',
      confidence: 60,
      description: 'Your symptoms require professional medical evaluation',
      treatmentAdvice: ['Schedule an appointment with your healthcare provider'],
      duration: 'Variable',
      urgency: 'moderate'
    }];
  }

  // Generate personalized recommendations
  generateRecommendations(possibleConditions, detectedSymptoms, context) {
    const recommendations = [];
    const topCondition = possibleConditions[0];
    
    if (topCondition) {
      // Add condition-specific advice
      if (topCondition.treatmentAdvice) {
        recommendations.push(...topCondition.treatmentAdvice.slice(0, 3));
      }
    }
    
    // Add severity-based recommendations
    if (context.severity === 'severe' || topCondition?.urgency === 'high') {
      recommendations.unshift('Seek immediate medical attention');
    }
    
    // Add duration-based recommendations
    if (context.duration === 'longer') {
      recommendations.push('Consider seeing a specialist for persistent symptoms');
    }
    
    // Add general health recommendations
    recommendations.push('Monitor your symptoms and track any changes');
    recommendations.push('Stay hydrated and get adequate rest');
    
    // Add disclaimer
    recommendations.push('This analysis is not a substitute for professional medical advice');
    recommendations.push('Consult with a healthcare provider for proper diagnosis and treatment');
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Determine urgency level
  determineUrgency(detectedSymptoms, severity) {
    const highUrgencySymptoms = ['chest pain', 'shortness of breath', 'severe headache'];
    const moderateUrgencySymptoms = ['fever', 'abdominal pain', 'dizziness'];
    
    const symptomNames = detectedSymptoms.map(s => s.name);
    
    // Check for high urgency symptoms
    if (symptomNames.some(s => highUrgencySymptoms.includes(s)) || severity === 'severe') {
      return 'high';
    }
    
    // Check for moderate urgency symptoms
    if (symptomNames.some(s => moderateUrgencySymptoms.includes(s)) || severity === 'moderate') {
      return 'moderate';
    }
    
    return 'low';
  }

  // Get symptom suggestions based on partial input
  getSymptomSuggestions(input) {
    const suggestions = [];
    const lowerInput = input.toLowerCase();
    
    Object.keys(this.medicalKnowledge.symptoms).forEach(symptom => {
      if (symptom.includes(lowerInput)) {
        suggestions.push({
          symptom,
          relevance: this.medicalKnowledge.symptoms[symptom].weight
        });
      }
    });
    
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(s => s.symptom);
  }

  // Validate symptoms input
  validateSymptoms(symptoms) {
    if (!symptoms || symptoms.trim().length < 3) {
      return {
        isValid: false,
        message: 'Please provide more detailed symptom description (at least 3 characters)'
      };
    }
    
    if (symptoms.length > 1000) {
      return {
        isValid: false,
        message: 'Symptom description is too long (maximum 1000 characters)'
      };
    }
    
    return { isValid: true };
  }

  // Get emergency keywords that require immediate attention
  getEmergencyKeywords() {
    return [
      'chest pain',
      'heart attack',
      'can\'t breathe',
      'severe bleeding',
      'unconscious',
      'seizure',
      'stroke symptoms',
      'severe allergic reaction',
      'poisoning'
    ];
  }

  // Check if symptoms indicate emergency
  isEmergency(symptomText) {
    const lowerText = symptomText.toLowerCase();
    return this.getEmergencyKeywords().some(keyword => lowerText.includes(keyword));
  }
}

// Export singleton instance
const symptomAnalysisService = new SymptomAnalysisService();
export default symptomAnalysisService;