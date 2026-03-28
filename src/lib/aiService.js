// src/lib/aiService.js - COMPLETE CORRECTED VERSION

// Main analysis function - FIXED VERSION
export const analyzeWithAI = async (text) => {
  console.log('=== GEMINI INPUT TEXT ===');
console.log('Length:', text.length);
console.log('First 500 chars:', text.substring(0, 500));
console.log('Contains "invoice":', text.toLowerCase().includes('invoice'));
console.log('Contains "payment":', text.toLowerCase().includes('payment'));
console.log('Contains "PDF":', text.includes('PDF'));
console.log('=== END INPUT TEXT ===');



  console.log('🔍 ======= TRUTHSHIELD AI ANALYSIS START =======');
  console.log('📝 Text length:', text.length);
  console.log('📋 Sample text (first 200 chars):', text.substring(0, 200) + '...');
  
  // DEBUG: Check environment variables
  console.log('📋 Environment variables check:');
  console.log('- VITE_USE_MOCK_AI:', import.meta.env.VITE_USE_MOCK_AI);
  console.log('- VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('- VITE_GEMINI_API_KEY (first 15 chars):', 
    import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.substring(0, 15) + '...' : 'MISSING');
  
  // FIX: Check if we should use mock AI (handle string "true"/"false")
  const shouldUseMock = import.meta.env.VITE_USE_MOCK_AI === 'true';
  
  console.log('🤖 Should use mock analysis?', shouldUseMock);
  
  if (shouldUseMock) {
    console.log('🔄 Using MOCK analysis (VITE_USE_MOCK_AI is "true")');
    return await analyzeMock(text);
  }
  
  console.log('🔄 Attempting REAL AI analysis...');
  
  // Try AI services in order
  try {
    // 1. Try Gemini
    console.log('📤 [1/3] Attempting Gemini API...');
    const geminiResult = await analyzeWithGemini(text);
    console.log('📥 Gemini result:', geminiResult);
    
    if (geminiResult && geminiResult.label !== 'ERROR' && geminiResult.source === 'gemini') {
      console.log('✅ Gemini analysis SUCCESSFUL!');
      console.log('Label:', geminiResult.label);
      console.log('Confidence:', geminiResult.confidence);
      console.log('Source:', geminiResult.source);
      return geminiResult;
    } else {
      console.warn('⚠️ Gemini failed or returned error');
    }
    
    // 2. Try Hugging Face
    console.log('📤 [2/3] Attempting Hugging Face API...');
    const hfResult = await analyzeWithHuggingFace(text);
    console.log('📥 Hugging Face result:', hfResult);
    
    if (hfResult && hfResult.label !== 'ERROR') {
      console.log('✅ Hugging Face analysis SUCCESSFUL!');
      return hfResult;
    } else {
      console.warn('⚠️ Hugging Face failed or returned error');
    }
    
    // 3. Fallback to mock
    console.log('🔄 [3/3] All AI services failed, falling back to mock analysis');
    return await analyzeMock(text);
    
  } catch (error) {
    console.error('❌ All AI services failed with error:', error.message);
    console.error('Error stack:', error.stack);
    return await analyzeMock(text);
  }
};

// Google Gemini Analysis - IMPROVED VERSION
export const analyzeWithGemini = async (text) => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('🔑 Gemini API Key check:', 
      GEMINI_API_KEY ? '✅ Present (length: ' + GEMINI_API_KEY.length + ')' : '❌ MISSING');
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.error('❌ Gemini API key not configured');
      return {
        label: 'ERROR',
        confidence: 0,
        explanation: 'Gemini API key not configured',
        source: 'error'
      };
    }
    
    // Validate API key format
    if (!GEMINI_API_KEY.startsWith('AIza')) {
      console.error('❌ Invalid Gemini API key format');
      return {
        label: 'ERROR',
        confidence: 0,
        explanation: 'Invalid Gemini API key format',
        source: 'error'
      };
    }
    
    console.log('📤 Sending request to Gemini API...');
    
   // In analyzeWithGemini function - UPDATE THE PROMPT
