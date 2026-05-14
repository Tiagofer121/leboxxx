import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// 🔥 CONFIG
const firebaseConfig = {

  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  databaseURL: "https://lebox-fee56-default-rtdb.firebaseio.com",
  projectId: "lebox-fee56",
  storageBucket: "lebox-fee56.firebasestorage.app",
  messagingSenderId: "992098261666",
  appId: "1:992098261666:web:effd38cf84bb4c9eabd5fb"

};


// 🚀 INIT
const app =
  initializeApp(firebaseConfig);


// 🔐 AUTH
const auth =
  getAuth(app);


// 🗄️ DB
const db =
  getFirestore(app);


// 📦 EXPORTS
export {
  auth,
  db
};