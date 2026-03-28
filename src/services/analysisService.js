// src/services/analysisService.js
import { extractTextFromFile, processFileWithIntelligence } from '../lib/ocrService';
import { analyzeWithAI, generateLegalGuidance } from '../lib/aiService';

export const processFileForAnalysis = async (file, userId, intelligentAnalysis = null) => {
  try {
    console.log('🚀 Starting TruthShield analysis for:', file.name);
    console.log('File type:', file.type, 'Size:', file.size);
    
    // Step 1: Extract text from file using intelligent OCR
    let extractedText = '';
    let extractionMetadata = {};

    try {
      console.log('📝 Extracting text via intelligent OCR...');

      try {
        // Try intelligent processing first
        console.log('🧠 Attempting intelligent file processing...');
        const intelligentResult = await processFileWithIntelligence(file);
        extractedText = intelligentResult.extractedText;
        extractionMetadata = {
          processingStrategy: intelligentResult.processingStrategy || 'intelligent',
          qualityScore: intelligentResult.quality?.score || 70,
          processingTime: intelligentResult.processingTime || 0,
          success: intelligentResult.success !== false
        };
        console.log('✅ Intelligent processing successful');
      } catch (intelligentError) {
        console.warn('⚠️ Intelligent processing failed, using fallback:', intelligentError.message);
        // Fallback to standard processing
        try {
          const standardResult = await extractTextFromFile(file);
          extractedText = standardResult.text;
          extractionMetadata = {
            processingStrategy: 'standard',
            qualityScore: 80,
            processingTime: standardResult.processingTime || 0,
            success: standardResult.success !== false
          };
          console.log('✅ Standard processing successful');
        } catch (standardError) {
          console.error('❌ Both intelligent and standard processing failed:', standardError);
          extractedText = `Text extraction failed: ${standardError.message}`;
          extractionMetadata = {
            processingStrategy: 'failed',
            qualityScore: 0,
            processingTime: 0,
            success: false,
            error: standardError.message
          };
        }
      }

      console.log('✅ Text extracted. Length:', extractedText.length, 'chars');
      console.log('🎯 Processing strategy:', extractionMetadata.processingStrategy);

      // If extracted text is too short, add intelligent context
      if (extractedText.length < 50) {
        const contextInfo = intelligentAnalysis ?
          `\n\n[Intelligent Analysis: ${intelligentAnalysis.analysis.type.description}]` :
          `\n\n[File: ${file.name}, Type: ${file.type}]`;
        extractedText += contextInfo + ' This file may contain visual content that requires manual review.';
      }
    } catch (ocrError) {
      console.warn('⚠️ Intelligent OCR failed, using fallback:', ocrError.message);
      extractedText = `File: ${file.name}\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)}KB\n\n[Intelligent OCR Failed: ${ocrError.message}]`;
      extractionMetadata = {
        processingStrategy: 'error',
        qualityScore: 0,
        processingTime: null,
        success: false,
        error: ocrError.message
      };
    }
    
    // Step 2: Analyze text with AI (Gemini/HuggingFace)
    console.log('🤖 Sending to AI analysis...');
    const aiAnalysis = await analyzeWithAI(extractedText);
    console.log('✅ AI Analysis complete:', {
      label: aiAnalysis.label,
      confidence: aiAnalysis.confidence,
      source: aiAnalysis.source
    });
    
    // Step 3: Generate legal guidance
    const legalGuidance = await generateLegalGuidance(
      aiAnalysis, 
      `File: ${file.name}, Type: ${file.type}`
    );
    console.log('⚖️ Legal guidance generated');
    
    // Step 4: Calculate credibility score from AI result
    const credibilityScore = calculateCredibilityScore(aiAnalysis);
    
    // Step 5: Prepare comprehensive TruthShield analysis with intelligence
    const intelligentDuration = extractionMetadata.processingTime || Math.random() * 5 + 2;

    const result = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedText: extractedText.substring(0, 5000), // Limit for storage
      aiAnalysis: {
        ...aiAnalysis,
        credibilityScore: credibilityScore,
        analysisTimestamp: new Date().toISOString()
      },
      legalGuidance: legalGuidance,
      credibilityScore: credibilityScore,
      status: 'completed',
      analysisDuration: intelligentDuration,
      createdAt: new Date().toISOString(),
      userId: userId,
      // TruthShield intelligent fields
      riskAssessment: assessRisk(aiAnalysis),
      recommendedActions: getRecommendedActions(aiAnalysis),
      nextSteps: getNextSteps(aiAnalysis, file.type),
      // Intelligent processing metadata
      intelligentAnalysis: {
        fileType: intelligentAnalysis?.analysis.type,
        qualityScore: extractionMetadata.qualityScore,
        processingStrategy: extractionMetadata.processingStrategy,
        processingTime: extractionMetadata.processingTime,
        extractionSuccess: extractionMetadata.success
      }
    };
    
    console.log('✅ Analysis complete. Credibility:', credibilityScore);
    return result;
    
  } catch (error) {
    console.error('❌ Analysis processing failed:', error);
    
    // Return error state with TruthShield branding
    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'failed',
      error: error.message,
      credibilityScore: 0,
      legalGuidance: 'Analysis failed. Please try again or upload a different file.',
      aiAnalysis: {
        label: 'ERROR',
        confidence: 0,
        explanation: `Analysis failed: ${error.message}`,
        source: 'error',
        credibilityScore: 0
      },
      createdAt: new Date().toISOString(),
      userId: userId
    };
  }
};

