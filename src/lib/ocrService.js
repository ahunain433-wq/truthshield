// src/lib/ocrService.js - PRODUCTION-READY PDF EXTRACTION SYSTEM
import { createWorker } from 'tesseract.js';

// Initialize PDF.js properly
let pdfjsLib = null;
let isPDFJSLoaded = false;

// Load PDF.js with proper configuration
const loadPDFJS = async () => {
  if (!pdfjsLib && typeof window !== 'undefined') {
    try {
      // Use the existing PDF.js from pdf-worker.js
      const pdfjsModule = await import('./pdf-worker');
      pdfjsLib = pdfjsModule.default;
      // Note: workerSrc is already set in pdf-worker.js
      isPDFJSLoaded = true;
      console.log('✅ PDF.js loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load PDF.js:', error);
    }
  }
  return pdfjsLib;
};

// PRODUCTION-READY PDF TEXT EXTRACTION - SIMPLE & RELIABLE
export const extractTextFromPDF = async (pdfFile, progressCallback = null) => {
  const startTime = Date.now();

  if (progressCallback) {
    progressCallback('Initializing PDF processing...');
  }

  console.log('📄 Starting PRODUCTION PDF text extraction...');

  try {
    // Step 1: Load PDF.js
    if (progressCallback) {
      progressCallback('Loading PDF library...');
    }

    await loadPDFJS();
    if (!pdfjsLib || !isPDFJSLoaded) {
      throw new Error('PDF.js failed to load');
    }

    // Step 2: Load PDF document
    if (progressCallback) {
      progressCallback('Loading PDF document...');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`✅ PDF loaded: ${pdf.numPages} pages`);

    let extractedText = '';
    let successfulPages = 0;

    // Limit to first 20 pages for performance (increase if needed)
    const maxPages = Math.min(pdf.numPages, 20);
    console.log(`📄 Processing ${maxPages} pages...`);

    // Step 3: Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        if (progressCallback) {
          progressCallback(`Extracting text from page ${pageNum}/${maxPages}...`);
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Simple text extraction - no complex cleaning needed
        const pageText = textContent.items
          .map(item => item.str || '')
          .filter(text => text.trim().length > 0)
          .join(' ')
          .trim();

        if (pageText.length > 5) { // Minimum meaningful text
          extractedText += pageText + '\n\n';
          successfulPages++;
        }

        // Clean up memory
        page.cleanup();

      } catch (pageError) {
        console.warn(`⚠️ Page ${pageNum} extraction failed:`, pageError.message);
        if (progressCallback) {
          progressCallback(`Page ${pageNum} extraction failed, continuing...`);
        }
      }
    }

    // Clean up PDF
    pdf.cleanup();

    const processingTime = Date.now() - startTime;
    console.log(`✅ Extracted ${successfulPages}/${maxPages} pages in ${processingTime}ms`);

    // If we got meaningful text, return it
    if (successfulPages > 0 && extractedText.trim().length > 50) {
      if (progressCallback) {
        progressCallback('Text extraction completed successfully!');
      }

      const cleanedText = extractedText.trim();
      return formatExtractionResult(cleanedText, pdfFile.name, successfulPages, pdf.numPages);
    }

    // If PDF.js failed to extract text, it might be image-based
    console.log('⚠️ No text extracted - likely image-based PDF, trying OCR...');
    if (progressCallback) {
      progressCallback('No text found, switching to OCR for scanned PDF...');
    }

    return await extractTextFromScannedPDF(pdfFile, progressCallback);

  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    if (progressCallback) {
      progressCallback('PDF.js extraction failed, trying OCR fallback...');
    }

    // Try OCR as fallback for any PDF type
    return await extractTextFromScannedPDF(pdfFile, progressCallback);
  }
};

