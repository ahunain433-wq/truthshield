export interface Submission {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'url';
  fileSize: number;
  fileUrl: string;
  storagePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // OCR Results
  extractedText?: string;
  ocrConfidence?: number;
  
  // AI Analysis Results
  aiAnalysis?: {
    isFake: boolean;
    confidence: number;
    category: string;
    explanation: string;
    timestamp: Date;
  };
  
  // Legal Guidance
  legalGuidance?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}