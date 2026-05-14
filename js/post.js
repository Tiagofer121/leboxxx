// FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAVfEOW8sR-bRZ6gh5udkLwZ6g9bykNCoA",
  authDomain: "lebox-fee56.firebaseapp.com",
  projectId: "lebox-fee56",
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// TMDB
const TMDB_KEY  = "446e4bd3b832f95dbc4a0839a483513c";
const TMDB_BASE = "https://api.themoviedb.org/3";

// ESTADO
let username       = "";
let currentMovie   = null;
let selectedRating = 0;
let isSpoiler      = false;
let filtroActivo   = "all";
let allPosts       = [];
let searchTimeout  = null;


// ============================================================
// AUTH
// ============================================================
onAuthStateChanged(auth, async (user) => {

  showLoader();
  
  if (!user) {
    window.location.href = "../index.html";
    return;
  }
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) username = snap.data().username;
  startFeed();
});

window.logout = function () {
  signOut(auth).then(() => window.location.href = "../index.html");
};


// ============================================================
// DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // ---- BUSCADOR ----
  const searchInput  = document.getElementById("movie-search-input");
  const searchClear  = document.getElementById("search-clear");
  const searchRes    = document.getElementById("search-results");

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();

    // Mostrar/ocultar X
    searchClear.style.display = q.length ? "flex" : "none";

    if (!q) {
      ocultarResultados();
      return;
    }

    // Debounce 350ms
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => buscarPeliculas(q), 350);
  });

  searchClear.addEventListener("click", () => {
    searchInput.value          = "";
    searchClear.style.display  = "none";
    ocultarResultados();
    searchInput.focus();
  });

  // Cerrar al tocar fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".movie-search-section")) ocultarResultados();
  });

  // Quitar película seleccionada
  document.getElementById("ctx-remove").addEventListener("click", () => {
    currentMovie = null;
    document.getElementById("movie-context").style.display = "none";
    searchInput.value         = "";
    searchClear.style.display = "none";
  });

  // ---- ESTRELLAS ----
  const stars = document.querySelectorAll(".stars-row .star");

  stars.forEach(star => {
    star.addEventListener("mouseenter", () => {
      const val = Number(star.dataset.value);
      stars.forEach(s => {
        const sv = Number(s.dataset.value);
        s.classList.toggle("active",        sv <= selectedRating);
        s.classList.toggle("hover-preview", sv > selectedRating && sv <= val);
      });
    });
    star.addEventListener("mouseleave", () => {
      stars.forEach(s => s.classList.remove("hover-preview"));
    });
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.value);
      stars.forEach(s =>
        s.classList.toggle("active", Number(s.dataset.value) <= selectedRating)
      );
      const preview    = document.getElementById("rating-preview");
      const previewVal = document.getElementById("rating-preview-val");
      previewVal.textContent = selectedRating;
      preview.style.display  = "flex";
    });
  });

  // ---- SPOILER ----
  document.getElementById("spoiler-btn").addEventListener("click", () => {
    isSpoiler = !isSpoiler;
    document.getElementById("spoiler-btn").classList.toggle("activo", isSpoiler);
  });

  // ---- FILTROS ----
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      filtroActivo = btn.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      aplicarFiltro();
    });
  });

});


// ============================================================
// BUSCAR PELÍCULAS (TMDB)
// ============================================================
async function buscarPeliculas(query) {
  const searchRes = document.getElementById("search-results");
  searchRes.style.display = "block";
  searchRes.innerHTML = `
    <div class="search-loading">
      <div class="spinner"></div>
      Buscando...
    </div>
  `;

  try {
    const res  = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      searchRes.innerHTML = `<div class="search-state">No encontramos nada para "${query}"</div>`;
      return;
    }

    searchRes.innerHTML = "";

    data.results.slice(0, 15).forEach(movie => {
      const year  = movie.release_date ? movie.release_date.split("-")[0] : "—";
      const score = movie.vote_average ? movie.vote_average.toFixed(1) : null;

      const item = document.createElement("div");
      item.classList.add("search-result-item");
      item.innerHTML = `
        <img
          class="result-poster"
          src="${movie.poster_path
            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
            : "https://via.placeholder.com/36x54/140721/9b6fff?text=?"}"
          alt="${movie.title}"
        >
        <div class="result-info">
          <p class="result-title">${movie.title}</p>
          <p class="result-year">${year}</p>
        </div>
        ${score ? `<span class="result-rating">★ ${score}</span>` : ""}
      `;

      item.addEventListener("click", () => seleccionarPelicula(movie));
      searchRes.appendChild(item);
    });

  } catch (err) {
    console.error(err);
    searchRes.innerHTML = `<div class="search-state">Error al buscar. Intentá de nuevo.</div>`;
  }
}

function seleccionarPelicula(movie) {
  currentMovie = movie;

  // Mostrar contexto
  const ctx      = document.getElementById("movie-context");
  const ctxImg   = document.getElementById("ctx-poster");
  const ctxTitle = document.getElementById("ctx-title");
  const ctxYear  = document.getElementById("ctx-year");

  ctxImg.src = movie.poster_path
    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
    : "https://via.placeholder.com/34x50/140721/9b6fff?text=?";
  ctxTitle.textContent = movie.title;
  ctxYear.textContent  = movie.release_date ? movie.release_date.split("-")[0] : "";
  ctx.style.display    = "flex";

  // Limpiar buscador
  document.getElementById("movie-search-input").value = "";
  document.getElementById("search-clear").style.display = "none";
  ocultarResultados();

  // Foco en textarea
  document.getElementById("postText").focus();
}