const prompt = `Analyze this invoice/document for authenticity and fraud indicators.
Return ONLY valid JSON:
{
  "label": "FAKE" (for fraudulent/scam), 
  "SUSPICIOUS" (for questionable), 
  "CREDIBLE" (for legitimate), 
  "NOT_APPLICABLE" (if not analyzable)
  "confidence": 0.85,
  "explanation": "brief reason",
  "keywords": ["fraud", "legitimate", etc]
}

Text: "${text.substring(0, 800)}"

Focus on: urgent demands, payment methods, threats, company details, formatting.

JSON ONLY:`;


    const startTime = Date.now();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`📥 Gemini response received in ${responseTime}ms`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error status:', response.status);
      console.error('Error details:', errorText);
      
      if (response.status === 400) {
        return {
          label: 'ERROR',
          confidence: 0,
          explanation: 'Bad request to Gemini API. Check API key.',
          source: 'error'
        };
      } else if (response.status === 403) {
        return {
          label: 'ERROR',
          confidence: 0,
          explanation: 'Gemini API access forbidden. Check API key permissions.',
          source: 'error'
        };
      } else if (response.status === 429) {
        return {
          label: 'ERROR',
          confidence: 0,
          explanation: 'Gemini API quota exceeded. Try again later.',
          source: 'error'
        };
      }
      
      return {
        label: 'ERROR',
        confidence: 0,
        explanation: `Gemini API error: ${response.status}`,
        source: 'error'
      };
    }
    
    const data = await response.json();
    console.log('📄 Gemini API response structure:', Object.keys(data));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in Gemini response');
      return {
        label: 'ERROR',
        confidence: 0,
        explanation: 'No response from Gemini',
        source: 'error'
      };
    }
    
    const resultText = data.candidates[0]?.content?.parts[0]?.text || '{}';
    console.log('📝 Gemini response text (first 300 chars):', resultText.substring(0, 300) + '...');
    
    // Extract JSON from response - IMPROVED VERSION
    let parsedResult = null;
    let jsonString = '';

    // Try multiple methods to extract JSON
    try {
      // Method 1: Look for complete JSON
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
        parsedResult = JSON.parse(jsonString);
      } else {
        // Method 2: Look for JSON between triple backticks
        const backtickMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (backtickMatch) {
          jsonString = backtickMatch[1];
          parsedResult = JSON.parse(jsonString.trim());
        } else {
          // Method 3: Try to parse the entire response as JSON
          try {
            parsedResult = JSON.parse(resultText.trim());
            jsonString = resultText;
          } catch {
            // Method 4: Clean the response and try again
            const cleanText = resultText
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
            if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
              parsedResult = JSON.parse(cleanText);
              jsonString = cleanText;
            }
          }
        }
      }
    } catch (parseError) {
      console.warn('⚠️ JSON parsing failed, will extract from text:', parseError.message);
    }

    if (parsedResult) {
      console.log('✅ Successfully parsed Gemini JSON');
      console.log('Parsed result:', parsedResult);
      
      // Validate and clean up the result
      const label = (parsedResult.label || '').toUpperCase();
      const validLabels = ['FAKE', 'SUSPICIOUS', 'CREDIBLE', 'NOT_APPLICABLE'];
      const finalLabel = validLabels.includes(label) ? label : 'UNKNOWN';
      
      let confidence = parseFloat(parsedResult.confidence) || 0.5;
      if (confidence > 1) confidence = confidence / 100; // Convert percentage to decimal
      if (confidence < 0) confidence = 0;
      if (confidence > 1) confidence = 1;
      
      // Get explanation from parsed result or use default
      let explanation = parsedResult.explanation || 'Analyzed by Google Gemini AI';
      if (!explanation || explanation.length < 10) {
        explanation = `Content appears ${finalLabel.toLowerCase()}. Confidence: ${(confidence * 100).toFixed(1)}%`;
      }
      
      // Ensure keywords is an array
      let keywords = [];
      if (Array.isArray(parsedResult.keywords)) {
        keywords = parsedResult.keywords;
      } else if (parsedResult.keywords && typeof parsedResult.keywords === 'string') {
        keywords = parsedResult.keywords.split(',').map(k => k.trim());
      }
      
      return {
        label: finalLabel,
        confidence: confidence,
        explanation: explanation,
        keywords: keywords,
        source: 'gemini',
        rawResponse: resultText.substring(0, 1000) // Store more of the response
      };
    }
    
    // If no JSON, try to parse the text response
    console.log('⚠️ No valid JSON found, parsing text response...');
    
    let label = 'UNKNOWN';
    const lowerText = resultText.toLowerCase();
    
    if (lowerText.includes('fake') || lowerText.includes('false') || lowerText.includes('hoax')) {
      label = 'FAKE';
    } else if (lowerText.includes('suspicious') || lowerText.includes('questionable') || lowerText.includes('doubtful')) {
      label = 'SUSPICIOUS';
    } else if (lowerText.includes('credible') || lowerText.includes('true') || lowerText.includes('real') || lowerText.includes('authentic')) {
      label = 'CREDIBLE';
    }
    
    // Try to extract confidence number
    let confidence = 0.7;
    const confidenceMatch = resultText.match(/confidence[:\s]*(\d+\.?\d*)/i);
    if (confidenceMatch) {
      confidence = parseFloat(confidenceMatch[1]);
      if (confidence > 1) confidence = confidence / 100;
    }
    
    return {
      label: label,
      confidence: confidence,
      explanation: resultText.substring(0, 200) || 'Analyzed by Google Gemini',
      keywords: [],
      source: 'gemini',
      rawResponse: resultText.substring(0, 500)
    };
    
  } catch (error) {
    console.error("❌ Gemini analysis failed with exception:", error.message);
    console.error("Error stack:", error.stack);
    
    return {
      label: 'ERROR',
      confidence: 0,
      explanation: `Gemini connection failed: ${error.message}`,
      source: 'error'
    };
  }
};

