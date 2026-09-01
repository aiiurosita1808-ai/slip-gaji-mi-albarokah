import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence enabled
export const db = firebaseConfig.firestoreDatabaseId 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
    }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
    });

export {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch,
  signInWithPopup,
  signOut
};
