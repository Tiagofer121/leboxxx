// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG (MISMA EN TODAS LAS PÁGINAS)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 PROTECCIÓN GLOBAL
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ❌ NO LOGUEADO → vuelve al login
    window.location.href = "index.html";
  } else {
    // ✅ LOGUEADO → podés usar user.uid si querés
    console.log("Usuario logueado:", user.email);
  }
});