function ocultarResultados() {
  const res = document.getElementById("search-results");
  if (res) res.style.display = "none";
}


// ============================================================
// CREAR POST
// ============================================================
window.crearPost = async function () {
  const texto      = document.getElementById("postText").value.trim();
  const publishBtn = document.querySelector(".publish-btn");

  if (!texto)    return mostrarToast("Escribí algo primero ", "warn");
  if (!username) return mostrarToast("Cargando usuario...", "warn");

  if (selectedRating === 0) {
    const starsRow = document.querySelector(".stars-row");
    starsRow.classList.add("shake");
    setTimeout(() => starsRow.classList.remove("shake"), 500);
    return;
  }

  publishBtn.classList.add("loading");

  try {
    await addDoc(collection(db, "posts"), {
      texto,
      user:        username,
      fecha:       Date.now(),
      movieId:     currentMovie?.id          || null,
      movieTitle:  currentMovie?.title       || null,
      moviePoster: currentMovie?.poster_path || null,
      rating:      selectedRating,
      spoiler:     isSpoiler
    });

    // Reset
    document.getElementById("postText").value = "";
    selectedRating = 0;
    isSpoiler      = false;
    document.querySelectorAll(".stars-row .star").forEach(s => s.classList.remove("active"));
    document.getElementById("rating-preview").style.display = "none";
    document.getElementById("spoiler-btn").classList.remove("activo");
    currentMovie = null;
    document.getElementById("movie-context").style.display = "none";

    mostrarToast("Post publicado ✓");

  } catch (err) {
    console.error(err);
    mostrarToast("Error al publicar 😥", "error");
  } finally {
    publishBtn.classList.remove("loading");
  }
};


// ============================================================
// FEED
// ============================================================
function startFeed() {
  const q = query(collection(db, "posts"), orderBy("fecha", "desc"));
  onSnapshot(q, (snapshot) => {
    allPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    aplicarFiltro();
  });
}

function aplicarFiltro() {
  const feed    = document.getElementById("feed");
  const emptyEl = document.getElementById("empty-feed");
  if (!feed) return;

  const posts = filtroActivo === "spoiler-free"
    ? allPosts.filter(p => !p.spoiler)
    : allPosts;

  feed.innerHTML = "";

  if (posts.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  posts.forEach((data, idx) => {
    const el = crearPostEl(data);
    el.style.animationDelay = `${idx * 35}ms`;
    feed.appendChild(el);
  });
  hideLoader();
}

function crearPostEl(data) {
  const tiempoTexto  = tiempoRelativo(data.fecha);

  let starsHTML = "";
  for (let i = 1; i <= 7; i++) {
    starsHTML += `<span class="${i <= (data.rating || 0) ? "star-filled" : "star-empty"}">★</span>`;
  }

  const spoilerBadge = data.spoiler
    ? `<span class="spoiler-tag">⚠ Spoiler</span>` : "";

  const moviePill = data.moviePoster
    ? `<a class="movie-pill" href="movie.html?id=${data.movieId}">
        <img src="https://image.tmdb.org/t/p/w92${data.moviePoster}" alt="${data.movieTitle}">
        <div class="pill-info">
          <p class="pill-label">Película</p>
          <p class="pill-title">${data.movieTitle}</p>
        </div>
        <span class="pill-arrow">›</span>
       </a>` : "";

  const ratingBadge = data.rating > 0
    ? `<div class="post-rating-badge">
         <span class="post-rating-num">${data.rating}</span>
         <span class="post-rating-max">/7</span>
       </div>` : "";

  const textoDisplay = data.spoiler ? "⚠ Tocar para revelar el spoiler" : data.texto;
  const spoilerClass = data.spoiler ? "is-spoiler" : "";

  const post = document.createElement("div");
  post.classList.add("post");
  post.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${data.user?.charAt(0).toUpperCase() || "?"}</div>
      <div class="post-meta">
        <p class="post-user">@${data.user} ${spoilerBadge}</p>
        <p class="post-fecha">${tiempoTexto}</p>
      </div>
      ${ratingBadge}
    </div>
    ${moviePill}
    <div class="post-stars">${starsHTML}</div>
    <p class="post-text ${spoilerClass}">${textoDisplay}</p>
  `;

  if (data.spoiler) {
    const textEl = post.querySelector(".post-text");
    textEl.addEventListener("click", () => {
      textEl.textContent = data.texto;
      textEl.classList.remove("is-spoiler");
    });
  }

  return post;
}


// ============================================================
// UTILIDADES
// ============================================================
function tiempoRelativo(fecha) {
  const diff = Date.now() - fecha;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 7)  return `hace ${dias}d`;
  return new Date(fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function mostrarToast(msg, tipo = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.classList.add("toast");
    document.body.appendChild(toast);
  }
  toast.style.background = tipo === "warn"  ? "#d97706"
    : tipo === "error" ? "#dc2626" : "#22c55e";
  toast.textContent = msg;
  toast.classList.add("visible");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("visible"), 2500);
}

window.guardarUsername = async function () {
  const val = document.getElementById("usernameInput")?.value?.trim();
  if (!val) return;
  username = val;
  document.getElementById("usernameModal").style.display = "none";
};
