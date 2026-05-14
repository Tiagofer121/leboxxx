// ========================
// IMPORTS FIREBASE
// ========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================
// CONFIG
// ========================
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);


// ========================
// AUTO REDIRECT — si ya hay sesión activa
// ========================
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const docRef  = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Tiene username → directo a inicio
      const userData = docSnap.data();
      localStorage.setItem("username", userData.username);
      window.location.href = "inicio.html";
    } else {
      // Autenticado pero sin username → modal
      document.getElementById("usernameModal").style.display = "flex";
    }
  } catch(e) {
    console.error("Error comprobando sesión:", e);
  }
});


// ========================
// HELPERS
// ========================
function setLoading(btnId, loaderId, state) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle("loading", state);
  btn.disabled = state;
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = "";
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email":          "El email no es válido.",
    "auth/user-not-found":         "No existe una cuenta con ese email.",
    "auth/wrong-password":         "Contraseña incorrecta.",
    "auth/email-already-in-use":   "Ese email ya está registrado.",
    "auth/weak-password":          "La contraseña debe tener al menos 6 caracteres.",
    "auth/too-many-requests":      "Demasiados intentos. Esperá un momento.",
    "auth/network-request-failed": "Sin conexión. Revisá tu red.",
    "auth/invalid-credential":     "Email o contraseña incorrectos.",
  };
  return map[code] || "Ocurrió un error. Intentá de nuevo.";
}


// ========================
// LOGIN
// ========================
window.login = async function() {
  clearError("login-error");

  const email    = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;

  if (!email || !password) {
    showError("login-error", "Completá todos los campos.");
    return;
  }

  setLoading("login-btn", "login-loader", true);

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    const docRef  = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      document.getElementById("usernameModal").style.display = "flex";
    } else {
      const userData = docSnap.data();
      localStorage.setItem("username", userData.username);
      window.location.href = "inicio.html";
    }
  } catch(err) {
    showError("login-error", friendlyError(err.code));
    setLoading("login-btn", "login-loader", false);
  }
};


// ========================
// REGISTRO
// ========================
window.register = async function() {
  clearError("register-error");

  const email    = document.getElementById("emailRegister").value.trim();
  const password = document.getElementById("passwordRegister").value;
  const confirm  = document.getElementById("confirmRegister").value;

  if (!email || !password || !confirm) {
    showError("register-error", "Completá todos los campos.");
    return;
  }

  if (password !== confirm) {
    showError("register-error", "Las contraseñas no coinciden.");
    return;
  }

  if (password.length < 6) {
    showError("register-error", "La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  setLoading("register-btn", "register-loader", true);

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById("usernameModal").style.display = "flex";
  } catch(err) {
    showError("register-error", friendlyError(err.code));
    setLoading("register-btn", "register-loader", false);
  }
};


// ========================
// GUARDAR USERNAME
// ========================
window.guardarUsername = async function() {
  clearError("username-error");

  const username = document.getElementById("usernameInput").value.trim();

  if (!username) {
    showError("username-error", "Escribí un nombre de usuario.");
    return;
  }

  if (username.length < 3) {
    showError("username-error", "Debe tener al menos 3 caracteres.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showError("username-error", "Sesión expirada. Volvé a iniciar sesión.");
    return;
  }

  try {
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: user.email
    });

    localStorage.setItem("username", username);
    window.location.href = "inicio.html";
  } catch(err) {
    showError("username-error", "Error guardando el usuario. Intentá de nuevo.");
  }
};
