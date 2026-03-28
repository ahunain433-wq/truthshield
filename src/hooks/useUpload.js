// src/hooks/useUpload.js - UPDATED VERSION
import { useState } from 'react';
import { useFirestore } from './useFirestore';
import { processFileForAnalysis } from '../services/analysisService';
import { getFileTypeFromMime } from '../lib/utils'; // Import from your utils

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const { addDocument } = useFirestore();

  const uploadMultipleFiles = async (files, userId, fileAnalyses = null) => {
    setIsUploading(true);
    setError(null);
    const results = [];
    
    try {
      console.log(`📤 Starting upload of ${files.length} files for user:`, userId);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileAnalysis = fileAnalyses ? fileAnalyses[i] : null;

        // Update progress with intelligent details
        setUploadProgress({
          current: i + 1,
          total: files.length,
          fileName: file.name,
          percentage: ((i + 1) / files.length) * 100,
          status: fileAnalysis ? `Processing with ${fileAnalysis.analysis.processingStrategy} strategy...` : 'Processing...',
          analysis: fileAnalysis ? {
            type: fileAnalysis.analysis.type.description,
            quality: fileAnalysis.analysis.quality.score,
            estimatedTime: fileAnalysis.analysis.content.estimatedProcessingTime
          } : null
        });

        console.log(`🔍 Processing file ${i + 1}/${files.length}:`, file.name);
        console.log(`🧠 Using strategy:`, fileAnalysis?.analysis.processingStrategy || 'standard');

        // Process file with TruthShield AI analysis and intelligent context
        const analysisResult = await processFileForAnalysis(file, userId, fileAnalysis);
        
        // Prepare submission data for Firestore
        const submissionData = {
          fileName: analysisResult.fileName,
          fileType: getFileTypeFromMime(file.type) || analysisResult.fileType,
          fileSize: analysisResult.fileSize,
          extractedText: analysisResult.extractedText,
          aiAnalysis: analysisResult.aiAnalysis,
          legalGuidance: analysisResult.legalGuidance,
          credibilityScore: analysisResult.credibilityScore,
          status: analysisResult.status,
          analysisDuration: analysisResult.analysisDuration,
          createdAt: analysisResult.createdAt,
          userId: analysisResult.userId,
          // TruthShield specific
          riskAssessment: analysisResult.riskAssessment,
          recommendedActions: analysisResult.recommendedActions,
          nextSteps: analysisResult.nextSteps,
          // Original file info
          originalName: file.name,
          mimeType: file.type,
          lastModified: file.lastModified
        };
        
        // Save to Firestore
        console.log('💾 Saving to database...');
        const savedResult = await addDocument('submissions', submissionData);
        
        if (savedResult && savedResult.id) {
          console.log('✅ Saved successfully. ID:', savedResult.id);
          results.push({
            ...savedResult,
            success: true,
            message: 'Analysis complete'
          });
        } else {
          console.warn('⚠️ Save returned unexpected result:', savedResult);
          results.push({
            fileName: file.name,
            success: false,
            message: 'Failed to save to database'
          });
        }
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          status: 'Saved to database',
          completed: i + 1
        }));
      }
      
      console.log(`🎉 Upload complete. ${results.length} files processed.`);
      return results;
      
    } catch (error) {
      const errorMsg = error.message || 'Unknown upload error';
      console.error('❌ Upload process failed:', errorMsg);
      setError(errorMsg);
      throw new Error(`Upload failed: ${errorMsg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return {
    isUploading,
    uploadProgress,
    error,
    uploadMultipleFiles
  };
};