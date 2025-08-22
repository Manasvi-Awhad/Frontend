// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIZ0OKdrKbzuxmjuSUA3xXjLEHnODYQ-o",
  authDomain: "ipd1-e46e0.firebaseapp.com",
  projectId: "ipd1-e46e0",
  storageBucket: "ipd1-e46e0.firebasestorage.app",
  messagingSenderId: "124983818236",
  appId: "1:124983818236:web:740befe41bb906545b2479"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