// Hugging Face Analysis
export const analyzeWithHuggingFace = async (text, model = "mrm8488/fake-news-detector") => {
  try {
    const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
    
    if (!HF_TOKEN || HF_TOKEN === 'your_hugging_face_token_here') {
      throw new Error('Hugging Face token not configured');
    }
    
    console.log('🔑 Hugging Face token exists');
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: text.substring(0, 500) // Limit text length
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      // Detect CORS or common failures to avoid console noise
      if (response.status === 0 || response.status === 403) {
        return { label: 'ERROR', source: 'cors-blocked' };
      }
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📥 Hugging Face raw result:', result);
    
    // Parse response based on model output format
    let label = 'UNKNOWN';
    let confidence = 0.5;
    
    if (Array.isArray(result) && result[0]) {
      if (result[0].label) {
        label = result[0].label;
        confidence = result[0].score || 0.5;
      } else if (Array.isArray(result[0]) && result[0][0]) {
        label = result[0][0].label;
        confidence = result[0][0].score;
      }
    }
    
    // Map Hugging Face labels to our format
    const labelMap = {
      'LABEL_0': 'CREDIBLE',
      'LABEL_1': 'FAKE',
      'REAL': 'CREDIBLE',
      'FAKE': 'FAKE',
      'true': 'CREDIBLE',
      'false': 'FAKE'
    };
    
    const mappedLabel = labelMap[label] || label;
    
    return {
      label: mappedLabel,
      confidence: confidence,
      explanation: 'Analyzed by Hugging Face AI model',
      source: 'hugging-face'
    };
    
  } catch (error) {
    // Silent fallback for CORS/Network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Hugging Face blocked by CORS. Falling back to next service.');
      return {
        label: 'ERROR',
        confidence: 0,
        explanation: 'Network/CORS error',
        source: 'cors-error'
      };
    }
    console.error("Hugging Face analysis failed:", error);
    return {
      label: 'ERROR',
      confidence: 0,
      explanation: `Hugging Face failed: ${error.message}`,
      source: 'error'
    };
  }
};

