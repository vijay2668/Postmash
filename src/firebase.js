import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQW4s6VAac-ZWlVURJooxPqy-EsQL5ulU",
  authDomain: "postmash-3d3af.firebaseapp.com",
  projectId: "postmash-3d3af",
  storageBucket: "postmash-3d3af.appspot.com",
  messagingSenderId: "252747786008",
  appId: "1:252747786008:web:8ff31a818a71f22ab3206d",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore(app);
