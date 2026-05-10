import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

// Replace with your 
// Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyArcXFu9RBSvYyEZOC0ZBwiaGkMcgDt6uM",
  authDomain: "restaurant-project-7e8ad.firebaseapp.com",
  projectId: "restaurant-project-7e8ad",
  storageBucket: "restaurant-project-7e8ad.firebasestorage.app",
  messagingSenderId: "163290794646",
  appId: "1:163290794646:web:1122b67a9d58d2813990b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Export signInWithPopup
export { signInWithPopup };