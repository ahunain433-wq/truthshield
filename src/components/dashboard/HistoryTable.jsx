import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import {
  EyeIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const HistoryTable = () => {
  const navigate = useNavigate();
  const { deleteDocument } = useFirestore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Enhanced mock data with more details
  const [submissions, setSubmissions] = useState([
    {
      id: '1',
      type: 'PDF Document',
      typeIcon: DocumentIcon,
      status: 'Completed',
      date: '2026-01-15',
      result: 'Authentic',
      confidence: 98.5,
      processingTime: '2.3s'
    },
    {
      id: '2',
      type: 'Image Scan',
      typeIcon: PhotoIcon,
      status: 'Processing',
      date: '2026-01-14',
      result: 'Analyzing',
      confidence: null,
      processingTime: null
    },
    {
      id: '3',
      type: 'Video Content',
      typeIcon: VideoCameraIcon,
      status: 'Completed',
      date: '2026-01-13',
      result: 'Manipulated',
      confidence: 23.1,
      processingTime: '8.7s'
    },
    {
      id: '4',
      type: 'Text Analysis',
      typeIcon: ChatBubbleLeftIcon,
      status: 'Completed',
      date: '2026-01-12',
      result: 'Suspicious',
      confidence: 67.8,
      processingTime: '1.2s'
    },
  ]);

  const handleViewSubmission = (submissionId) => {
    navigate(`/analysis/${submissionId}`);
  };

  const handleDeleteClick = (submissionId) => {
    setDeleteConfirm(submissionId);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeletingId(deleteConfirm);
    try {
      // In a real app, this would be a database call
      // For now, we'll just simulate the deletion from the local state
      setSubmissions(prev => prev.filter(sub => sub.id !== deleteConfirm));
      setDeleteConfirm(null);
      showToast('Submission deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting submission:', error);
      showToast('Failed to delete submission', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-verified';
      case 'Processing':
        return 'badge-processing';
      default:
        return 'badge-info';
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'Authentic':
        return 'badge-verified';
      case 'Manipulated':
        return 'badge-manipulated';
      case 'Suspicious':
        return 'badge-suspicious';
      case 'Analyzing':
        return 'badge-processing';
      default:
        return 'badge-info';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 90) return 'text-emerald-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="card bg-[var(--ts-card)] border border-[var(--ts-border)] shadow-lg shadow-slate-900/5">
      {/* Table Header */}
      <div className="card-header bg-gradient-to-r from-slate-50 to-white text-[var(--ts-text-primary)]">
        <h3 className="text-lg font-semibold">Recent Verifications</h3>
        <p className="text-sm text-[var(--ts-text-muted)] mt-1">Your latest document analysis results</p>
      </div>

      {/* Mobile-friendly list */}
      <div className="md:hidden divide-y divide-[var(--ts-border)]">
        {submissions.map((submission) => (
          <div key={submission.id} className="p-4 flex space-x-4">
            <div className="h-12 w-12 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <submission.typeIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--ts-text-primary)]">
                    #{submission.id.toString().padStart(4, '0')}
                  </p>
                  <p className="text-sm text-[var(--ts-text-muted)]">{submission.type}</p>
                </div>
                <span className={`badge ${getStatusBadge(submission.status)}`}>
                  {submission.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`badge ${getResultBadge(submission.result)}`}>{submission.result}</span>
                <span className="text-xs text-[var(--ts-text-muted)]">
                  {new Date(submission.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  {submission.confidence ? (
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        submission.confidence >= 90 ? 'bg-[var(--color-verified-500)]' :
                        submission.confidence >= 70 ? 'bg-[var(--color-processing-500)]' : 'bg-[var(--color-suspicious-500)]'
                      }`}
                      style={{ width: `${submission.confidence}%` }}
                    />
                  ) : (
                    <div className="h-2 rounded-full bg-slate-200" />
                  )}
                </div>
                <span className={`text-xs font-semibold ${getConfidenceColor(submission.confidence)}`}>
                  {submission.confidence ? `${submission.confidence}%` : '-'}
                </span>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleViewSubmission(submission.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-150"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleDeleteClick(submission.id)}
                  disabled={deletingId === submission.id}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-150 disabled:opacity-60"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  {deletingId === submission.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--ts-border)]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Result
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--ts-text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[var(--ts-border)]">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
                      <submission.typeIcon className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-[var(--ts-text-primary)]">
                        #{submission.id.toString().padStart(4, '0')}
                      </div>
                      <div className="text-sm text-[var(--ts-text-muted)]">
                        {submission.type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {submission.status === 'Processing' ? (
                      <ClockIcon className="w-4 h-4 text-yellow-500 animate-pulse" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className={`badge ${getStatusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  {submission.processingTime && (
                    <div className="text-xs text-[var(--ts-text-muted)] mt-1">
                      {submission.processingTime}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getResultBadge(submission.result)}`}>
                    {submission.result}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {submission.confidence ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-20">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            submission.confidence >= 90 ? 'bg-[var(--color-verified-500)]' :
                            submission.confidence >= 70 ? 'bg-[var(--color-processing-500)]' : 'bg-[var(--color-suspicious-500)]'
                          }`}
                          style={{ width: `${submission.confidence}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${getConfidenceColor(submission.confidence)}`}>
                        {submission.confidence}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--ts-text-muted)]">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--ts-text-muted)]">
                  {new Date(submission.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewSubmission(submission.id)}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-150"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(submission.id)}
                      disabled={deletingId === submission.id}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-150 disabled:opacity-60"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      {deletingId === submission.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card bg-slate-800 max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center border border-red-700/30">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Delete Submission</h3>
                <p className="text-slate-300 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete submission #{deleteConfirm}? This will permanently remove the analysis results and cannot be recovered.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === deleteConfirm}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 rounded-lg transition-colors duration-150"
              >
                {deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Footer */}
      <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {submissions.length} of {submissions.length} verifications
          </div>
          <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-150">
            View All →
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm ${
            toast.type === 'success'
              ? 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
              : 'bg-red-900/90 border-red-700 text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;