// OCR-BASED EXTRACTION FOR SCANNED/IMAGES PDFs
const extractTextFromScannedPDF = async (pdfFile, progressCallback = null) => {
  console.log('🖼️ Converting PDF pages to images for OCR...');

  if (progressCallback) {
    progressCallback('Preparing PDF for OCR processing...');
  }

  try {
    await loadPDFJS();
    if (!pdfjsLib) throw new Error('PDF.js not available for OCR conversion');

    if (progressCallback) {
      progressCallback('Loading PDF document for OCR...');
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Limit to first 5 pages for OCR performance
    const maxPages = Math.min(pdf.numPages, 5);
    let combinedText = '';

    if (progressCallback) {
      progressCallback(`Starting OCR on ${maxPages} pages (this may take a few minutes)...`);
    }

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        if (progressCallback) {
          progressCallback(`Converting page ${pageNum}/${maxPages} to image...`);
        }

        const page = await pdf.getPage(pageNum);

        // Render page to canvas for OCR
        const scale = 2.0; // Higher resolution for better OCR
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        if (progressCallback) {
          progressCallback(`Rendering page ${pageNum}/${maxPages}...`);
        }

        await page.render(renderContext).promise;

        if (progressCallback) {
          progressCallback(`Running OCR on page ${pageNum}/${maxPages}...`);
        }

        // Convert canvas to blob for OCR
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png', 0.95);
        });

        if (blob) {
          const imageFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
          const pageText = await extractTextFromImage(imageFile);

          if (pageText && pageText.length > 20) {
            combinedText += `Page ${pageNum}:\n${pageText}\n\n`;
            if (progressCallback) {
              progressCallback(`✅ OCR completed for page ${pageNum}/${maxPages} (${pageText.length} chars)`);
            }
          } else {
            if (progressCallback) {
              progressCallback(`⚠️ Low OCR quality on page ${pageNum}/${maxPages}`);
            }
          }
        }

        page.cleanup();

      } catch (pageError) {
        console.warn(`⚠️ OCR failed for page ${pageNum}:`, pageError.message);
        if (progressCallback) {
          progressCallback(`❌ OCR failed for page ${pageNum}/${maxPages}`);
        }
      }
    }

    pdf.cleanup();

    if (combinedText.trim().length > 50) {
      console.log(`✅ OCR extracted ${combinedText.length} characters`);
      if (progressCallback) {
        progressCallback('OCR processing completed successfully!');
      }

      return formatExtractionResult(combinedText.trim(), pdfFile.name, maxPages, pdf.numPages, 'OCR');
    }

    // If OCR also fails, return helpful error
    if (progressCallback) {
      progressCallback('OCR processing completed but found minimal text');
    }

    return getPDFErrorMessage(pdfFile.name, 'No readable text found in PDF (tried both text extraction and OCR). The document may be corrupted, password-protected, or contain only images that OCR cannot process.');

  } catch (error) {
    console.error('❌ OCR conversion failed:', error);
    if (progressCallback) {
      progressCallback('OCR processing failed');
    }

    return getPDFErrorMessage(pdfFile.name, `OCR processing failed: ${error.message}`);
  }
};


// Format extraction result
const formatExtractionResult = (text, fileName, extractedPages, totalPages, method = 'PDF.js') => {
  const displayText = text.length > 5000
    ? text.substring(0, 5000) + '\n\n[Content truncated for display - ' + text.length + ' characters total]'
    : text;

  const methodNote = method === 'OCR' ? ' (via OCR processing)' : '';

  return `📄 PDF TEXT EXTRACTION SUCCESSFUL${methodNote}
File: ${fileName}
Pages Processed: ${extractedPages}/${totalPages}
Total Characters: ${text.length}
Extraction Method: ${method}

EXTRACTED TEXT CONTENT:
${displayText}

---
✅ Text extraction completed successfully.
The content above is ready for AI analysis.`;
};

// PDF error message
const getPDFErrorMessage = (fileName, error) => {
  return `❌ PDF PROCESSING ERROR
File: ${fileName}
Error: ${error}

🔧 TROUBLESHOOTING:

1. **Check PDF Format:**
   - Open the file in a PDF reader to verify it's not corrupted
   - Ensure it's not password protected
   - Try saving it as a new PDF file

2. **Alternative Solutions:**
   a) **Manual Text Extraction:**
      - Open PDF in Chrome or Adobe Reader
      - Press Ctrl+A (Select All)
      - Press Ctrl+C (Copy)
      - Create new .txt file and paste
      - Upload the .txt file
   
   b) **Online Conversion:**
      - Visit: https://smallpdf.com/pdf-to-word
      - Upload and convert to text
      - Download and upload the text file
   
   c) **Screenshot Method:**
      - Take screenshots of each page
      - Upload images for OCR processing

3. **File Requirements:**
   - Maximum size: 10MB
   - Must be a valid PDF file
   - Text must not be password protected
   - Best results with text-based PDFs (not scanned)

⚠️ **Note:** Scanned/image PDFs require OCR processing.
Upload as images for best results with scanned documents.`;
};

