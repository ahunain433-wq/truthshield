import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Initialize Firestore with some sample data
export const initFirestoreCollections = async () => {
  try {
    console.log('Initializing Firestore collections...');
    
    // Create users collection with sample admin user
    const adminUser = {
      uid: 'admin-001',
      email: 'admin@truthshield.com',
      fullName: 'System Administrator',
      role: 'admin',
      createdAt: new Date().toISOString(),
      submissionsCount: 0,
      lastLogin: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', adminUser.uid), adminUser);
    console.log('✓ Created admin user');
    
    // Create sample submissions
    const sampleSubmissions = [
      {
        id: 'sub-001',
        userId: 'demo-user',
        fileName: 'news-article.pdf',
        fileType: 'pdf',
        fileSize: 2048576,
        fileUrl: 'https://example.com/news-article.pdf',
        status: 'completed',
        extractedText: 'Sample news article content...',
        aiAnalysis: {
          isFake: false,
          confidence: 0.87,
          category: 'CREDIBLE',
          explanation: 'Article shows credible sources and factual information',
          timestamp: new Date().toISOString()
        },
        legalGuidance: 'This content appears legitimate. No legal action needed.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'sub-002',
        userId: 'demo-user',
        fileName: 'suspicious-image.jpg',
        fileType: 'image',
        fileSize: 1048576,
        fileUrl: 'https://example.com/suspicious-image.jpg',
        status: 'completed',
        extractedText: 'Text from image: "This is definitely not fake news!"',
        aiAnalysis: {
          isFake: true,
          confidence: 0.92,
          category: 'FAKE',
          explanation: 'Image shows signs of manipulation and misleading text',
          timestamp: new Date().toISOString()
        },
        legalGuidance: 'Consider reporting this to platform administrators.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }
    ];
    
    for (const submission of sampleSubmissions) {
      await setDoc(doc(db, 'submissions', submission.id), submission);
    }
    console.log('✓ Created sample submissions');
    
    console.log('Firestore initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return false;
  }
};

// Call this function once when needed
// initFirestoreCollections();