// Mock analysis (fallback)
export const analyzeMock = async (text) => {
  console.log('🔄 Using MOCK analysis (fallback)');
  
  const fakeKeywords = ['fake', 'hoax', 'scam', 'fraud', 'conspiracy', 'false', 'lie', 'misinformation', 'fake news'];
  const credibleKeywords = ['invoice', 'payment', 'receipt', 'official', 'document', 'verified', 'authentic', 'legitimate', 'certified'];
  const suspiciousKeywords = ['urgent', 'immediate', 'warning', 'alert', 'important', 'secret', 'confidential'];
  
  const lowercaseText = text.toLowerCase();
  
  let fakeScore = 0;
  fakeKeywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) fakeScore += 0.2;
  });
  
  let credibleScore = 0;
  credibleKeywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) credibleScore += 0.1;
  });
  
  let suspiciousScore = 0;
  suspiciousKeywords.forEach(keyword => {
    if (lowercaseText.includes(keyword)) suspiciousScore += 0.15;
  });
  
  const totalScore = fakeScore + suspiciousScore - credibleScore;
  const normalizedScore = Math.min(Math.max(totalScore, 0), 1);
  
  let label, explanation;
  if (normalizedScore > 0.6) {
    label = 'FAKE';
    explanation = 'Contains strong indicators of misinformation or fake content';
  } else if (normalizedScore > 0.3) {
    label = 'SUSPICIOUS';
    explanation = 'Shows questionable elements that require verification';
  } else {
    label = 'CREDIBLE';
    explanation = 'Appears to be credible and legitimate content';
  }
  
  // Give some confidence based on keyword matches
  const confidence = Math.min(normalizedScore + 0.3, 0.9);
  
  console.log(`📊 Mock analysis result: ${label} (${(confidence * 100).toFixed(1)}% confidence)`);
  
  return {
    label,
    confidence: parseFloat(confidence.toFixed(2)),
    explanation,
    source: 'mock-analysis',
    keywords: [...fakeKeywords.filter(k => lowercaseText.includes(k)), 
              ...credibleKeywords.filter(k => lowercaseText.includes(k)),
              ...suspiciousKeywords.filter(k => lowercaseText.includes(k))].slice(0, 10)
  };
};

// Legal guidance generator using Gemini
export const generateLegalGuidance = async (analysisResult, context = '') => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('⚖️ Generating legal guidance...');
    console.log('Analysis:', analysisResult.label, 'Confidence:', (analysisResult.confidence * 100).toFixed(1) + '%');
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('⚠️ No Gemini API key, using simple guidance');
      return getSimpleLegalGuidance(analysisResult);
    }
    
    if (analysisResult.source === 'error' || analysisResult.label === 'ERROR') {
      return getSimpleLegalGuidance(analysisResult);
    }
    
    const confidencePercent = (analysisResult.confidence * 100).toFixed(1);
    
    // Better prompt for TruthShield's legal guidance
    const prompt = `You are TruthShield AI Legal Advisor. Provide practical legal guidance based on content analysis.

ANALYSIS RESULTS:
- Verdict: ${analysisResult.label}
- Confidence: ${confidencePercent}%
- Context: ${context || 'Digital document'}
- Keywords: ${analysisResult.keywords?.slice(0, 5).join(', ') || 'None detected'}

REQUIREMENTS:
1. Provide actionable legal guidance (300-500 characters)
2. Focus on Indian laws (IPC, IT Act, Consumer Protection)
3. Mention specific sections if applicable
4. Include immediate steps user should take
5. Suggest where to file complaints if needed
6. Keep it practical for non-lawyers

LEGAL GUIDANCE (Be specific and helpful):`;

    console.log('📤 Sending legal guidance request to Gemini...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Legal guidance API error:', response.status, errorText);
      return getSimpleLegalGuidance(analysisResult);
    }
    
    const data = await response.json();
    const guidance = data.candidates?.[0]?.content?.parts?.[0]?.text || getSimpleLegalGuidance(analysisResult);
    
    // Clean and store the guidance (up to 2000 characters)
    const cleanGuidance = guidance.trim().substring(0, 2000);
    
    console.log('✅ Legal guidance generated (first 150 chars):', cleanGuidance.substring(0, 150) + '...');
    return cleanGuidance;
    
  } catch (error) {
    console.error('❌ Legal guidance generation failed:', error.message);
    return getSimpleLegalGuidance(analysisResult);
  }
};

