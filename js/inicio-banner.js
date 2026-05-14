// 🔥 CONFIG
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL = "https://api.themoviedb.org/3";

const TOTAL_PELICULAS = 1;
const INTERVALO = 4000;

// 🧠 ESTADO
let peliculas = [];
let index = 0;
let currentMovieId = null;


// 🎬 CARGAR PELÍCULAS
async function cargarPeliculas() {

  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES`
  );

  const data = await res.json();

  peliculas = data.results.slice(0, TOTAL_PELICULAS);

  renderSlides();

  // 🎬 PRIMERA PELÍCULA
  currentMovieId = peliculas[0].id;

  document.getElementById("banner-title").textContent =
    peliculas[0].title;

  crearInfoBanner(peliculas[0]);

  iniciarSlider();

}


// 🧱 CREAR SLIDES
function renderSlides() {

  const track =
    document.getElementById("slider-track");

  peliculas.forEach(movie => {

    const slide =
      document.createElement("div");

    slide.classList.add("slide");

    const img =
      document.createElement("img");

    // 🎬 BACKDROP
    img.src =
      `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    slide.appendChild(img);

    track.appendChild(slide);

  });

}


// 🎬 INFO DEL BANNER
function crearInfoBanner(movie) {

  const bannerContent =
    document.querySelector(".banner-content");

  // 🧹 BORRAR INFO ANTERIOR
  const oldInfo =
    document.querySelector(".banner-extra");

  if (oldInfo) oldInfo.remove();

  // 🧱 CONTENEDOR
  const info =
    document.createElement("div");

  info.classList.add("banner-extra");

  // ⭐ RATING
  const rating =
    movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "—";

  // ✂ DESCRIPCIÓN
  const overview =
    movie.overview
      ? movie.overview.slice(0, 180) + "..."
      : "Sin descripción disponible.";

  // 🧱 HTML
  info.innerHTML = `

    <img
      class="banner-poster"
      src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
    >

    <div class="banner-meta">

      <p class="banner-rating">
        ⭐ ${rating}/10
      </p>

      <p class="banner-description">
        ${overview}
      </p>

    </div>

  `;

  // ➕ AGREGAR
  bannerContent.appendChild(info);

}


// 🔄 SLIDER AUTOMÁTICO
function iniciarSlider() {

  const track =
    document.getElementById("slider-track");

  const title =
    document.getElementById("banner-title");

  setInterval(() => {

    index++;

    if (index >= peliculas.length) {
      index = 0;
    }

    // 🎬 MOVER SLIDER
    track.style.transform =
      `translateX(-${index * 100}%)`;

    // 🎬 ACTUALIZAR INFO
    title.textContent =
      peliculas[index].title;

    currentMovieId =
      peliculas[index].id;

    crearInfoBanner(
      peliculas[index]
    );

  }, INTERVALO);

}


// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {

  // 🔘 BOTÓN
  document.getElementById("banner-btn")
    .addEventListener("click", () => {

      if (!currentMovieId) return;

      window.location.href =
        `movie.html?id=${currentMovieId}`;

    });

  // 🎬 CARGAR
  cargarPeliculas();

});