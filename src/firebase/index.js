import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFunctions } from "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyBNtasXr92CB2K5tvCQD7Gh-GfJMAVCuCA",
  authDomain: "descomplica-pbl-62bbe.firebaseapp.com",
  projectId: "descomplica-pbl-62bbe",
  storageBucket: "descomplica-pbl-62bbe.appspot.com",
  messagingSenderId: "99120278433",
  appId: "1:99120278433:web:4d70a2690f41d87f7db9e0",
  measurementId: "G-W298W7ZE2Q"
};

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
import "firebase/firestore"

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);


export{db, analytics, auth, storage, functions, app}