// Enhanced simple legal guidance (SINGLE DEFINITION)
const getSimpleLegalGuidance = (analysisResult) => {
  const baseGuidance = {
    'FAKE': `This content appears fraudulent. IMMEDIATE ACTIONS:
1. DO NOT engage or share
2. Document evidence with timestamps
3. Report to Cyber Crime Cell (cybercrime.gov.in)
4. Relevant laws: IPC Section 420 (Cheating), IT Act Section 66D
5. File FIR at local police station

Preserve all digital evidence including URLs, screenshots, and metadata.`,
    
    'SUSPICIOUS': `Exercise caution with this content. RECOMMENDED STEPS:
1. Verify from official sources (gov.in domains)
2. Check with fact-checking websites
3. Be aware of IPC Section 503 (Criminal intimidation)
4. If financial content, consult bank directly
5. Report suspicious emails to CERT-In

When in doubt, do not act on unverified information.`,
    
    'CREDIBLE': `Content appears legitimate. STANDARD PRECAUTIONS:
1. Verify important details independently
2. Keep records for documentation
3. Be aware of Consumer Protection Act 2019
4. For contracts, ensure written agreement
5. Consult legal expert for large commitments

Always practice due diligence with any document.`,
    
    'UNKNOWN': `Unable to determine credibility. MAXIMUM CAUTION ADVISED:
1. Treat as potentially risky
2. Do not share personal information
3. Verify through multiple channels
4. Consider IT Act Section 43 for data protection
5. Consult legal professional if sensitive

Better safe than sorry with unverified content.`
  };
  
  return baseGuidance[analysisResult.label] || 
    `For legal advice specific to your situation, consult with a qualified legal professional. 
Keep records of all communications and documents.`;
};

