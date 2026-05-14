// ========================
// CONFIG
// ========================
const API_KEY  = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_IMG = "https://image.tmdb.org/t/p/";
const BASE_URL = "https://api.themoviedb.org/3";

// IDs de géneros TMDB
const GENRES = {
  action:    28,
  scifi:     878,
  horror:    27,
  drama:     18,
  animation: 16,
};


// ========================
// NAV SCROLL
// ========================
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });


// ========================
// AVATAR USUARIO
// ========================
const username = localStorage.getItem("username") || "?";
const avatar   = document.getElementById("nav-avatar");
if (avatar) avatar.textContent = username.charAt(0).toUpperCase();


// ========================
// BÚSQUEDA
// ========================
const searchToggleBtn = document.getElementById("search-toggle-btn");
const navCenter       = document.getElementById("nav-search-wrap");
const searchInput     = document.getElementById("search-input");
const searchClear     = document.getElementById("search-clear");
const searchOverlay   = document.getElementById("search-overlay");
const searchResults   = document.getElementById("search-results");

let searchTimeout = null;

// Mobile: mostrar/ocultar barra
if (searchToggleBtn) {
  searchToggleBtn.addEventListener("click", () => {
    navCenter.classList.toggle("visible");
    if (navCenter.classList.contains("visible")) searchInput.focus();
  });
}

searchInput.addEventListener("input", () => {
  const val = searchInput.value.trim();
  searchClear.classList.toggle("visible", val.length > 0);

  clearTimeout(searchTimeout);
  if (val.length < 2) {
    searchOverlay.classList.remove("open");
    return;
  }

  searchTimeout = setTimeout(() => doSearch(val), 380);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.classList.remove("visible");
  searchOverlay.classList.remove("open");
  searchResults.innerHTML = "";
});

async function doSearch(query) {
  try {
    const res  = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`);
    const data = await res.json();

    searchOverlay.classList.add("open");

    if (!data.results || data.results.length === 0) {
      searchResults.innerHTML = `<p class="search-empty">Sin resultados para "${query}"</p>`;
      return;
    }

    searchResults.innerHTML = "";
    data.results.slice(0, 8).forEach(movie => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      const poster = movie.poster_path
        ? `${BASE_IMG}w92${movie.poster_path}`
        : "https://via.placeholder.com/44x64/140721/9b6fff?text=?";
      item.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <div class="search-result-info">
          <h4>${movie.title}</h4>
          <p>${movie.release_date ? movie.release_date.slice(0,4) : ""} · ★ ${movie.vote_average ? movie.vote_average.toFixed(1) : "-"}</p>
        </div>
      `;
      item.addEventListener("click", () => {
        window.location.href = `movie.html?id=${movie.id}`;
      });
      searchResults.appendChild(item);
    });

  } catch(e) {
    console.error("Error en búsqueda:", e);
  }
}

// Cerrar overlay al hacer click fuera
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-bar") && !e.target.closest(".search-overlay")) {
    searchOverlay.classList.remove("open");
  }
});


// ========================
// BANNER HERO
// ========================
let bannerMovies  = [];
let currentBanner = 0;
let bannerTimer   = null;

const sliderTrack = document.getElementById("slider-track");
const bannerDots  = document.getElementById("banner-dots");
const bannerTitle = document.getElementById("banner-title");
const bannerDesc  = document.getElementById("banner-description");
const bannerBtn   = document.getElementById("banner-btn");
const bannerListBtn = document.getElementById("banner-list-btn");
const bannerBadges  = document.getElementById("banner-badges");

async function loadBanner() {
  try {
    const res  = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
    const data = await res.json();
    bannerMovies = data.results.filter(m => m.backdrop_path).slice(0, 6);

    bannerMovies.forEach((movie, i) => {
      // Slide
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.innerHTML = `<img src="${BASE_IMG}w1280${movie.backdrop_path}" alt="${movie.title}" loading="${i === 0 ? 'eager' : 'lazy'}">`;
      sliderTrack.appendChild(slide);

      // Dot
      const dot = document.createElement("div");
      dot.className = "banner-dot" + (i === 0 ? " active" : "");
      dot.addEventListener("click", () => goToBanner(i));
      bannerDots.appendChild(dot);
    });

    updateBannerContent(0);
    startBannerTimer();

  } catch(e) { console.error("Error cargando banner:", e); }
}

