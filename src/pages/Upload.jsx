import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpload } from '../hooks/useUpload';
import { useFirestore } from '../hooks/useFirestore';
import FileUploadBox from '../components/upload/FileUploadBox';
import FilePreview from '../components/upload/FilePreview';
import UploadProgress from '../components/upload/UploadProgress';
import Button from '../components/ui/button';
import { ArrowUpTrayIcon, InformationCircleIcon, DocumentTextIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const { currentUser } = useAuth();
  const { uploadMultipleFiles, isUploading, uploadProgress, error } = useUpload();
  const { getDocuments } = useFirestore();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [fileAnalyses, setFileAnalyses] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPDFTips, setShowPDFTips] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [userDocumentCount, setUserDocumentCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(false);

  // Check user's document count on component mount
  useEffect(() => {
    const checkUserDocumentLimit = async () => {
      if (currentUser) {
        setCheckingLimit(true);
        try {
          const userDocuments = await getDocuments('submissions', [
            { field: 'userId', operator: '==', value: currentUser.uid }
          ]);
          setUserDocumentCount(userDocuments.length);
        } catch (error) {
          console.error('Error checking user document count:', error);
        } finally {
          setCheckingLimit(false);
        }
      }
    };

    checkUserDocumentLimit();
  }, [currentUser, getDocuments]);

  const handleFileSelect = (selectedFiles, analyses = null) => {
    // Limit to 5 files max
    const filesArray = Array.from(selectedFiles).slice(0, 5);
    setFiles(filesArray);
    setAnalysisComplete(!!analyses);

    if (analyses) {
      setFileAnalyses(analyses);
      console.log('📊 File analyses received:', analyses.length, 'files analyzed');

      // Check if any files have warnings or recommendations
      const hasIssues = analyses.some(item => item.analysis.quality.warnings.length > 0);
      if (hasIssues) {
        console.log('⚠️ Some files have quality warnings');
      }
    }

    // Legacy PDF tips (keep for backward compatibility)
    const hasPDFs = filesArray.some(file =>
      file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
    );
    if (hasPDFs && !analyses) {
      setShowPDFTips(true);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !currentUser) return;

    // Check document limit
    if (userDocumentCount >= 5) {
      alert('You have reached the maximum limit of 5 documents. Please delete some existing documents before uploading new ones.');
      return;
    }

    const newTotal = userDocumentCount + files.length;
    if (newTotal > 5) {
      alert(`You can only upload ${5 - userDocumentCount} more document(s) to stay within your limit of 5 total documents.`);
      return;
    }

    try {
      console.log('🚀 Starting intelligent upload process...');

      // Upload with intelligent processing
      const results = await uploadMultipleFiles(files, currentUser.uid, fileAnalyses);
      setUploadResults(results);

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      console.log(`✅ Upload complete: ${successCount}/${totalCount} files processed successfully`);

      // Update document count
      setUserDocumentCount(prev => prev + successCount);

      // Clear state after successful upload
      setFiles([]);
      setFileAnalyses([]);
      setShowPDFTips(false);
      setAnalysisComplete(false);

      // Smart success messaging
      // if (successCount === totalCount) {
      //   alert(`🎉 All ${totalCount} files uploaded and analyzed successfully! Redirecting to results...`);
      // } else {
      //   alert(`⚠️ ${successCount}/${totalCount} files processed. Some files may need attention. Check results for details.`);
      // }

      // Navigate to analysis page
      setTimeout(() => {
        navigate('/analysis');
      }, successCount === totalCount ? 1500 : 3000); // Longer delay if there were issues

    } catch (err) {
      console.error('❌ Intelligent upload failed:', err);

      // Enhanced error messaging
      const errorMessage = err.message.includes('Rate limit')
        ? 'Upload rate limit reached. Please wait a moment and try again.'
        : err.message.includes('quota')
        ? 'Service temporarily busy. Please try again in a few minutes.'
        : `Upload failed: ${err.message}. Please check your files and try again.`;

      alert(errorMessage);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newAnalyses = fileAnalyses.filter((_, i) => i !== index);

    setFiles(newFiles);
    setFileAnalyses(newAnalyses);

    // Update analysis complete status
    setAnalysisComplete(newAnalyses.length > 0);

    // Legacy PDF tips
    const hasPDFs = newFiles.some(file =>
      file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')
    );
    setShowPDFTips(hasPDFs && newAnalyses.length === 0);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setUploadResults([]);
    setShowPDFTips(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Intelligent Content Analysis</h1>
          </div>
          <p className="text-slate-300 mb-4">
            Upload document files for AI-powered analysis. Our intelligent system automatically detects file types,
            assesses quality, and provides smart recommendations before processing.
          </p>

        {/* Intelligence Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold">🧠</span>
              </div>
              <h3 className="font-semibold text-blue-300">Smart Analysis</h3>
            </div>
            <p className="text-sm text-slate-400">AI automatically detects content types and quality</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h3 className="font-semibold text-emerald-300">Instant Feedback</h3>
            </div>
            <p className="text-sm text-slate-400">Real-time quality assessment and recommendations</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold">🎯</span>
              </div>
              <h3 className="font-semibold text-purple-300">Optimized Processing</h3>
            </div>
            <p className="text-sm text-slate-400">Smart processing strategies for best results</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 backdrop-blur-sm border border-red-700/50 text-red-300 px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* PDF Tips Banner (shown when PDFs are selected) */}
      {showPDFTips && (
        <div className="mb-6 bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start">
            <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-300 mb-1">📄 PDF File Detected</h3>
              <p className="text-blue-200 text-sm mb-3">
                For best PDF analysis results, ensure your PDF contains selectable text (not scanned images).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/50">
                  <div className="flex items-center mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="font-medium text-white">Text-based PDF</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ✓ Text is selectable/copyable<br />
                    ✓ Will extract automatically<br />
                    ✓ Best for analysis
                  </p>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/50">
                  <div className="flex items-center mb-2">
                    <PhotoIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="font-medium text-white">Scanned/Image PDF</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    ✗ Text is not selectable<br />
                    ✗ Requires image conversion<br />
                    ✗ Use screenshots instead
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPDFTips(false)}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Hide tips
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload Area */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
            <div className="flex items-center mb-6">
              <ArrowUpTrayIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Upload Files</h2>
            </div>
            
            <FileUploadBox
              onFileSelect={handleFileSelect}
              maxFiles={5}
              maxSizeMB={2}
            />
            
            <div className="mt-6 text-sm text-slate-400 space-y-1">
              <p>✅ Supported: PDF, DOC, DOCX, Text files only</p>
              <p>📏 Max file size: 2MB per file</p>
              <p>📊 Max files: 5 at once</p>
              {checkingLimit ? (
                <p>🔄 Checking document limit...</p>
              ) : (
                <p>📈 Your documents: {userDocumentCount}/5 ({5 - userDocumentCount} remaining)</p>
              )}
            </div>

            {files.length > 0 && !isUploading && (
              <div className="mt-6 flex space-x-3">
                <Button 
                  onClick={handleUpload}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Start Analysis
                </Button>
                <Button 
                  variant="outline"
                  onClick={clearAllFiles}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
              <UploadProgress
                progress={uploadProgress}
                currentFile={files[0]?.name}
                totalFiles={files.length}
              />
            </div>
          )}

          {/* Recent Uploads */}
          {uploadResults.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
              <div className="space-y-3">
                {uploadResults.slice(0, 3).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-emerald-900/20 rounded-lg border border-emerald-700/30">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-emerald-900/50 rounded-lg flex items-center justify-center mr-3 border border-emerald-700/30">
                        <span className="text-emerald-400 font-semibold">
                          {result.fileName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{result.fileName}</p>
                        <p className="text-sm text-slate-400">Uploaded successfully</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-emerald-900/50 text-emerald-300 rounded-full border border-emerald-700/30">
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
              {uploadResults.length > 3 && (
                <p className="text-sm text-slate-400 mt-3">
                  + {uploadResults.length - 3} more uploads
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - File Preview */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Selected Files</h2>
            {files.length > 0 && (
              <span className="bg-blue-900/50 text-blue-300 text-sm font-medium px-3 py-1 rounded-full border border-blue-700/30">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <FilePreview
            files={files}
            analyses={fileAnalyses}
            onRemove={removeFile}
            isUploading={isUploading}
          />

          {files.length === 0 && !isUploading && (
            <div className="text-center py-12 text-slate-500">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg font-medium mb-2 text-slate-400">No files selected</p>
              <p className="text-sm text-slate-500">Drag & drop files or click to browse</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tips Section */}
      <div className="mt-8 space-y-6">
        {/* PDF-Specific Tips */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-blue-300">📄 PDF Analysis Guide</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white mb-2 flex items-center">
                <span className="inline-block w-6 h-6 bg-emerald-900/50 text-emerald-400 rounded-full text-center text-sm leading-6 mr-2 border border-emerald-700/30">✓</span>
                Text-based PDFs
              </h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Text is selectable/copyable</li>
                <li>• Created from Word/Google Docs</li>
                <li>• Best for automatic analysis</li>
                <li>• Extracts text in seconds</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white mb-2 flex items-center">
                <span className="inline-block w-6 h-6 bg-yellow-900/50 text-yellow-400 rounded-full text-center text-sm leading-6 mr-2 border border-yellow-700/30">⚠</span>
                Scanned PDFs
              </h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Text is not selectable</li>
                <li>• Created by scanning paper</li>
                <li>• Convert to images first</li>
                <li>• Use OCR for analysis</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white mb-2 flex items-center">
                <span className="inline-block w-6 h-6 bg-purple-900/50 text-purple-400 rounded-full text-center text-sm leading-6 mr-2 border border-purple-700/30">🔧</span>
                Conversion Tips
              </h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• PDF → Images: Take screenshots</li>
                <li>• PDF → Text: Use online converters</li>
                <li>• Free tools: SmallPDF, iLovePDF</li>
                <li>• Or copy-paste text manually</li>
              </ul>
            </div>
          </div>
        </div>

        {/* General Tips */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">💡 Tips for Better Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-emerald-900/50 rounded-lg flex items-center justify-center mr-3 border border-emerald-700/30">
                  <span className="text-emerald-400 font-bold">1</span>
                </div>
                <h4 className="font-medium text-white">Document Quality</h4>
              </div>
              <p className="text-sm text-slate-400">
                Use text-based PDFs or Word documents for best results. Avoid scanned documents that may need OCR processing.
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center mr-3 border border-blue-700/30">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <h4 className="font-medium text-white">Supported Formats</h4>
              </div>
              <p className="text-sm text-slate-400">
                Best formats: PDF (text-based), DOC/DOCX (Word documents), TXT (plain text).
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-900/50 rounded-lg flex items-center justify-center mr-3 border border-purple-700/30">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <h4 className="font-medium text-white">Content Preparation</h4>
              </div>
              <p className="text-sm text-slate-400">
                For invoices: Include all details. For legal docs: Ensure clear text. For audio: Clear speech.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-orange-300 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white mb-2">Test with Sample Files</h4>
              <p className="text-sm text-slate-400 mb-3">
                Try these for demonstration:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Create a sample fake invoice text
                    const fakeInvoice = `URGENT: Payment Required\nInvoice: SCAM-INV-999\nAmount: $5,000\nPay via Bitcoin immediately\nOr face legal action!`;
                    const blob = new Blob([fakeInvoice], { type: 'text/plain' });
                    const file = new File([blob], 'sample-fake-invoice.txt', { type: 'text/plain' });
                    handleFileSelect([file]);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-red-900/50 text-red-300 rounded-full hover:bg-red-900/70 border border-red-700/30 transition-all duration-200 hover:scale-105"
                >
                  Sample Fake Invoice
                </button>
                <button
                  onClick={() => {
                    // Create a sample legitimate invoice
                    const legitInvoice = `INVOICE\nNumber: INV-2023-001\nDate: ${new Date().toLocaleDateString()}\nAmount: $1,200.00\nTerms: Net 30\nThank you for your business.`;
                    const blob = new Blob([legitInvoice], { type: 'text/plain' });
                    const file = new File([blob], 'sample-legit-invoice.txt', { type: 'text/plain' });
                    handleFileSelect([file]);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-900/50 text-emerald-300 rounded-full hover:bg-emerald-900/70 border border-emerald-700/30 transition-all duration-200 hover:scale-105"
                >
                  Sample Legit Invoice
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/50">
              <h4 className="font-medium text-white mb-2">Need Help?</h4>
              <p className="text-sm text-slate-400 mb-3">
                Common issues and solutions:
              </p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• PDF not extracting? Check if it's text-based</li>
                <li>• Word doc issues? Save as DOCX format</li>
                <li>• Analysis slow? Reduce file size under 2MB</li>
                <li>• Need legal advice? Consult professional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Upload;