import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test 1: Check environment variables
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'MISSING',
    };

    // Test 2: Try to initialize Firebase
    let initError = null;
    try {
      const { db, auth } = await import('@/lib/firebase-server');
      console.log('Firebase initialized successfully');
    } catch (e) {
      initError = e instanceof Error ? e.message : String(e);
    }

    // Test 3: Try to query Firestore
    let queryError = null;
    try {
      const { db } = await import('@/lib/firebase-server');
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', 'test@test.com'));
      const querySnapshot = await getDocs(q);
      console.log('Firestore query successful, found', querySnapshot.size, 'documents');
    } catch (e) {
      queryError = e instanceof Error ? e.message : String(e);
    }

    return res.status(200).json({
      status: 'ok',
      environmentVariables: envVars,
      initError,
      queryError,
      nodeEnv: process.env.NODE_ENV,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
