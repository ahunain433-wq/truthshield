import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import Loader from '../components/ui/loader';
import Button from '../components/ui/button';
import {
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon,
  InformationCircleIcon, EyeIcon, DocumentTextIcon,
  ClockIcon, ShieldCheckIcon,
  LightBulbIcon, ChartBarIcon, MagnifyingGlassIcon,
  ChevronDownIcon, ChevronUpIcon, SparklesIcon
} from '@heroicons/react/24/outline';

const Analysis = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { getDocuments, loading: firestoreLoading } = useFirestore();
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    extractedText: false,
    aiReasoning: false,
    legalGuidance: false,
    insights: false
  });

  // Format Firestore timestamp to readable date
  const formatFirestoreDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      // If it's a Firestore Timestamp object
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      // If it's already a Date object or ISO string
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString();
      }
      // If it's a number (milliseconds)
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleString();
      }
      return 'Invalid date format';
    } catch (error) {
      console.error('Date formatting error:', error, timestamp);
      return 'Date error';
    }
  };

  // Get credibility score from analysis data
  const getCredibilityScore = (analysis) => {
    if (!analysis) return null;
    
    // Check AI analysis first
    if (analysis.aiAnalysis?.credibilityScore !== undefined) {
      return analysis.aiAnalysis.credibilityScore;
    }
    // Check direct credibilityScore
    if (analysis.credibilityScore !== undefined) {
      return analysis.credibilityScore;
    }
    // Convert confidence to score
    if (analysis.aiAnalysis?.confidence !== undefined) {
      return analysis.aiAnalysis.confidence;
    }
    return 0.5; // Default
  };

  // Get legal guidance from analysis data
  const getLegalGuidance = (analysis) => {
    if (!analysis) return null;
    
    // Check multiple possible locations
    if (analysis.legalGuidance) return analysis.legalGuidance;
    if (analysis.aiAnalysis?.legalGuidance) return analysis.aiAnalysis.legalGuidance;
    if (analysis.aiAnalysis?.explanation) return analysis.aiAnalysis.explanation;
    
    // Generate based on label
    const label = analysis.aiAnalysis?.label || 'UNKNOWN';
    const guidance = {
      'FAKE': 'This content appears to be misinformation. Consider reporting it to the platform.',
      'SUSPICIOUS': 'This content shows suspicious elements. Verify from trusted sources.',
      'CREDIBLE': 'Content appears credible. Always verify important information.',
      'UNKNOWN': 'Unable to determine credibility. Exercise caution.'
    };
    
    return guidance[label] || 'Consult with experts for verification.';
  };

  // Get analysis results
  const getAnalysisResults = (analysis) => {
    if (!analysis) return null;
    
    if (analysis.results) return analysis.results;
    if (analysis.aiAnalysis) return analysis.aiAnalysis;
    return null;
  };

  // Fetch user's analyses
  useEffect(() => {
    const fetchAnalyses = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          console.log('Fetching analyses for user:', currentUser.uid);
          
          // Temporary workaround: Fetch without orderBy until index is created
          const userAnalyses = await getDocuments('submissions', [
            { field: 'userId', operator: '==', value: currentUser.uid }
          ]);
          
          // Manual sorting while waiting for Firestore index
          const sortedAnalyses = userAnalyses.sort((a, b) => {
            const dateA = a.createdAt ? 
              (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : 
              new Date(0);
            const dateB = b.createdAt ? 
              (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : 
              new Date(0);
            return dateB - dateA; // Descending order
          });
          
          console.log('Fetched analyses:', sortedAnalyses);
          
          setAnalyses(sortedAnalyses);
          
          // If there's an ID in URL, find that analysis
          if (id) {
            const analysis = sortedAnalyses.find(a => a.id === id);
            console.log('Found analysis by ID:', id, analysis);
            setSelectedAnalysis(analysis);
          } else if (sortedAnalyses.length > 0) {
            // Default to first analysis
            console.log('Setting default analysis:', sortedAnalyses[0]);
            setSelectedAnalysis(sortedAnalyses[0]);
          }
        } catch (error) {
          console.error('Error fetching analyses:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchAnalyses();
  }, [currentUser, id]);

  // Debug: Log selected analysis
  useEffect(() => {
    if (selectedAnalysis) {
      console.log('Selected Analysis Data:', selectedAnalysis);
      console.log('Credibility Score:', getCredibilityScore(selectedAnalysis));
      console.log('Legal Guidance:', getLegalGuidance(selectedAnalysis));
      console.log('Analysis Results:', getAnalysisResults(selectedAnalysis));
    }
  }, [selectedAnalysis]);

  // Show loading state - moved AFTER all hooks
  if (isLoading || firestoreLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="large" />
      </div>
    );
  }

  // Helper: Get analysis story elements
  const getAnalysisStory = (analysis) => {
    if (!analysis) return null;

    const score = getCredibilityScore(analysis);
    const aiResult = getAnalysisResults(analysis);

    return {
      score,
      label: aiResult?.label || 'UNKNOWN',
      confidence: aiResult?.confidence || 0,
      riskLevel: analysis.riskAssessment?.level || 'UNKNOWN',
      processingTime: analysis.analysisDuration || 0,
      intelligent: !!analysis.intelligentAnalysis
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Immersive Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">AI Analysis Dashboard</h1>
          </div>

          {selectedAnalysis && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center border border-blue-700/30">
                    <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAnalysis.fileName}</h2>
                    <p className="text-slate-400">Analyzed {formatFirestoreDate(selectedAnalysis.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedAnalysis.intelligentAnalysis && (
                    <span className="bg-purple-900/50 text-purple-300 text-sm font-medium px-3 py-1 rounded-full flex items-center border border-purple-700/30">
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      AI Enhanced
                    </span>
                  )}
                  <Link to={`/analysis/${selectedAnalysis.id}`}>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      Full Report
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Analysis Story Visualization */}
              {(() => {
                const story = getAnalysisStory(selectedAnalysis);
                if (!story) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Credibility Score */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Credibility Score</span>
                        <ChartBarIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {story.score !== null ? `${(story.score * 100).toFixed(0)}%` : 'N/A'}
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500 shadow-emerald-500/30"
                          style={{ width: `${story.score * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Analysis Result */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Analysis Result</span>
                        {story.label === 'CREDIBLE' && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
                        {story.label === 'FAKE' && <XCircleIcon className="h-5 w-5 text-red-500" />}
                        {story.label === 'SUSPICIOUS' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className={`text-lg font-bold mb-1 ${
                        story.label === 'CREDIBLE' ? 'text-emerald-400' :
                        story.label === 'FAKE' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {story.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        Confidence: {(story.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Risk Level</span>
                        <ShieldCheckIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className={`text-lg font-bold mb-1 ${
                        story.riskLevel === 'HIGH' ? 'text-red-400' :
                        story.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`}>
                        {story.riskLevel}
                      </div>
                      <div className="text-xs text-gray-500">
                        Based on content analysis
                      </div>
                    </div>

                    {/* Processing Time */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Processing Time</span>
                        <ClockIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="text-lg font-bold text-white mb-1">
                        {story.processingTime.toFixed(1)}s
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedAnalysis.intelligentAnalysis ? 'AI Enhanced' : 'Standard Processing'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        
        {analyses.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700/50 p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Analyses Yet</h2>
            <p className="text-slate-400 mb-6">
              Upload content to start analyzing for misinformation and deepfakes.
            </p>
            <Link to="/upload">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Upload First Analysis</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Analyses List */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Analysis History</h2>
                  <span className="bg-slate-700/50 text-slate-300 text-xs font-medium px-2 py-1 rounded-full border border-slate-600/50">
                    {analyses.length} files
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analyses.map((analysis) => {
                    const story = getAnalysisStory(analysis);
                    const isSelected = selectedAnalysis?.id === analysis.id;

                    return (
                      <div
                        key={analysis.id}
                        onClick={() => setSelectedAnalysis(analysis)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                          isSelected
                            ? 'bg-blue-900/50 border-blue-500/50 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-800/30 hover:bg-slate-700/50 border-slate-600/50 hover:border-slate-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate text-sm">
                              {analysis.fileName || 'Untitled Analysis'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {formatFirestoreDate(analysis.createdAt)}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${
                            analysis.status === 'completed'
                              ? 'badge-verified'
                              : analysis.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'badge bg-slate-700 text-slate-300'
                          }`}>
                            {analysis.status || 'pending'}
                          </span>
                        </div>

                        {/* Analysis Preview */}
                        {story && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Score</span>
                              <span className={`font-medium ${
                                story.score > 0.7 ? 'text-green-600' :
                                story.score > 0.4 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {(story.score * 100).toFixed(0)}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Risk</span>
                              <span className={`font-medium ${
                                story.riskLevel === 'HIGH' ? 'text-red-600' :
                                story.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {story.riskLevel}
                              </span>
                            </div>

                            {analysis.intelligentAnalysis && (
                              <div className="flex items-center text-xs text-purple-600 mt-2">
                                <SparklesIcon className="h-3 w-3 mr-1" />
                                AI Enhanced
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                          {analysis.fileType || 'Unknown type'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Analysis Dashboard */}
            <div className="lg:col-span-3">
              {selectedAnalysis ? (
                <div className="space-y-6">
                  {/* AI Analysis Story */}
                  {(() => {
                    const story = getAnalysisStory(selectedAnalysis);
                    const aiResult = getAnalysisResults(selectedAnalysis);

                    return story ? (
                      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mr-4 border border-blue-700/30">
                            <MagnifyingGlassIcon className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">AI Analysis Results</h2>
                            <p className="text-slate-400">TruthShield's comprehensive content evaluation</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Primary Assessment */}
                          <div className="card bg-slate-800/50 p-6">
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                              <InformationCircleIcon className="h-5 w-5 mr-2 text-[var(--color-verified-400)]" />
                              Primary Assessment
                            </h3>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                                <span className="font-medium text-slate-300">Content Classification</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  story.label === 'CREDIBLE' ? 'bg-green-100 text-green-800' :
                                  story.label === 'FAKE' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {story.label}
                                </span>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                                <span className="font-medium text-slate-300">Confidence Level</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-slate-600 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${story.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-white">
                                    {(story.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                                <span className="font-medium text-slate-300">Risk Assessment</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  story.riskLevel === 'HIGH' ? 'bg-red-900/50 text-red-300 border border-red-700/30' :
                                  story.riskLevel === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/30' :
                                  'bg-green-900/50 text-green-300 border border-green-700/30'
                                }`}>
                                  {story.riskLevel} Risk
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Analysis Details */}
                          <div className="card bg-slate-800/50 p-6">
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
                              <LightBulbIcon className="h-5 w-5 mr-2 text-[var(--color-verified-400)]" />
                              Analysis Details
                            </h3>

                            <div className="space-y-4">
                              <div className="p-3 bg-[var(--color-trust-900)] rounded-lg border border-[var(--color-trust-700)]">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-[var(--color-trust-200)]">AI Processing Method</span>
                                  <span className="text-xs bg-[var(--color-trust-900)] text-[var(--color-trust-200)] px-2 py-1 rounded-full border border-[var(--color-trust-700)]">
                                    {selectedAnalysis.intelligentAnalysis ? 'Intelligent Analysis' : 'Standard Analysis'}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-700">
                                  {selectedAnalysis.intelligentAnalysis
                                    ? `Enhanced processing using ${selectedAnalysis.intelligentAnalysis.processingStrategy} strategy`
                                    : 'Standard AI analysis pipeline'
                                  }
                                </p>
                              </div>

                              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-purple-300">Analysis Duration</span>
                                  <span className="text-sm font-semibold text-purple-200">
                                    {story.processingTime.toFixed(1)} seconds
                                  </span>
                                </div>
                                <p className="text-sm text-purple-400">
                                  {selectedAnalysis.intelligentAnalysis?.processingTime
                                    ? `Intelligent extraction: ${(selectedAnalysis.intelligentAnalysis.processingTime / 1000).toFixed(1)}s`
                                    : 'AI analysis and legal guidance generation'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Interactive Content Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Extracted Content */}
                    {selectedAnalysis.extractedText && (
                      <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-sm backdrop-blur-sm">
                        <button
                          onClick={() => setExpandedSections(prev => ({ ...prev, extractedText: !prev.extractedText }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setExpandedSections(prev => ({ ...prev, extractedText: !prev.extractedText }));
                            }
                          }}
                          aria-expanded={expandedSections.extractedText}
                          aria-controls="extracted-text-content"
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center border border-blue-700/30">
                              <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Extracted Content</h3>
                              <p className="text-sm text-slate-400">Text extracted from your file</p>
                            </div>
                          </div>
                          {expandedSections.extractedText ?
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" /> :
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          }
                        </button>

                        {expandedSections.extractedText && (
                          <div id="extracted-text-content" className="px-6 pb-6 border-t border-slate-600/50">
                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                              <div className="mb-3 flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-300">Content Preview:</span>
                                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full border border-blue-700/30">
                                  {selectedAnalysis.extractedText.length} characters
                                </span>
                              </div>

                              <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                                {selectedAnalysis.extractedText.length > 300
                                  ? `${selectedAnalysis.extractedText.substring(0, 300)}...`
                                  : selectedAnalysis.extractedText
                                }
                              </p>

                              {selectedAnalysis.extractedText.length > 300 && (
                                <button
                                  onClick={() => alert(selectedAnalysis.extractedText)}
                                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Show full content →
                                </button>
                              )}

                              {selectedAnalysis.intelligentAnalysis && (
                                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <SparklesIcon className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-800">Intelligent Processing</span>
                                  </div>
                                  <p className="text-sm text-purple-700">
                                    Processed using {selectedAnalysis.intelligentAnalysis.processingStrategy} strategy
                                    with {selectedAnalysis.intelligentAnalysis.qualityScore}% quality score.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Reasoning & Evidence */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-sm backdrop-blur-sm">
                      <button
                        onClick={() => setExpandedSections(prev => ({ ...prev, aiReasoning: !prev.aiReasoning }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedSections(prev => ({ ...prev, aiReasoning: !prev.aiReasoning }));
                          }
                        }}
                        aria-expanded={expandedSections.aiReasoning}
                        aria-controls="ai-reasoning-content"
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center border border-green-700/30">
                            <MagnifyingGlassIcon className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">AI Analysis Evidence</h3>
                            <p className="text-sm text-slate-400">How TruthShield reached this conclusion</p>
                          </div>
                        </div>
                        {expandedSections.aiReasoning ?
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" /> :
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        }
                      </button>

                      {expandedSections.aiReasoning && (
                        <div id="ai-reasoning-content" className="px-6 pb-6 border-t border-slate-600/50">
                          <div className="space-y-4">
                            {/* Risk Assessment Details */}
                            <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
                              <div className="flex items-center space-x-2 mb-3">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                                <span className="font-medium text-red-300">Risk Assessment</span>
                              </div>
                              <p className="text-sm text-red-400 mb-3">
                                {selectedAnalysis.riskAssessment?.description || 'Content risk evaluation'}
                              </p>
                              <div className="space-y-2">
                                {selectedAnalysis.recommendedActions?.map((action, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-red-700">{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* AI Confidence Breakdown */}
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                              <div className="flex items-center space-x-2 mb-3">
                                <ChartBarIcon className="h-5 w-5 text-blue-400" />
                                <span className="font-medium text-blue-300">AI Confidence Analysis</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-blue-400 mb-1">Classification Confidence</div>
                                  <div className="text-lg font-bold text-blue-200">
                                    {(() => {
                                      const aiResult = getAnalysisResults(selectedAnalysis);
                                      return aiResult?.confidence ? (aiResult.confidence * 100).toFixed(0) + '%' : 'N/A';
                                    })()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-blue-400 mb-1">Overall Credibility</div>
                                  <div className="text-lg font-bold text-blue-200">
                                    {(() => {
                                      const score = getCredibilityScore(selectedAnalysis);
                                      return score !== null ? (score * 100).toFixed(0) + '%' : 'N/A';
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Legal Guidance */}
                    {(() => {
                      const guidance = getLegalGuidance(selectedAnalysis);
                      return guidance ? (
                        <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-sm backdrop-blur-sm">
                          <button
                            onClick={() => setExpandedSections(prev => ({ ...prev, legalGuidance: !prev.legalGuidance }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setExpandedSections(prev => ({ ...prev, legalGuidance: !prev.legalGuidance }));
                              }
                            }}
                            aria-expanded={expandedSections.legalGuidance}
                            aria-controls="legal-guidance-content"
                            className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-yellow-900/50 rounded-lg flex items-center justify-center border border-yellow-700/30">
                                <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">Legal Guidance</h3>
                                <p className="text-sm text-slate-400">Recommended next steps</p>
                              </div>
                            </div>
                            {expandedSections.legalGuidance ?
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" /> :
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            }
                          </button>

                          {expandedSections.legalGuidance && (
                            <div id="legal-guidance-content" className="px-6 pb-6 border-t border-slate-600/50">
                              <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/30">
                                <div className="flex items-center space-x-2 mb-3">
                                  <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                                  <span className="font-medium text-yellow-300">Important Notice</span>
                                </div>
                                <p className="text-sm text-yellow-400 mb-4">
                                  This is AI-generated guidance for informational purposes only.
                                  Always consult qualified legal professionals for your specific situation.
                                </p>
                                <div className="bg-slate-700/30 p-3 rounded border border-yellow-600/30">
                                  <p className="text-slate-300">{guidance}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}

                    {/* Actionable Insights */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-sm backdrop-blur-sm">
                      <button
                        onClick={() => setExpandedSections(prev => ({ ...prev, insights: !prev.insights }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setExpandedSections(prev => ({ ...prev, insights: !prev.insights }));
                          }
                        }}
                        aria-expanded={expandedSections.insights}
                        aria-controls="insights-content"
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center border border-purple-700/30">
                            <LightBulbIcon className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Actionable Insights</h3>
                            <p className="text-sm text-slate-400">What you should do next</p>
                          </div>
                        </div>
                        {expandedSections.insights ?
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" /> :
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        }
                      </button>

                      {expandedSections.insights && (
                        <div id="insights-content" className="px-6 pb-6 border-t border-slate-600/50">
                          <div className="space-y-4">
                            {/* Next Steps */}
                            {selectedAnalysis.nextSteps && selectedAnalysis.nextSteps.length > 0 && (
                              <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                                <div className="flex items-center space-x-2 mb-3">
                                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                  <span className="font-medium text-green-300">Recommended Next Steps</span>
                                </div>
                                <div className="space-y-2">
                                  {selectedAnalysis.nextSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-sm text-green-400">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Export Options */}
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                              <div className="flex items-center space-x-2 mb-3">
                                <DocumentTextIcon className="h-5 w-5 text-blue-400" />
                                <span className="font-medium text-blue-300">Export & Share</span>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <button className="bg-slate-700/50 border border-blue-600/50 text-blue-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-600/50 transition-colors">
                                  Download PDF Report
                                </button>
                                <button className="bg-slate-700/50 border border-blue-600/50 text-blue-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-600/50 transition-colors">
                                  Share Analysis
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Analysis Details */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-600/50 shadow-sm p-6 backdrop-blur-sm">
                    {/* Extracted Text */}
                    {selectedAnalysis.extractedText && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">📄 Extracted Content</h3>
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                          <div className="mb-2 flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300">Text Extraction Status:</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                              selectedAnalysis.extractedText.includes('Error:') ||
                              selectedAnalysis.extractedText.includes('Unable to extract') ?
                              'bg-yellow-900/50 text-yellow-300 border-yellow-700/30' : 'bg-green-900/50 text-green-300 border-green-700/30'
                            }`}>
                              {selectedAnalysis.extractedText.includes('Error:') ||
                               selectedAnalysis.extractedText.includes('Unable to extract') ?
                               '⚠️ Limited Extraction' : '✅ Text Extracted'}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-slate-300 whitespace-pre-wrap text-sm">
                              {selectedAnalysis.extractedText.length > 500
                                ? `${selectedAnalysis.extractedText.substring(0, 500)}...`
                                : selectedAnalysis.extractedText
                              }
                            </p>
                            
                            {selectedAnalysis.extractedText.includes('Error:') && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-800">
                                  <strong>Note:</strong> Text extraction had issues. For better analysis:
                                  <ul className="mt-1 ml-4 list-disc">
                                    <li>Upload text files (.txt) for best results</li>
                                    <li>Convert PDFs to images for OCR</li>
                                    <li>Or copy-paste text directly</li>
                                  </ul>
                                </p>
                              </div>
                            )}
                            
                            {selectedAnalysis.extractedText.length > 500 && (
                              <button
                                onClick={() => {
                                  alert(selectedAnalysis.extractedText);
                                }}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Show full extracted text →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Legal Guidance */}
                    {(() => {
                      const guidance = getLegalGuidance(selectedAnalysis);
                      if (guidance) {
                        return (
                          <div>
                            <h3 className="text-lg font-medium text-white mb-3">Legal Guidance</h3>
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                              <p className="text-blue-300">{guidance}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h2 className="text-xl font-semibold text-white mb-2">Select an Analysis</h2>
                  <p className="text-slate-400">
                    Choose an analysis from the list to view detailed results.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;