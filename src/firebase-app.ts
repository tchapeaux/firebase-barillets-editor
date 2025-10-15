import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Firebase configuration
// Note: These values are safe to commit publicly. Firebase security relies on
// Firestore security rules and authentication, not on hiding these config values.
const firebaseConfig = {
  apiKey: "AIzaSyBIU2kJLtaZV1J4Bom69LJWIML-Fo51S_o",
  authDomain: "match-impro-barillets.firebaseapp.com",
  projectId: "match-impro-barillets",
  storageBucket: "match-impro-barillets.firebasestorage.app",
  messagingSenderId: "584131771475",
  appId: "1:584131771475:web:fc29ceeb764a07e82b9aa6",
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

// Firebase utilities
export { collection, addDoc, serverTimestamp, onSnapshot };
