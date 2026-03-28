// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (fileType) => {
  const icons = {
    image: '🖼️',
    pdf: '📄',
    video: '🎬',
    audio: '🎵',
    text: '📝',
    url: '🔗',
    unknown: '📁'
  };
  return icons[fileType] || icons.unknown;
};

// Get file type from mime type
export const getFileTypeFromMime = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  return 'unknown';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate file
export const validateFile = (file, options = {}) => {
  const { maxSizeMB = 10, allowedTypes = [] } = options;
  
  const errors = [];
  
  // Check size
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Check type if allowedTypes specified
  if (allowedTypes.length > 0) {
    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      }
      return file.type.startsWith(type);
    });
    
    if (!isValidType) {
      errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Delay function
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Safe JSON parse
export const safeJsonParse = (str, defaultValue = {}) => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

// Get user initials
export const getUserInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};