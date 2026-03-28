// src/components/legal/LegalCard.js - UPDATED
import React, { useState } from 'react';
import { ShieldCheckIcon, DocumentTextIcon, UserGroupIcon, BoltIcon, ClipboardDocumentIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Button from '../ui/button';
import { generateLegalContent, saveLegalHistory, downloadLegalDocument } from '../../lib/legalService';
import { useAuth } from '../../hooks/useAuth';   

const LegalCard = ({ title, description, type }) => {
  const { currentUser } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [jurisdictionInfo, setJurisdictionInfo] = useState(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [showJurisdictionSelector, setShowJurisdictionSelector] = useState(false);

  const typeStyles = {
    clause: { bg: 'bg-blue-50 border-blue-200 text-blue-600', icon: DocumentTextIcon },
    complaint: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', icon: ShieldCheckIcon },
    guidance: { bg: 'bg-purple-50 border-purple-200 text-purple-600', icon: UserGroupIcon },
    default: { bg: 'bg-orange-50 border-orange-200 text-orange-600', icon: BoltIcon }
  };

  const renderIcon = () => {
    const style = typeStyles[type] || typeStyles.default;
    const Icon = style.icon;
    return (
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${style.bg}`}>
        <Icon className={`h-6 w-6 ${style.text}`} />
      </div>
    );
  };

  const getPlaceholder = () => {
    switch(type) {
      case 'clause':
        return 'E.g., "Generate a confidentiality clause for technology company employees"';
      case 'complaint':
        return 'E.g., "Steps to resolve consumer dispute over defective product purchase"';
      case 'guidance':
        return 'E.g., "Legal requirements for starting an online retail business"';
      default:
        return 'Describe your legal requirement...';
    }
  };

// Revolutionary AI-Powered Legal Generation with Worldwide Jurisdiction Intelligence
const handleGenerate = async () => {
  if (!prompt.trim()) {
    alert('Please describe your legal requirement');
    return;
  }

  setIsGenerating(true);
  setGeneratedContent('');
  setJurisdictionInfo(null);

  let result = null;
  try {
    // Enhance prompt with selected jurisdiction
    const enhancedPrompt = selectedJurisdiction
      ? `${prompt} (Jurisdiction: ${selectedJurisdiction})`
      : prompt;

    result = await generateLegalContent(type, enhancedPrompt, {
      userId: currentUser?.uid,
      userLocation: selectedJurisdiction, // Pass selected jurisdiction as location hint
      analysisContext: null // Could pass previous analysis context
    });

    // Display jurisdiction information if available
    if (result.jurisdiction) {
      setJurisdictionInfo(result.jurisdiction);
    }

    // Handle content
    let content = result.content;

    // If it's an object, extract the content
    if (typeof content === 'object' && content !== null) {
      content = JSON.stringify(content, null, 2);
    }

    // Ensure we have content
    if (!content || content.trim().length < 50) {
      content = `We couldn't generate specific content for your request.

Please try being more specific and include jurisdiction information. For example:
• "How to file police complaint for theft in Mumbai, India"
• "Draft NDA clause for software development project in California, USA"
• "Legal requirements to start food business in Berlin, Germany"

Include your location/country for jurisdiction-specific legal guidance.`;
    }

    setGeneratedContent(content);

    // Save to history with jurisdiction metadata
    if (currentUser) {
      const historyContent = result.jurisdiction ?
        `[${result.jurisdiction.name}] ${content}` : content;
      saveLegalHistory(currentUser.uid, type, prompt, historyContent);
      loadHistory();
    }

  } catch (error) {
    console.error('Worldwide legal generation failed:', error);

    // Show specific error based on failure type
    const errorContent = result?.error ?
      result.content :
      `🚨 Legal Generation Failed

Unable to generate legal content for your request.

**Possible Solutions:**
1. Include specific jurisdiction (country/state) in your request
2. Be more specific about your legal need
3. Check your internet connection and try again
4. Contact support if the issue persists

**Example Requests:**
• "${prompt} in India"
• "${prompt} under US law"
• "${prompt} in Germany"

This system uses 100% real AI generation - no templates or fallbacks.`;

    setGeneratedContent(errorContent);
  } finally {
    setIsGenerating(false);
  }
};

  const loadHistory = () => {
    if (currentUser) {
      const userHistory = JSON.parse(localStorage.getItem(`legalHistory_${currentUser.uid}`) || '[]');
      setHistory(userHistory.filter(item => item.type === type));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
  };

  const handleDownload = () => {
    downloadLegalDocument(generatedContent, `${type}-legal-content`);
  };

  const loadFromHistory = (content) => {
    setGeneratedContent(content);
  };

  return (
    <div className="card bg-white border border-[var(--ts-border)] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-[var(--ts-text-primary)]">{title}</h3>
              <p className="text-[var(--ts-text-secondary)] mt-1">{description}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {type.toUpperCase()}
            </span>
          </div>

          {/* Jurisdiction Selector */}
          <div className="mb-4">
            <button
              onClick={() => setShowJurisdictionSelector(!showJurisdictionSelector)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
            >
              <span className="mr-2">{showJurisdictionSelector ? '▼' : '▶'}</span>
              {selectedJurisdiction ? `Selected: ${selectedJurisdiction}` : 'Specify Jurisdiction (Optional)'}
            </button>

            {showJurisdictionSelector && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {[
                    'Universal', 'Common Law', 'Civil Law', 'Religious Law',
                    'Customary Law', 'Mixed System', 'Socialist Law', 'International Law'
                  ].map((system) => (
                    <button
                      key={system}
                      onClick={() => {
                        setSelectedJurisdiction(system);
                        setShowJurisdictionSelector(false);
                      }}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedJurisdiction === system
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-blue-200 text-[var(--ts-text-secondary)] hover:bg-blue-50'
                      }`}
                    >
                      {system}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Or type custom jurisdiction..."
                    className="form-input flex-1"
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    value={selectedJurisdiction}
                  />
                  <button
                    onClick={() => setSelectedJurisdiction('')}
                    className="px-3 py-2 text-sm text-[var(--ts-text-muted)] hover:text-[var(--ts-text-primary)]"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-[var(--ts-text-muted)] mt-2">
                  Specify your legal framework for more accurate guidance. AI will use universal principles if not specified.
                </p>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--ts-text-primary)] mb-2">
              What do you need help with?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPlaceholder()}
              className="form-input w-full resize-none"
              rows="3"
            />
            <p className="text-xs text-[var(--ts-text-muted)] mt-2">
              Be specific for better results. Mention context like "in India" or your location.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex-1 min-w-[200px]"
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Generating...
                </>
              ) : (
                'Generate Legal Content'
              )}
            </Button>
            
            <button
              onClick={() => setPrompt('')}
              className="px-4 py-2 text-[var(--ts-text-muted)] hover:text-[var(--ts-text-primary)]"
            >
              Clear
            </button>
          </div>
          
          {/* Generated Content */}
          {generatedContent && (
            <div className="mt-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-emerald-700">
                  ✅ Generated Legal Content
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>

              {/* Jurisdiction Information Display */}
              {jurisdictionInfo && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-sm font-bold">⚖️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-blue-700 mb-2">
                        🌍 Detected Jurisdiction: {jurisdictionInfo.name}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-[var(--ts-text-primary)]">Legal System:</span>
                          <span className="ml-2 text-blue-700">{jurisdictionInfo.system.system}</span>
                        </div>
                        <div>
                          <span className="font-medium text-[var(--ts-text-primary)]">Confidence:</span>
                          <span className="ml-2 text-emerald-700">{(jurisdictionInfo.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-[var(--ts-text-primary)]">Key Laws:</span>
                          <span className="ml-2 text-[var(--ts-text-secondary)]">{jurisdictionInfo.system.keyLaws.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[var(--ts-text-muted)]">
                        {jurisdictionInfo.reasoning}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 border border-[var(--ts-border)] rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-[var(--ts-text-primary)] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {generatedContent}
                </pre>
              </div>
              
              <div className="mt-4 text-sm text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <strong>⚠️ Disclaimer:</strong> This is AI-generated legal information. Consult with a qualified
                lawyer for legal advice specific to your situation. Indian laws referenced where applicable.
              </div>
            </div>
          )}
          
          {/* History Section */}
          {currentUser && (
            <div className="mt-6 border-t border-[var(--ts-border)] pt-6">
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory) loadHistory();
                }}
                className="flex items-center text-sm text-[var(--ts-text-muted)] hover:text-[var(--ts-text-primary)]"
              >
                <span className="mr-2">
                  {showHistory ? '▼' : '▶'}
                </span>
                {showHistory ? 'Hide History' : 'Show History'} 
                <span className="ml-2 bg-slate-100 text-[var(--ts-text-primary)] px-2 py-1 rounded-full text-xs border border-[var(--ts-border)]">
                  {history.length}
                </span>
              </button>
              
              {showHistory && history.length > 0 && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  <h5 className="font-medium text-[var(--ts-text-primary)]">Your Recent Generations:</h5>
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-[var(--ts-border)] rounded-lg hover:bg-slate-100 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-xs text-[var(--ts-text-muted)] mb-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                          <div className="font-medium text-[var(--ts-text-primary)] text-sm line-clamp-2">
                            {item.prompt}
                          </div>
                        </div>
                        <button
                          onClick={() => loadFromHistory(item.content)}
                          className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                  {history.length > 5 && (
                    <p className="text-sm text-slate-400 text-center">
                      ... and {history.length - 5} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalCard;