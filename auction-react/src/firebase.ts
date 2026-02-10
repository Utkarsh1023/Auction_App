import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCXRmLjoco1fyik1SD5Sf_63L1rjt_24Uo",
  authDomain: "auction-2fe3e.firebaseapp.com",
  projectId: "auction-2fe3e",
  storageBucket: "auction-2fe3e.firebasestorage.app",
  messagingSenderId: "950774732889",
  appId: "1:950774732889:web:ef237fd0f5d8063bf0f948"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
