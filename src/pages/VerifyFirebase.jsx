import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { ref } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/button';

const VerifyFirebase = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState({
    auth: 'Checking...',
    firestore: 'Checking...',
    storage: 'Checking...',
    collections: []
  });
  const [loading, setLoading] = useState(true);

const verifySetup = async () => {
  const results = {
    auth: '❌ Failed',
    firestore: '❌ Failed',
    storage: '⚠️ Skipped (CORS issue)', // Skip storage check
    collections: []
  };

  try {
    // 1. Check Authentication
    if (auth) {
      results.auth = `✅ Connected (App: ${auth.app.name})`;
    }

    // 2. Check Firestore
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        results.firestore = `✅ Connected (${querySnapshot.size} users)`;
      } catch (firestoreError) {
        results.firestore = `❌ Error: ${firestoreError.message}`;
      }
    }

    // 3. Skip Storage check for now
    if (storage) {
      results.storage = `⚠️ Storage available but CORS may block access. Using emulator recommended.`;
    }

    setStatus(results);
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    verifySetup();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Setup Verification</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Connection Status</h2>
            <Button onClick={verifySetup} disabled={loading}>
              {loading ? 'Checking...' : 'Re-check'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${status.auth.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">🔐</span>
                <div>
                  <h3 className="font-medium">Authentication</h3>
                  <p className="text-sm mt-1">{status.auth}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${status.firestore.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">🗄️</span>
                <div>
                  <h3 className="font-medium">Firestore Database</h3>
                  <p className="text-sm mt-1">{status.firestore}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${status.storage.includes('✅') ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">💾</span>
                <div>
                  <h3 className="font-medium">Storage</h3>
                  <p className="text-sm mt-1">{status.storage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current User</h2>
          {currentUser ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">UID</p>
                  <p className="font-mono text-sm">{currentUser.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Display Name</p>
                  <p className="font-medium">{currentUser.displayName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className={`font-medium ${currentUser.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentUser.emailVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700">No user logged in</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Next Steps:</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Make sure all services show ✅ green status</li>
            <li>Try uploading a file in the Upload page</li>
            <li>Check Firestore console for created documents</li>
            <li>Check Storage console for uploaded files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyFirebase;