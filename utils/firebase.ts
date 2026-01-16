import { getMessaging } from "firebase/messaging";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRJyFVuK5aNRWerZZ8aMAOdBC0YnmYTXU",
  authDomain: "lmsquarn.firebaseapp.com",
  projectId: "lmsquarn",
  storageBucket: "lmsquarn.firebasestorage.app",
  messagingSenderId: "39551623889",
  appId: "1:39551623889:web:fcee64c2b3f1748a249bf0",
  measurementId: "G-SLWSRBVFZZ"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const messaging = typeof window !== "undefined"
  ? getMessaging(app)
  : null;