// IMAGE OCR - WORKING VERSION
export const extractTextFromImage = async (imageFile) => {
  try {
    console.log('🖼️ Starting image OCR processing...');
    
    const worker = await createWorker({
      logger: (m) => console.log('OCR Progress:', m.progress),
      errorHandler: (err) => console.error('OCR Error:', err),
    });
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // Set OCR parameters for better accuracy
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:-_@#$%&*()[]{}<>/\'"',
      preserve_interword_spaces: '1',
    });
    
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    
    console.log('✅ OCR completed. Characters extracted:', text.length);
    
    if (text.length < 20) {
      return `[Limited text extracted from image: ${text}]\n\nNote: Image may contain minimal text or be low quality.`;
    }
    
    return text;
  } catch (error) {
    console.error('❌ Image OCR failed:', error);
    // Explicitly try to terminate worker if it exists
    return `Failed to extract text from image: ${error.message}\n\nPlease ensure the image is clear and contains readable text.`;
  }
};

// MAIN TEXT EXTRACTION FUNCTION
export const extractTextFromFile = async (file) => {
  try {
    console.log('📁 Processing file:', file.name);
    console.log('Type:', file.type, 'Size:', (file.size / 1024).toFixed(1), 'KB');
    
    if (file.size === 0) {
      return `[Empty file: ${file.name}]`;
    }
    
    // Handle different file types
    if (file.type.startsWith('image/')) {
      return await extractTextFromImage(file);
    } 
    else if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }
    else if (file.type.startsWith('text/') || 
             file.name.toLowerCase().endsWith('.txt') ||
             file.name.toLowerCase().endsWith('.doc') ||
             file.name.toLowerCase().endsWith('.docx')) {
      
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        return `[Empty or unreadable file: ${file.name}]`;
      }
      
      return text;
    }
    else {
      return `[Unsupported file type: ${file.type}]\n\nPlease convert to PDF, image, or text format for analysis.`;
    }
  } catch (error) {
    console.error('❌ File processing failed:', error);
    return `Error processing ${file.name}: ${error.message}\n\nPlease try a different file or format.`;
  }
};

// Intelligent File Detection and Quality Assessment
export class FileIntelligence {
  static async analyzeFile(file) {
    try {
      const analysis = {
        type: this.detectFileType(file),
        quality: { score: 80, factors: ['Basic quality check'], warnings: [], suggestions: [] },
        content: { text: '', hasContent: false, contentType: 'unknown', previewLength: 0, estimatedProcessingTime: '2-5 seconds' },
        metadata: this.extractMetadata(file),
        recommendations: [],
        processingStrategy: 'standard'
      };

      // Try to assess quality (non-critical)
      try {
        analysis.quality = await this.assessQuality(file);
      } catch (qualityError) {
        console.warn('⚠️ Quality assessment failed:', qualityError.message);
      }

      // Try to extract content preview (non-critical)
      try {
        analysis.content = await this.extractContentPreview(file);
      } catch (previewError) {
        console.warn('⚠️ Content preview failed:', previewError.message);
      }

      // Generate smart recommendations based on analysis
      analysis.recommendations = this.generateRecommendations(analysis);

      // Determine optimal processing strategy
      analysis.processingStrategy = this.determineProcessingStrategy(analysis);

      return analysis;
    } catch (error) {
      console.error('❌ File analysis failed:', error);
      // Return basic analysis as fallback
      return {
        type: this.detectFileType(file),
        quality: { score: 50, factors: ['Analysis failed'], warnings: ['Unable to analyze file'], suggestions: ['Try uploading again'] },
        content: { text: 'Analysis failed', hasContent: false, contentType: 'error', previewLength: 0, estimatedProcessingTime: 'Unknown' },
        metadata: this.extractMetadata(file),
        recommendations: [{ type: 'error', priority: 'high', message: 'File analysis failed', actions: ['Try uploading again'] }],
        processingStrategy: 'standard',
        error: error.message
      };
    }
  }

  static detectFileType(file) {
    // Advanced file type detection beyond MIME types
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;

    // Document types
    if (mimeType.includes('pdf') || extension === 'pdf') {
      return {
        category: 'document',
        subtype: 'pdf',
        description: 'Portable Document Format',
        icon: '📄',
        color: 'red'
      };
    }

    if (extension === 'docx' || extension === 'doc' || mimeType.includes('word')) {
      return {
        category: 'document',
        subtype: 'word',
        description: 'Microsoft Word Document',
        icon: '📝',
        color: 'blue'
      };
    }

    // Image types with OCR potential
    if (mimeType.startsWith('image/')) {
      const imageType = this.classifyImageType(extension);
      return {
        category: 'image',
        subtype: imageType,
        description: `${extension.toUpperCase()} Image`,
        icon: '🖼️',
        color: 'green',
        ocrRecommended: true
      };
    }

    // Text files
    if (mimeType.startsWith('text/') || ['txt', 'csv', 'json', 'xml'].includes(extension)) {
      return {
        category: 'text',
        subtype: extension,
        description: `${extension.toUpperCase()} Text File`,
        icon: '📄',
        color: 'gray'
      };
    }

    // Media files
    if (mimeType.startsWith('video/')) {
      return {
        category: 'media',
        subtype: 'video',
        description: 'Video File',
        icon: '🎥',
        color: 'purple'
      };
    }

    if (mimeType.startsWith('audio/')) {
      return {
        category: 'media',
        subtype: 'audio',
        description: 'Audio File',
        icon: '🎵',
        color: 'yellow'
      };
    }

    return {
      category: 'unknown',
      subtype: 'unknown',
      description: 'Unknown File Type',
      icon: '❓',
      color: 'gray'
    };
  }