// Debug function to test environment
export const debugAIService = () => {
  console.log('🔍 ======= AI SERVICE DEBUG =======');
  console.log('Environment variables:');
  console.log('- VITE_USE_MOCK_AI:', import.meta.env.VITE_USE_MOCK_AI);
  console.log('- VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('- VITE_HF_TOKEN exists:', !!import.meta.env.VITE_HF_TOKEN);
  console.log('');
  console.log('Type checks:');
  console.log('- VITE_USE_MOCK_AI === "true":', import.meta.env.VITE_USE_MOCK_AI === 'true');
  console.log('- VITE_USE_MOCK_AI === "false":', import.meta.env.VITE_USE_MOCK_AI === 'false');
  console.log('- Should use mock:', import.meta.env.VITE_USE_MOCK_AI === 'true');
  console.log('==================================');
};

// Add to src/lib/aiService.js
export const generateLegalContentAI = async (type, userPrompt) => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log(`⚖️ Generating legal content (${type}): "${userPrompt.substring(0, 100)}..."`);
    
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('⚠️ No Gemini API key, using simple legal content');
      return getSimpleLegalContent(type, userPrompt);
    }
    
    // Create specialized prompts for each type
    const prompts = {
      clause: `You are an Indian legal expert. Generate a professional legal clause based on: "${userPrompt}"
      
Requirements:
1. Use proper legal terminology
2. Reference Indian laws (Contract Act, IT Act, etc.)
3. Make it comprehensive but clear
4. Include placeholders for customization
5. Format with proper sections

Generate a complete, ready-to-use clause:`,
      
      complaint: `You are an Indian legal advisor. Provide step-by-step complaint procedure for: "${userPrompt}"
      
Structure:
1. Immediate actions to take
2. Required documentation
3. Where to file (specific authority/court)
4. Step-by-step procedure
5. Relevant Indian laws and sections
6. Timeline and expected outcomes
7. Contact information

Provide practical, actionable guidance:`,
      
      guidance: `You are an Indian legal consultant. Provide comprehensive legal guidance for: "${userPrompt}"
      
Include:
1. Legal requirements and obligations
2. Step-by-step process
3. Relevant Indian laws
4. Documentation needed
5. Common pitfalls to avoid
6. Cost estimates (if applicable)
7. When to consult a lawyer

Provide detailed, practical guidance:`
    };
    
    const prompt = prompts[type] || prompts.guidance;
    
    console.log('📤 Sending legal request to Gemini...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_NONE"
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Legal AI error:', response.status, errorText);
      return getSimpleLegalContent(type, userPrompt);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || getSimpleLegalContent(type, userPrompt);
    
    console.log('✅ Legal AI content generated');
    return content.trim();
    
  } catch (error) {
    console.error('❌ Legal AI generation failed:', error.message);
    return getSimpleLegalContent(type, userPrompt);
  }
};

