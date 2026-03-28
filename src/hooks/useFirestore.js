import { useState } from 'react';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get a single document
  const getDocument = async (collectionName, documentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          id: docSnap.id, 
          ...docSnap.data() 
        };
      } else {
        setError('Document not found');
        return null;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error getting document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get all documents in a collection
  const getDocuments = async (collectionName, filters = [], order = null, limitCount = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (order) {
        q = query(q, orderBy(order.field, order.direction || 'asc'));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ 
          id: doc.id, 
          ...doc.data() 
        });
      });
      
      return documents;
    } catch (err) {
      setError(err.message);
      console.error('Error getting documents:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a document
  const addDocument = async (collectionName, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: docRef.id, ...data };
    } catch (err) {
      setError(err.message);
      console.error('Error adding document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (collectionName, documentId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return { id: documentId, ...data };
    } catch (err) {
      setError(err.message);
      console.error('Error updating document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName, documentId) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteDoc(doc(db, collectionName, documentId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get user's submissions
  const getUserSubmissions = async (userId, limitCount = 10) => {
    return getDocuments('submissions', [
      { field: 'userId', operator: '==', value: userId }
    ], { field: 'createdAt', direction: 'desc' }, limitCount);
  };

  // Create a submission
  const createSubmission = async (userId, submissionData) => {
    return addDocument('submissions', {
      userId,
      ...submissionData,
      status: 'pending',
      analysisResults: null,
      createdAt: new Date().toISOString()
    });
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    return getDocument('users', userId);
  };

  // Update user profile
  const updateUserProfile = async (userId, userData) => {
    return updateDocument('users', userId, userData);
  };

  return {
    loading,
    error,
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    getUserSubmissions,
    createSubmission,
    getUserProfile,
    updateUserProfile
  };
};