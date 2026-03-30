import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqH_S1ZclbRTagWi7ERSSpmId0RvcM15A",
  authDomain: "ideed-709aa.firebaseapp.com",
  projectId: "ideed-709aa",
  storageBucket: "ideed-709aa.firebasestorage.app",
  messagingSenderId: "760698140229",
  appId: "1:760698140229:web:3a94e09fc3a216476ed52c",
  measurementId: "G-494X3TT4LB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);