// Simple legal content fallback
const getSimpleLegalContent = (type, prompt) => {
  const baseContent = {
    clause: `BASED ON: "${prompt}"

NON-DISCLOSURE AGREEMENT (NDA) CLAUSE - PROJECT "PROJECT X"

1. CONFIDENTIALITY OBLIGATIONS:
   The Receiving Party agrees to:
   - Maintain strict confidentiality of all project information
   - Use information solely for "Project X" purposes
   - Not disclose to third parties without written consent
   - Implement reasonable security measures

2. DEFINITION OF CONFIDENTIAL INFORMATION:
   Includes but not limited to:
   - Business plans and strategies
   - Technical specifications and code
   - Customer and vendor information
   - Financial data and projections
   - Any information marked as confidential

3. DURATION:
   This obligation shall remain in effect for 3 years from the date of disclosure.

4. GOVERNING LAW:
   This agreement shall be governed by the Indian Contract Act, 1872.

5. REMEDIES:
   Parties acknowledge that breach may cause irreparable harm and injunctive relief may be appropriate.

IMPORTANT: Customize with specific details, duration, and jurisdiction. Consult a lawyer for final version.`,
    
    complaint: `COMPLAINT PROCEDURE FOR: "${prompt}"

IMMEDIATE STEPS FOR CRIMINAL COMPLAINT IN INDIA:

1. **EMERGENCY ACTION:**
   - If violence is ongoing, DIAL 112 (National Emergency Number)
   - Call local police station immediately

2. **DOCUMENTATION:**
   - Write down exact details (what, when, where, who)
   - Collect evidence (photos, videos, messages)
   - List witnesses with contact information
   - Note exact dates and times

3. **FILE FIR (FIRST INFORMATION REPORT):**
   - Go to local police station with jurisdiction
   - Provide written complaint in local language
   - Mention relevant IPC sections:
     - Section 302: Murder
     - Section 307: Attempt to murder
     - Section 323: Causing hurt
   - Demand a copy of FIR (your right)

4. **IF POLICE REFUSE FIR:**
   - Approach Superintendent of Police (SP)
   - File online at https://cybercrime.gov.in (if cyber aspect)
   - Contact District Legal Services Authority (free legal aid)
   - Approach Magistrate under Section 156(3) CrPC

5. **LEGAL ASSISTANCE:**
   - Free legal aid: National Legal Services Authority (NALSA)
   - Helpline: 1516 (Legal Services)
   - Women's helpline: 181

6. **FOLLOW-UP:**
   - Get case diary number
   - Regularly follow up with investigating officer
   - Keep copies of all documents

REMEMBER: All complaints must be truthful. False complaints are punishable under IPC Section 182.`,
    
    guidance: `LEGAL GUIDANCE FOR: "${prompt}"

COMPLETE GUIDE TO FILE A CASE IN INDIA:

**1. UNDERSTAND YOUR CASE TYPE:**
   - Civil Case: Property, money, contracts, family matters
   - Criminal Case: Theft, assault, fraud, harassment
   - Consumer Case: Defective products, deficient services
   - Cyber Case: Online fraud, hacking, harassment

**2. PREPARATION:**
   a. **Evidence Collection:**
      - Documents (agreements, receipts, letters)
      - Photographs/Videos
      - Witness statements
      - Digital evidence (screenshots, emails, chats)
   
   b. **Legal Research:**
      - Identify relevant laws
      - Determine limitation period (varies by case type)
      - Decide jurisdiction (where to file)

**3. WHERE TO FILE:**
   - **District Court:** Civil cases > ₹3 lakhs, criminal cases
   - **Consumer Forum:** For consumer complaints
   - **High Court:** Specific matters, writ petitions
   - **Cyber Cell:** For cyber crimes
   - **Family Court:** For family disputes

**4. PROCEDURE:**
   a. **Draft Complaint:**
      - Clear facts and prayer (what you want)
      - List all parties correctly
      - Attach all evidence
   
   b. **File in Court:**
      - Pay appropriate court fees
      - Submit required number of copies
      - Get case number and hearing date

**5. LEGAL AID OPTIONS:**
   - **Free Legal Aid:** If income < ₹3 lakhs/year
   - **Legal Services Authorities:** District/State level
   - **Law School Clinics:** Free assistance
   - **Online Platforms:** e-Courts, legal aid websites

**6. COST ESTIMATE:**
   - Court fees: 1-10% of claim amount
   - Lawyer fees: ₹5,000 - ₹50,000+ depending on case
   - Miscellaneous: ₹2,000 - ₹10,000

**7. TIMELINE:**
   - Simple cases: 6-18 months
   - Complex cases: 2-5 years
   - Criminal cases: 1-3 years (varies)

**RECOMMENDATION:** Consult with a lawyer who specializes in your type of case. Many offer free initial consultations.`
  };
  
  return baseContent[type] || baseContent.guidance;
};

// Intelligent Caching System for AI Results
class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 50;
    this.expiryTime = 30 * 60 * 1000; // 30 minutes
    this.accessCount = new Map();
  }

  generateCacheKey(text, context = {}) {
    const normalizedText = text.toLowerCase().trim();
    const contentHash = this.simpleHash(normalizedText.substring(0, 1000));
    const contextKey = JSON.stringify({
      length: text.length,
      hasKeywords: this.detectKeywords(text),
      context: context.type || 'general'
    });
    return `${contentHash}_${this.simpleHash(contextKey)}`;
  }

  detectKeywords(text) {
    const keywords = ['invoice', 'payment', 'contract', 'agreement', 'fake', 'scam', 'fraud'];
    return keywords.filter(keyword => text.toLowerCase().includes(keyword));
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.expiryTime) {
      this.cache.delete(key);
      this.accessCount.delete(key);
      return null;
    }

    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    return entry.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: JSON.stringify(data).length
    });

    this.accessCount.set(key, 1);
  }

  evictLRU() {
    let leastAccessed = null;
    let leastCount = Infinity;

    for (const [key, count] of this.accessCount) {
      if (count < leastCount) {
        leastCount = count;
        leastAccessed = key;
      }
    }

    if (leastAccessed) {
      this.cache.delete(key);
      this.accessCount.delete(leastAccessed);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccesses: Array.from(this.accessCount.values()).reduce((sum, count) => sum + count, 0),
      hitRate: this.calculateHitRate()
    };
  }

  calculateHitRate() {
    const totalRequests = Array.from(this.accessCount.values()).reduce((sum, count) => sum + count, 0);
    const cacheHits = Array.from(this.accessCount.values()).filter(count => count > 1).length;
    return totalRequests > 0 ? (cacheHits / totalRequests * 100).toFixed(1) : 0;
  }
}

