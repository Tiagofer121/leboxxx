// 🔥 IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 CONFIG (PONÉ LA TUYA)
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔁 CAMBIO DE CARDS
window.showRegister = function() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("registerCard").style.display = "block";
};

window.showLogin = function() {
  document.getElementById("registerCard").style.display = "none";
  document.getElementById("loginCard").style.display = "block";
};

// 🔐 REGISTRO
window.register = function() {
  const email = document.getElementById("emailRegister").value;
  const password = document.getElementById("passwordRegister").value;

  if (!email || !password) {
    alert("Completá los campos");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // 👇 mostrar modal directo (nuevo usuario)
      document.getElementById("usernameModal").style.display = "flex";
    })
    .catch(err => alert(err.message));
};

// 🔐 LOGIN
window.login = function() {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  if (!email || !password) {
    alert("Completá los campos");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // 👇 si no tiene username → mostrar modal
        document.getElementById("usernameModal").style.display = "flex";
      } else {

  const userData = docSnap.data();

  localStorage.setItem(
    "username",
    userData.username
  );

  window.location.href = "../inicio.html";

}
    })
    .catch(err => alert(err.message));
};

// 💾 GUARDAR USERNAME
window.guardarUsername = async function() {
  const username = document.getElementById("usernameInput").value;

  if (!username) {
    alert("Escribí un usuario");
    return;
  }

  const user = auth.currentUser;

  await setDoc(doc(db, "users", user.uid), {
    username: username,
    email: user.email
  });

localStorage.setItem(
  "username",
  username
);

  window.location.href = "../inicio.html";
};