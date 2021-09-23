import React, { useContext, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {
  getStorage,
  connectStorageEmulator,
  FirebaseStorage,
} from 'firebase/storage';
import {
  getFirestore,
  connectFirestoreEmulator,
  arrayUnion,
  arrayRemove,
  collection,
  Firestore,
  FieldValue,
} from 'firebase/firestore';
import {
  getDatabase,
  connectDatabaseEmulator,
  Database,
} from 'firebase/database';
import {
  getFunctions,
  connectFunctionsEmulator,
  Functions,
} from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env?.REACT_APP_FIREBASE_CONFIG_apiKey,
  authDomain: process.env?.REACT_APP_FIREBASE_CONFIG_authDomain,
  databaseURL: process.env?.REACT_APP_FIREBASE_CONFIG_databaseURL,
  projectId: process.env?.REACT_APP_FIREBASE_CONFIG_projectId,
  storageBucket: process.env?.REACT_APP_FIREBASE_CONFIG_storageBucket,
  messagingSenderId: process.env?.REACT_APP_FIREBASE_CONFIG_messagingSenderId,
  appId: process.env?.REACT_APP_FIREBASE_CONFIG_appId,
  measurementId: process.env?.REACT_APP_FIREBASE_CONFIG_measurementId,
}

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const database = getDatabase(firebaseApp);
const functions = getFunctions(firebaseApp, process.env?.REACT_APP_FIREBASE_REGION_functions)
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

const FUNCTION_V: any = {};
for(const key in process.env) {
  const envRegex = /REACT_APP_FUNCTION_V_/g;
  if(envRegex.test(key)){
    const realKey = key.replace(envRegex, '');
    FUNCTION_V[realKey] = process.env[key] as string;
  }
}

if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(firestore, 'localhost', 8100);
  connectDatabaseEmulator(database, 'localhost', 8400);
  connectFunctionsEmulator(functions, 'localhost', 8300);
  connectStorageEmulator(storage, 'localhost', 8700);
  connectAuthEmulator(auth, 'http://localhost:8200');
}

type Props = {
  children: ReactNode;
};

interface FirebaseValue {
  ANI_CANVAS_PATH?: string;
  SHARE_PATH?: string;
  FUNCTION_V: {[key: string]: string},
  firestore: Firestore;
  database: Database;
  functions: Functions;
  storage: FirebaseStorage;
  auth: Auth;
  arrayUnion: (...values: Array<any>) => FieldValue;
  arrayRemove: (...values: Array<any>) => FieldValue;
}

const FirebaseContext = React.createContext<FirebaseValue | null>(null);

export function useFirebase(): FirebaseValue {
  const state = useContext(FirebaseContext);

  if (!state) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }

  return state;
}

export function FirebaseProvider({ children }: Props) {
  const ANI_CANVAS_PATH = process.env.REACT_APP_FIREBASE_ANI_CANVAS_PATH_PATH;
  const SHARE_PATH = process.env.REACT_APP_FIREBASE_SHARE_PATH;

  const providerValue = {
    ANI_CANVAS_PATH,
    SHARE_PATH,
    FUNCTION_V,
    firestore,
    database,
    functions,
    storage,
    auth,
    arrayUnion,
    arrayRemove,
    collection,
  };

  return (
    <FirebaseContext.Provider value={providerValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
