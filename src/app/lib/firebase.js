// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmaCGiHIK4qSfWphFJumQFAhQo9VUABYw",
  authDomain: "ideed-4e093.firebaseapp.com",
  projectId: "ideed-4e093",
  storageBucket: "ideed-4e093.firebasestorage.app",
  messagingSenderId: "961477923001",
  appId: "1:961477923001:web:8d168f38f429d0dea20b68",
  measurementId: "G-PNBQY9PW4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);