    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
    import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
    import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

     const firebaseConfig = {

  apiKey: "AIzaSyBtocQN6MgI6Sq39J7S3rM9dErBgZOBDr4",
  authDomain: "reservation-billet.firebaseapp.com",
  projectId: "reservation-billet",
  storageBucket: "reservation-billet.firebasestorage.app",
  messagingSenderId: "1034764943125",
  appId: "1:1034764943125:web:c2f8f338d9b71e4a99f31c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);