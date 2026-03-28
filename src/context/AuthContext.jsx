import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  auth,
  db
} from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';

// Create the context
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

    // Initialize Firestore hook
  const firestore = useFirestore();

  // Register a new user
  const register = async (email, password, fullName) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        fullName,
        role: 'user', // default role
        createdAt: new Date().toISOString(),
        submissionsCount: 0,
        lastLogin: new Date().toISOString()
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in Firestore
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        { lastLogin: new Date().toISOString() },
        { merge: true }
      );

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    try {
      if (auth.currentUser) {
        // Update in Firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: data.fullName
        });

        // Update in Firestore
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          { ...data, updatedAt: new Date().toISOString() },
          { merge: true }
        );

        return { success: true };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      return await firestore.getUserProfile(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch additional user data from Firestore
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};