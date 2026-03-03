// Test file for Symptom Analysis Service
import symptomAnalysisService from '../services/symptomAnalysisService.js';

describe('Symptom Analysis Service', () => {
  test('should analyze basic symptoms', async () => {
    const result = await symptomAnalysisService.analyzeSymptoms(
      'headache and fever',
      { severity: 'mild', duration: '1-2days' }
    );
    
    expect(result.possibleConditions).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.urgencyLevel).toBeDefined();
    expect(result.possibleConditions.length).toBeGreaterThan(0);
  });

  test('should detect emergency symptoms', () => {
    const isEmergency = symptomAnalysisService.isEmergency('severe chest pain and shortness of breath');
    expect(isEmergency).toBe(true);
  });

  test('should validate symptom input', () => {
    const validation1 = symptomAnalysisService.validateSymptoms('headache');
    expect(validation1.isValid).toBe(true);
    
    const validation2 = symptomAnalysisService.validateSymptoms('ab');
    expect(validation2.isValid).toBe(false);
  });

  test('should provide symptom suggestions', () => {
    const suggestions = symptomAnalysisService.getSymptomSuggestions('head');
    expect(suggestions).toContain('headache');
  });

  test('should determine urgency correctly', () => {
    const service = symptomAnalysisService;
    
    // High urgency
    const highUrgency = service.determineUrgency(
      [{ name: 'chest pain', weight: 0.95 }], 
      'severe'
    );
    expect(highUrgency).toBe('high');
    
    // Low urgency
    const lowUrgency = service.determineUrgency(
      [{ name: 'headache', weight: 0.6 }], 
      'mild'
    );
    expect(lowUrgency).toBe('low');
  });

  test('should handle complex symptom analysis', async () => {
    const complexSymptoms = 'I have been experiencing persistent headaches for the past week, along with mild fever, fatigue, and some nausea. The headache is moderate and gets worse in the evening.';
    
    const result = await symptomAnalysisService.analyzeSymptoms(
      complexSymptoms,
      { 
        severity: 'moderate', 
        duration: '1-2weeks',
        additionalInfo: {
          age: '35',
          gender: 'female'
        }
      }
    );
    
    expect(result.possibleConditions).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.analysisMethod).toBeDefined();
  });

  test('should extract symptoms correctly', () => {
    const service = symptomAnalysisService;
    const symptoms = service.extractSymptoms('I have a headache and fever with some nausea');
    
    expect(symptoms.length).toBeGreaterThan(0);
    expect(symptoms.some(s => s.name === 'headache')).toBe(true);
    expect(symptoms.some(s => s.name === 'fever')).toBe(true);
    expect(symptoms.some(s => s.name === 'nausea')).toBe(true);
  });

  test('should calculate condition probabilities', () => {
    const service = symptomAnalysisService;
    const detectedSymptoms = [
      { name: 'fever', weight: 0.8 },
      { name: 'cough', weight: 0.5 },
      { name: 'sore throat', weight: 0.4 }
    ];
    
    const conditions = service.calculateConditionProbabilities(detectedSymptoms, {});
    
    expect(conditions).toBeDefined();
    expect(conditions.length).toBeGreaterThan(0);
    expect(conditions[0]).toHaveProperty('condition');
    expect(conditions[0]).toHaveProperty('confidence');
    expect(conditions[0]).toHaveProperty('description');
  });
});

// Manual testing function for development
export const runManualTests = async () => {
  console.log('=== Manual Symptom Analysis Tests ===');
  
  // Test 1: Basic symptoms
  console.log('\n1. Testing basic symptoms...');
  try {
    const result1 = await symptomAnalysisService.analyzeSymptoms(
      'headache, fever, and fatigue',
      { severity: 'mild', duration: '1-2days' }
    );
    console.log('Result:', result1);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test 2: Emergency symptoms
  console.log('\n2. Testing emergency detection...');
  const emergency = symptomAnalysisService.isEmergency('severe chest pain');
  console.log('Emergency detected:', emergency);
  
  // Test 3: Complex symptoms
  console.log('\n3. Testing complex symptoms...');
  try {
    const result3 = await symptomAnalysisService.analyzeSymptoms(
      'I have been having stomach pain, nausea, and diarrhea for 2 days',
      { severity: 'moderate', duration: '1-2days' }
    );
    console.log('Complex analysis:', result3);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test 4: Symptom suggestions
  console.log('\n4. Testing symptom suggestions...');
  const suggestions = symptomAnalysisService.getSymptomSuggestions('ab');
  console.log('Suggestions for "ab":', suggestions);
  
  console.log('\n=== Tests Complete ===');
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.testSymptomAnalysis = runManualTests;
}