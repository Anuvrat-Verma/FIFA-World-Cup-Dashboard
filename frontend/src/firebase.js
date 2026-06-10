import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 1. Add the Auth imports
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCz7_3qSnopHF6wAmiP9ik75gGzPmBKsTw",
  authDomain: "fifaoauth.firebaseapp.com",
  projectId: "fifaoauth",
  storageBucket: "fifaoauth.firebasestorage.app",
  messagingSenderId: "1070112033575",
  appId: "1:1070112033575:web:bbec43db356ab6312a3702",
  measurementId: "G-S5F093WHR2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. Initialize and EXPORT Auth so App.js can use them
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();