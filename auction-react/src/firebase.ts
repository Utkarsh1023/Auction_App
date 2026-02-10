import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
