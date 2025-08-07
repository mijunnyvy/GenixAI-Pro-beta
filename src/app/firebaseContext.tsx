'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC6iE4Nm95ak7TCaDoJqw5P50eaZNjfrQk',
  authDomain: 'genixai1.firebaseapp.com',
  projectId: 'genixai1',
  storageBucket: 'genixai1.appspot.com',
  messagingSenderId: '656114830558',
  appId: '1:656114830558:web:1234567890abcdefg',
};
interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    setFirebaseApp(app);
    setFirebaseAuth(auth);
  }, []);

  return (
    <FirebaseContext.Provider value={{ app: firebaseApp, auth: firebaseAuth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
