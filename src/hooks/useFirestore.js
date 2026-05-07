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

      // MERGE WITH LOCAL STORAGE
      const localKey = `truthshield_local_${collectionName}`;
      const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
      
      // Filter local data based on userId if applicable
      const userIdFilter = filters.find(f => f.field === 'userId');
      const filteredLocal = userIdFilter 
        ? localData.filter(d => d.userId === userIdFilter.value)
        : localData;

      // Combine and remove duplicates (by fileName/content)
      const combined = [...documents];
      filteredLocal.forEach(localDoc => {
        if (!combined.some(d => d.fileName === localDoc.fileName && d.createdAt === localDoc.createdAt)) {
          combined.push(localDoc);
        }
      });
      
      return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.warn('Firestore fetch failed, returning local storage only:', err.message);
      const localKey = `truthshield_local_${collectionName}`;
      const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
      const userIdFilter = filters.find(f => f.field === 'userId');
      return userIdFilter 
        ? localData.filter(d => d.userId === userIdFilter.value)
        : localData;
    } finally {
      setLoading(false);
    }
  };

  // Add a document
  const addDocument = async (collectionName, data) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create local backup
      const localKey = `truthshield_local_${collectionName}`;
      const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
      const newDoc = { 
        id: 'local_' + Date.now(), 
        ...data, 
        createdAt: new Date().toISOString(),
        isLocalOnly: true 
      };
      localData.unshift(newDoc);
      localStorage.setItem(localKey, JSON.stringify(localData.slice(0, 50)));

      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: docRef.id, ...data };
    } catch (err) {
      setError(err.message);
      console.error('Error adding document (using local fallback):', err);
      // Even if firestore fails, return the local doc so the app keeps working
      return { id: 'local_' + Date.now(), ...data, isLocalOnly: true };
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