function updateBannerContent(index) {
  const movie = bannerMovies[index];
  if (!movie) return;

  bannerTitle.textContent = movie.title;
  bannerDesc.textContent  = movie.overview || "";

  // Badges géneros
  bannerBadges.innerHTML = "";
  if (movie.genre_ids) {
    const genreMap = { 28:"Acción", 12:"Aventura", 16:"Animación", 35:"Comedia", 80:"Crimen", 18:"Drama", 14:"Fantasía", 27:"Terror", 9648:"Misterio", 10749:"Romance", 878:"Ciencia ficción", 53:"Suspenso", 10752:"Bélica" };
    movie.genre_ids.slice(0,3).forEach(id => {
      if (genreMap[id]) {
        const b = document.createElement("span");
        b.className = "banner-badge";
        b.textContent = genreMap[id];
        bannerBadges.appendChild(b);
      }
    });
  }

  // Dots
  document.querySelectorAll(".banner-dot").forEach((d,i) => {
    d.classList.toggle("active", i === index);
  });

  // Botón
  bannerBtn.onclick = () => {
    window.location.href = `movie.html?id=${movie.id}`;
  };

  bannerListBtn.onclick = () => {
    addToMyList(movie);
    bannerListBtn.textContent = "✓ En mi lista";
    setTimeout(() => { bannerListBtn.textContent = "+ Mi lista"; }, 2000);
  };
}

function goToBanner(index) {
  currentBanner = index;
  sliderTrack.style.transform = `translateX(-${index * 100}%)`;
  updateBannerContent(index);
  resetBannerTimer();
}

function nextBanner() {
  goToBanner((currentBanner + 1) % bannerMovies.length);
}

function prevBanner() {
  goToBanner((currentBanner - 1 + bannerMovies.length) % bannerMovies.length);
}

function startBannerTimer() {
  bannerTimer = setInterval(nextBanner, 5500);
}
function resetBannerTimer() {
  clearInterval(bannerTimer);
  startBannerTimer();
}

document.getElementById("banner-next").addEventListener("click", () => { nextBanner(); resetBannerTimer(); });
document.getElementById("banner-prev").addEventListener("click", () => { prevBanner(); resetBannerTimer(); });


// ========================
// CAROUSEL BUTTONS
// ========================
document.querySelectorAll(".carousel-wrap").forEach(wrap => {
  const carousel = wrap.querySelector(".carousel");
  const leftBtn  = wrap.querySelector(".carousel-btn-left");
  const rightBtn = wrap.querySelector(".carousel-btn-right");

  if (leftBtn)  leftBtn.addEventListener("click",  () => { carousel.scrollBy({ left: -300, behavior: "smooth" }); });
  if (rightBtn) rightBtn.addEventListener("click", () => { carousel.scrollBy({ left:  300, behavior: "smooth" }); });
});


// ========================
// CARGAR CARRUSEL GENÉRICO
// ========================
async function loadCarousel(containerId, url) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    data.results.forEach((movie, i) => {
      if (!movie.poster_path) return;
      const card = document.createElement("div");
      card.className = "movie-card";
      card.style.animationDelay = `${i * 40}ms`;
      card.innerHTML = `
        <img src="${BASE_IMG}w342${movie.poster_path}" alt="${movie.title}" loading="lazy">
        ${movie.vote_average ? `<span class="movie-card-rating">★ ${movie.vote_average.toFixed(1)}</span>` : ""}
        <div class="movie-card-info">
          <p class="movie-card-title">${movie.title}</p>
          <p class="movie-card-year">${movie.release_date ? movie.release_date.slice(0,4) : ""}</p>
        </div>
      `;
      card.addEventListener("click", () => openQuickModal(movie));
      container.appendChild(card);
    });

  } catch(e) { console.error(`Error en carousel ${containerId}:`, e); }
}


// ========================
// CARRUSEL RANKED (Top 10)
// ========================
async function loadRankedCarousel() {
  const container = document.getElementById("carousel-ranked");
  if (!container) return;

  try {
    const res  = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`);
    const data = await res.json();

    data.results.slice(0,10).forEach((movie, i) => {
      if (!movie.poster_path) return;
      const card = document.createElement("div");
      card.className = "ranked-card";
      card.innerHTML = `
        <span class="ranked-number">${i + 1}</span>
        <img src="${BASE_IMG}w342${movie.poster_path}" alt="${movie.title}" loading="lazy">
      `;
      card.addEventListener("click", () => openQuickModal(movie));
      container.appendChild(card);
    });

  } catch(e) { console.error("Error en ranked:", e); }
}


// ========================
// SEGUIR VIENDO (desde localStorage)
// ========================
function loadContinueWatching() {
  const container = document.getElementById("carousel-continue");
  const section   = document.getElementById("section-continue");
  if (!container) return;

  // Guardamos en localStorage cuando se visita una película
  // Key: "continue_watching" → array de { id, title, backdrop, progress }
  let list = [];
  try { list = JSON.parse(localStorage.getItem("continue_watching") || "[]"); } catch(e) {}

  if (list.length === 0) {
    if (section) section.style.display = "none";
    return;
  }

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "continue-card";
    const thumb = item.backdrop
      ? `${BASE_IMG}w300${item.backdrop}`
      : "https://via.placeholder.com/200x112/140721/9b6fff?text=?";

    card.innerHTML = `
      <img class="continue-thumb" src="${thumb}" alt="${item.title}" loading="lazy">
      <div class="continue-progress-bar">
        <div class="continue-progress-fill" style="width: ${item.progress || 30}%"></div>
      </div>
      <div class="continue-card-info">
        <p class="continue-card-title">${item.title}</p>
        <p class="continue-card-meta">${item.progress || 30}% visto</p>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `movie.html?id=${item.id}`;
    });
    container.appendChild(card);
  });
}