// Global cache instance
const intelligentCache = new IntelligentCache();

// Streaming AI Analysis for Better UX
export const analyzeWithAIStreaming = async (text, onProgress = null, context = {}) => {
  console.log('🎯 Starting streaming AI analysis...');

  const cacheKey = intelligentCache.generateCacheKey(text, context);
  const cachedResult = intelligentCache.get(cacheKey);

  if (cachedResult) {
    console.log('⚡ Cache hit! Returning cached result');
    onProgress?.({ stage: 'cached', progress: 100, message: 'Retrieved from cache' });
    return cachedResult;
  }

  try {
    onProgress?.({ stage: 'preprocessing', progress: 10, message: 'Preprocessing content...' });

    const processedText = text.trim();
    onProgress?.({ stage: 'preprocessing', progress: 20, message: 'Content processed' });

    onProgress?.({ stage: 'ai_analysis', progress: 30, message: 'Analyzing with AI...' });

    const aiResult = await analyzeWithAI(processedText);
    onProgress?.({ stage: 'ai_analysis', progress: 70, message: 'AI analysis complete' });

    onProgress?.({ stage: 'legal_guidance', progress: 80, message: 'Generating legal guidance...' });

    const legalGuidance = await generateLegalGuidance(aiResult, `Content analysis: ${processedText.substring(0, 100)}...`);
    onProgress?.({ stage: 'legal_guidance', progress: 90, message: 'Legal guidance generated' });

    onProgress?.({ stage: 'finalizing', progress: 95, message: 'Finalizing results...' });

    const finalResult = {
      ...aiResult,
      legalGuidance,
      analysisTimestamp: new Date().toISOString(),
      processingMethod: 'streaming_ai'
    };

    intelligentCache.set(cacheKey, finalResult);

    onProgress?.({ stage: 'complete', progress: 100, message: 'Analysis complete!' });

    console.log('✅ Streaming analysis complete');
    return finalResult;

  } catch (error) {
    console.error('❌ Streaming analysis failed:', error);
    onProgress?.({ stage: 'error', progress: 0, message: `Analysis failed: ${error.message}` });
    throw error;
  }
};

// Predictive Loading for Better Performance
export const preloadAnalysis = async (textPreview, context = {}) => {
  if (textPreview.length < 100) return;

  console.log('🔮 Preloading analysis for better performance...');

  try {
    const previewText = textPreview.substring(0, 500);
    const cacheKey = intelligentCache.generateCacheKey(previewText, context);

    analyzeWithAI(previewText)
      .then(result => {
        intelligentCache.set(cacheKey, result);
        console.log('✅ Preview analysis cached for faster future requests');
      })
      .catch(err => {
        console.warn('⚠️ Preview analysis failed (non-critical):', err.message);
      });

  } catch (error) {
    console.warn('⚠️ Preloading failed (non-critical):', error.message);
  }
};

// Performance monitoring
export const getPerformanceStats = () => {
  return {
    cacheStats: intelligentCache.getStats(),
    resilienceStats: {
      totalRequests: 0,
      circuitBreakerState: 'closed',
      recentFailures: 0
    }
  };
};