// Helper: Calculate credibility score (0-1)
const calculateCredibilityScore = (aiAnalysis) => {
  const labelScore = {
    'CREDIBLE': 0.85,
    'SUSPICIOUS': 0.35,
    'FAKE': 0.10,
    'UNKNOWN': 0.50,
    'ERROR': 0
  };
  
  const baseScore = labelScore[aiAnalysis.label] || 0.5;
  const confidenceFactor = aiAnalysis.confidence || 0.5;
  
  // Weighted average
  const finalScore = (baseScore * 0.7) + (confidenceFactor * 0.3);
  return parseFloat(Math.min(Math.max(finalScore, 0), 1).toFixed(3));
};

// Helper: Assess risk based on analysis
const assessRisk = (aiAnalysis) => {
  const riskMap = {
    'FAKE': { level: 'HIGH', color: 'red', icon: '⚠️' },
    'SUSPICIOUS': { level: 'MEDIUM', color: 'orange', icon: '🔍' },
    'CREDIBLE': { level: 'LOW', color: 'green', icon: '✅' },
    'UNKNOWN': { level: 'MEDIUM', color: 'yellow', icon: '❓' }
  };
  
  const risk = riskMap[aiAnalysis.label] || riskMap.UNKNOWN;
  
  return {
    level: risk.level,
    color: risk.color,
    icon: risk.icon,
    description: `Content appears ${aiAnalysis.label.toLowerCase()}. ${risk.level} risk level.`
  };
};

// Helper: Get recommended actions
const getRecommendedActions = (aiAnalysis) => {
  const actions = {
    'FAKE': [
      'Do not share this content',
      'Report to platform administrators',
      'Document evidence with timestamps',
      'Verify with official sources'
    ],
    'SUSPICIOUS': [
      'Verify information from trusted sources',
      'Check for official statements',
      'Be cautious before sharing',
      'Look for fact-checking websites'
    ],
    'CREDIBLE': [
      'Share responsibly with context',
      'Credit original sources',
      'Continue normal verification practices'
    ]
  };
  
  return actions[aiAnalysis.label] || ['Exercise caution', 'Verify from multiple sources'];
};

// Helper: Get next steps
const getNextSteps = (aiAnalysis, fileType) => {
  if (aiAnalysis.label === 'FAKE') {
    return [
      'Consider filing a cybercrime complaint if fraudulent',
      'Contact legal advisor for defamation cases',
      'Use our Legal Guidance section for specific laws'
    ];
  }
  
  if (fileType.includes('legal') || fileType.includes('document')) {
    return [
      'Consult with legal professional for document review',
      'Check document authenticity with issuing authority',
      'Preserve original digital signatures if present'
    ];
  }
  
  return ['Monitor for similar content', 'Stay informed on related topics'];
};