// ========================
// PROMO CARD
// ========================
async function loadPromoCard() {
  try {
    const res  = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=1`);
    const data = await res.json();
    const pick = data.results.find(m => m.backdrop_path) || data.results[0];
    if (!pick) return;

    document.getElementById("promo-bg").style.backgroundImage    = `url(${BASE_IMG}w1280${pick.backdrop_path})`;
    document.getElementById("promo-title").textContent           = pick.title;
    document.getElementById("promo-sub").textContent             = "Próximamente en cines";
    document.getElementById("promo-btn").addEventListener("click", () => {
      window.location.href = `movie.html?id=${pick.id}`;
    });

  } catch(e) { console.error("Error en promo card:", e); }
}


// ========================
// QUICK MODAL
// ========================
const quickModal        = document.getElementById("quick-modal");
const quickModalBackdrop = document.getElementById("quick-modal-backdrop");
const quickModalClose   = document.getElementById("quick-modal-close");

function openQuickModal(movie) {
  document.getElementById("qm-banner").src    = movie.backdrop_path ? `${BASE_IMG}w780${movie.backdrop_path}` : "";
  document.getElementById("qm-title").textContent    = movie.title;
  document.getElementById("qm-year").textContent     = movie.release_date ? movie.release_date.slice(0,4) : "";
  document.getElementById("qm-rating").textContent   = movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : "";
  document.getElementById("qm-overview").textContent = movie.overview || "Sin descripción disponible.";

  // Géneros
  const genreMap = { 28:"Acción", 12:"Aventura", 16:"Animación", 35:"Comedia", 80:"Crimen", 18:"Drama", 14:"Fantasía", 27:"Terror", 9648:"Misterio", 10749:"Romance", 878:"Sci-Fi", 53:"Suspenso" };
  const genres = (movie.genre_ids || []).slice(0,3).map(id => genreMap[id] || "").filter(Boolean).join(" · ");
  document.getElementById("qm-genres").textContent = genres;

  document.getElementById("qm-go-btn").onclick = () => {
    window.location.href = `movie.html?id=${movie.id}`;
  };

  const qmListBtn = document.getElementById("qm-list-btn");
  qmListBtn.textContent = "+ Mi lista";
  qmListBtn.onclick = () => {
    addToMyList(movie);
    qmListBtn.textContent = "✓ Guardada";
  };

  quickModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeQuickModal() {
  quickModal.classList.remove("open");
  document.body.style.overflow = "";
}

if (quickModalClose)   quickModalClose.addEventListener("click",   closeQuickModal);
if (quickModalBackdrop) quickModalBackdrop.addEventListener("click", closeQuickModal);


// ========================
// MI LISTA (localStorage)
// ========================
function addToMyList(movie) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem("my_list") || "[]"); } catch(e) {}
  if (!list.find(m => m.id === movie.id)) {
    list.push({ id: movie.id, title: movie.title, poster: movie.poster_path });
    localStorage.setItem("my_list", JSON.stringify(list));
  }
}


// ========================
// INIT — cargar todo
// ========================
async function init() {
  loadBanner();
  loadContinueWatching();
  loadPromoCard();

  // Carruseles en paralelo
  await Promise.all([
    loadCarousel("carousel-trending", `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`),
    loadCarousel("carousel-top",      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`),
    loadCarousel("carousel-action",   `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${GENRES.action}&sort_by=popularity.desc`),
    loadCarousel("carousel-scifi",    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${GENRES.scifi}&sort_by=popularity.desc`),
    loadCarousel("carousel-horror",   `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${GENRES.horror}&sort_by=popularity.desc`),
    loadCarousel("carousel-drama",    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${GENRES.drama}&sort_by=popularity.desc`),
    loadCarousel("carousel-animation",`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${GENRES.animation}&sort_by=popularity.desc`),
    loadRankedCarousel(),
  ]);
}

init();
