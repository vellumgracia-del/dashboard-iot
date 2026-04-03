import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAt_EUWY_Y0oJlAe7yuypD2UU0FbPRzP-M",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "smart-farm-iot-9cbe8.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "smart-farm-iot-9cbe8",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "smart-farm-iot-9cbe8.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "365694195832",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:365694195832:web:07ee077d1d345e0c2fb58d",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-FZEPBRN9G2"
};

// Coba inisialisasi Firebase, hindari pesan error saat build Netlify jika env belum diatur
let app;
try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
    console.warn("Firebase initialization failed. Check credentials.", e);
}

const auth = app ? getAuth(app) : null as any;
const db = app ? getFirestore(app) : null as any;

export { app, auth, db };