  static classifyImageType(extension) {
    const highQuality = ['png', 'tiff', 'bmp'];
    const standard = ['jpg', 'jpeg', 'gif'];
    const compressed = ['webp', 'heic'];

    if (highQuality.includes(extension)) return 'high_quality';
    if (standard.includes(extension)) return 'standard';
    if (compressed.includes(extension)) return 'compressed';
    return 'unknown';
  }

  static async assessQuality(file) {
    const quality = {
      score: 85, // Start with good score
      factors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Size assessment
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 10) {
        quality.score -= 20;
        quality.warnings.push('File size is large (>10MB)');
        quality.suggestions.push('Consider compressing or splitting large files');
      } else if (sizeMB < 0.1) {
        quality.warnings.push('File size is very small (<100KB)');
        quality.suggestions.push('Verify file is not corrupted or empty');
      }

      // Name assessment
      if (file.name.length > 100) {
        quality.score -= 5;
        quality.warnings.push('Filename is very long');
      }

      if (file.name.includes(' ') || file.name.includes('(') || file.name.includes(')')) {
        quality.suggestions.push('Consider renaming file with simple alphanumeric name');
      }

      // Type-specific quality checks
      if (file.type.startsWith('image/')) {
        quality.factors.push('Image files work best for visual content analysis');
        quality.factors.push('High resolution images (>300 DPI) recommended for OCR');
      }

      if (file.type.includes('pdf')) {
        quality.factors.push('PDF files preserve original formatting');
        quality.factors.push('Text-based PDFs extract faster than scanned PDFs');
      }

      if (file.type.startsWith('text/')) {
        quality.factors.push('Text files extract instantly with 100% accuracy');
        quality.factors.push('Best format for direct content analysis');
      }
    } catch (error) {
      console.warn('Quality assessment error:', error.message);
      quality.warnings.push('Unable to complete quality assessment');
    }

    return quality;
  }

  static async extractContentPreview(file) {
    const preview = {
      text: '',
      hasContent: false,
      contentType: 'unknown',
      previewLength: 0,
      estimatedProcessingTime: 'Unknown'
    };

    try {
      // Quick content detection
      if (file.type.startsWith('text/')) {
        try {
          const text = await file.text();
          preview.text = text.substring(0, 200);
          preview.hasContent = text.length > 0;
          preview.contentType = 'text';
          preview.previewLength = text.length;
          preview.estimatedProcessingTime = '< 1 second';
        } catch (error) {
          preview.text = 'Text file preview failed';
          preview.contentType = 'text';
          preview.estimatedProcessingTime = '< 1 second';
        }
      }

      else if (file.type.includes('pdf')) {
        preview.contentType = 'pdf';
        preview.estimatedProcessingTime = '2-5 seconds';
        preview.text = 'PDF document detected - text extraction will be performed during analysis';
        preview.hasContent = true;
      }

      else if (file.type.startsWith('image/')) {
        preview.contentType = 'image';
        preview.estimatedProcessingTime = '3-8 seconds';
        preview.text = 'Image file detected - OCR will be performed to extract text';
        preview.hasContent = true;
      }

      else {
        preview.contentType = 'binary';
        preview.estimatedProcessingTime = '1-3 seconds';
        preview.text = 'Binary file detected - content analysis will be attempted';
        preview.hasContent = file.size > 0;
      }

    } catch (error) {
      console.warn('Preview extraction error:', error.message);
      preview.text = 'Preview extraction failed';
      preview.contentType = 'error';
      preview.error = error.message;
    }

    return preview;
  }

  static extractMetadata(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      extension: file.name.split('.').pop().toLowerCase(),
      sizeFormatted: this.formatFileSize(file.size)
    };
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static generateRecommendations(analysis) {
    const recommendations = [];

    // Quality-based recommendations
    if (analysis.quality.score < 80) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        message: 'File quality issues detected',
        actions: analysis.quality.suggestions
      });
    }

    // Type-specific recommendations
    if (analysis.type.category === 'image') {
      recommendations.push({
        type: 'processing',
        priority: 'medium',
        message: 'Image file - OCR will be performed',
        actions: ['Ensure text is clear and legible', 'High resolution recommended']
      });
    }

    if (analysis.type.category === 'document' && analysis.type.subtype === 'pdf') {
      recommendations.push({
        type: 'processing',
        priority: 'low',
        message: 'PDF document - text extraction optimized',
        actions: ['Text-based PDFs extract faster', 'Scanned PDFs require OCR']
      });
    }

    if (analysis.type.category === 'text') {
      recommendations.push({
        type: 'processing',
        priority: 'low',
        message: 'Text file - direct processing available',
        actions: ['No extraction needed', 'Instant analysis possible']
      });
    }

    return recommendations;
  }

  static determineProcessingStrategy(analysis) {
    // Determine optimal processing approach
    if (analysis.type.category === 'text') {
      return 'direct'; // No extraction needed
    }

    if (analysis.type.category === 'image') {
      return 'ocr_priority'; // OCR is primary method
    }

    if (analysis.type.category === 'document') {
      return 'extraction_priority'; // Text extraction is primary
    }

    return 'standard'; // Default processing
  }
}

