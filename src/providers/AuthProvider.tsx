import React, { useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  Auth,
  UserCredential,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

import { useFirebase } from './FirebaseProvider';
import { UserModel } from '../views/user/model';
import { useHistory } from 'react-router-dom';
import { setThisSessionId, getThisSessionId, removeThisSessionId } from '../sessionStorage/thisSessionId';
import { remove, ref, onDisconnect, set } from 'firebase/database';
import { collection, doc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';

type Props = {
  children: ReactNode;
};

interface AuthValue {
  auth: Auth;
  thisUser?: UserModel;
  setUserCredential: React.Dispatch<UserCredential>;
  setSession: (databaseRef: string|null) => void;
  doCreateUserWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential | undefined>;
  doSignInWithEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<UserCredential | undefined>;
  doSignInWithGoogle: () => Promise<UserCredential | undefined>;
  doSignOut: () => Promise<void>;
  doSendPasswordResetEmail: (email: string) => Promise<void>;
  doSendEmailVerification: () => Promise<void>;
  doUpdatePassword: (password: string) => Promise<void>;
  doCreateUserWithEmailAndPasswordAndName: (email: string, name: string, password: string) => Promise<void>;
  checkUserEmailCollision: (userEmail: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const state = useContext(AuthContext);

  if (!state) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return state;
}

export function AuthProvider({ children }: Props) {
  const [thisUser, setThisUser] = useState<UserModel>();
  const [userCredential, setUserCredential] = useState<UserCredential>();
  const { SHARE_PATH, firestore, database, auth } = useFirebase();
  const history = useHistory();

  const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const doSignInWithEmailAndPassword = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const doSignInWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
  }

  const doSignOut = async () => {
    setThisUser(undefined);
    setUserCredential(undefined);
    removeSession();
    return signOut(auth);
  } 

  const doSendPasswordResetEmail = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  }

  const doSendEmailVerification = async () => {
    if (!auth.currentUser) {
      return;
    }

    return sendEmailVerification(auth.currentUser);
  }

  const doUpdatePassword = async (password: string) => {
    if (!auth.currentUser) {
      return;
    }

    return updatePassword(auth.currentUser, password);
  }

  const createUserIfNotExist = useCallback(async (userModel: UserModel) => {
    const userRef = [
      SHARE_PATH,
      `users/${userModel.id}`,
    ].join('/');
    return setDoc(doc(firestore, userRef), Object.assign({}, userModel))
  }, [SHARE_PATH, firestore]);

  const removeSession = useCallback(async () => {
    const thisSessionId = getThisSessionId();
    if (thisSessionId) {
      removeThisSessionId();
      const sessionRef = [
        SHARE_PATH,
        `sessions/${thisSessionId}`,
      ].join('/');
      remove(ref(database, sessionRef));
    }
  }, [SHARE_PATH, database]);

  const setSession = useCallback(async (databaseRef: string|null) => {
    const thisSessionId = getThisSessionId();
    if (thisUser && thisSessionId && databaseRef) {
      const sessionRef = [
        SHARE_PATH,
        `sessions/${thisSessionId}`,
      ].join('/');

      remove(ref(database, sessionRef));
      await set(ref(database, sessionRef), {
        currentDatabaseRef: databaseRef,
        name: thisUser.name,
        id: thisUser.id,
      });
      onDisconnect(ref(database, sessionRef)).remove();
    }
  }, [SHARE_PATH, database, thisUser]);

  const doCreateUserWithEmailAndPasswordAndName = async (
    email: string,
    name: string,
    password: string,
  ): Promise<void> => {
    const userCredentail = await doCreateUserWithEmailAndPassword(email, password);
    const id = userCredentail?.user?.uid
    if (!id) {
      return;
    }

    const userRef = [
      SHARE_PATH,
      `users/${id}`
    ].join('/');
    const userModel = Object.assign({}, new UserModel({id, ref: userRef, name, email}));
    userModel.ref = userRef;
    await setDoc(doc(firestore, userRef), userModel);
  }

  const checkUserEmailCollision = async (userEmail: string): Promise<boolean> => {
    const usersRef = [
      SHARE_PATH,
      `users`
    ].join('/');
    const q = query(collection(firestore, usersRef), where('email', '==', userEmail));
    const snapshot = await getDocs(q);
    const isEmailOk = (snapshot?.size || 0) === 0;
    return isEmailOk;
  }

  useEffect(() => {
    let unsubscribeUser = () => {};
    const unsubscribeOnAuthStateChanged = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = [
          SHARE_PATH,
          `users/${user.uid}`,
        ].join('/');

        unsubscribeUser = onSnapshot(doc(firestore,userRef), async (snapshot) => {
          let userData = snapshot?.data() as UserModel;
          if (!userData) {
            userData = new UserModel({
              id: user.uid,
              ref: [SHARE_PATH, `users/${user.uid}`].join('/'),
              email: user?.email || '',
              name: user?.displayName || user?.email || '',
            })
            await createUserIfNotExist(userData);
            window.location.reload();
            return;
          }
          setThisUser(userData);
        });

        if (!getThisSessionId()) {
          setThisSessionId(`${user.uid}_${Number(new Date())}`);
        }
      } else {
        removeSession();
        unsubscribeUser();
        unsubscribeOnAuthStateChanged();
      }
    });
  }, [SHARE_PATH, auth, createUserIfNotExist, firestore, history, userCredential, removeSession]);

  const providerValue = {
    auth,
    thisUser,
    setUserCredential,
    setSession,
    doCreateUserWithEmailAndPassword,
    doSignInWithEmailAndPassword,
    doSignInWithGoogle,
    doSignOut,
    doSendPasswordResetEmail,
    doSendEmailVerification,
    doUpdatePassword,
    doCreateUserWithEmailAndPasswordAndName,
    checkUserEmailCollision,
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  )
}