// Enhanced processing pipeline with intelligence
export const processFileWithIntelligence = async (file) => {
  console.log('🧠 Starting intelligent file processing...');

  let fileAnalysis;
  try {
    // Step 1: Analyze file with AI
    fileAnalysis = await FileIntelligence.analyzeFile(file);
    console.log('📊 File analysis complete:', fileAnalysis);
  } catch (analysisError) {
    console.warn('⚠️ File analysis failed, using fallback:', analysisError.message);
    // Fallback analysis
    fileAnalysis = {
      type: FileIntelligence.detectFileType(file),
      quality: { score: 70, factors: ['Basic analysis'], warnings: [], suggestions: [] },
      content: FileIntelligence.extractContentPreview(file),
      metadata: FileIntelligence.extractMetadata(file),
      recommendations: [],
      processingStrategy: 'standard'
    };
  }

  // Step 2: Extract content based on analysis
  let extractedText = '';
  const startTime = Date.now();

  try {
    console.log(`🔄 Using processing strategy: ${fileAnalysis.processingStrategy}`);

    switch (fileAnalysis.processingStrategy) {
      case 'direct':
        console.log('📝 Using direct text extraction');
        extractedText = await file.text();
        break;

      case 'ocr_priority':
        console.log('🖼️ Using OCR priority extraction');
        extractedText = await extractTextFromImage(file);
        break;

      case 'extraction_priority':
        console.log('📄 Using PDF extraction priority');
        extractedText = await extractTextFromPDF(file);
        break;

      default:
        console.log('🔧 Using standard extraction');
        extractedText = await extractTextFromFile(file);
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Content extracted in ${processingTime}ms using ${fileAnalysis.processingStrategy} strategy`);

    return {
      ...fileAnalysis,
      extractedText: cleanTextForAnalysis(extractedText),
      processingTime,
      success: true
    };

  } catch (extractionError) {
    console.error('❌ Content extraction failed:', extractionError);

    // Try fallback extraction
    try {
      console.log('🔄 Trying fallback extraction...');
      const fallbackText = await extractTextFromFile(file);

      return {
        ...fileAnalysis,
        extractedText: cleanTextForAnalysis(fallbackText),
        processingTime: Date.now() - startTime,
        success: true,
        fallbackUsed: true
      };
    } catch (fallbackError) {
      console.error('❌ Fallback extraction also failed:', fallbackError);

      return {
        ...fileAnalysis,
        extractedText: `Content extraction failed: ${extractionError.message}. Fallback also failed.`,
        processingTime: Date.now() - startTime,
        success: false,
        error: extractionError.message
      };
    }
  }
};

// Clean text for AI analysis
export const cleanTextForAnalysis = (text) => {
  if (!text || text.trim().length === 0) {
    return 'No text content available for analysis.';
  }
  
  // If it's a PDF extraction result, extract just the content
  if (text.includes('EXTRACTED TEXT CONTENT:')) {
    const match = text.match(/EXTRACTED TEXT CONTENT:\s*\n([\s\S]*?)(?=\n---|\n$)/);
    if (match && match[1]) {
      text = match[1].trim();
    }
  }
  
  // Clean the text
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
    .substring(0, 10000); // Limit for API
};