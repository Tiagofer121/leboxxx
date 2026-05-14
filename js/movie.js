
// 🔥 FIREBASE

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


// 🔍 OBTENER ID
function obtenerId() {

  const params =
    new URLSearchParams(window.location.search);

  return params.get("id");

}


// 🎬 CONFIG TMDB
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";
const BASE_URL =
  "https://api.themoviedb.org/3";


// 🎬 MOVIE ACTUAL
let currentMovie = null;


// 🎬 TRAILER
let trailerKey = null;


// ⭐ RATING SELECCIONADO
let selectedRating = 0;


// 🎬 MOVIE ID
const movieId = obtenerId();


// 🎬 CARGAR PELÍCULA
async function cargarPelicula(id) {

  try {

    // 🎬 DATOS
    const resMovie = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=es-ES`
    );

    const movie =
      await resMovie.json();

    // 🎭 CRÉDITOS
    const resCredits = await fetch(
      `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );

    const credits =
      await resCredits.json();

    // 🎥 VIDEOS
    const resVideos = await fetch(
      `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`
    );

    const videos =
      await resVideos.json();

    // 🎬 GUARDAR MOVIE
    currentMovie = movie;

    // 🎬 TRAILER
    const trailer =
      videos.results.find(
        v =>
          v.type === "Trailer" &&
          v.site === "YouTube"
      );

    const trailerDiv =
      document.querySelector(".trailer");

    if (trailer) {

      trailerKey = trailer.key;

    } else {

      trailerDiv.remove();

    }

    // 🧱 MOSTRAR
    mostrarPelicula(movie, credits);

  } catch (error) {

    console.error(error);

  }

}


// 🧱 MOSTRAR PELÍCULA
function mostrarPelicula(movie, credits) {

  // 🎯 ELEMENTOS
  const title =
    document.getElementById("movie-title");

  const poster =
    document.getElementById("movie-poster");

  const banner =
    document.getElementById("movie-banner");

  const overview =
    document.getElementById("movie-overview");

  const year =
    document.getElementById("movie-year");

  const directorEl =
    document.getElementById("movie-director");

  const genresEl =
    document.getElementById("movie-genres");

  const ratingEl =
    document.getElementById("rating-span");


  // 🎬 INFO
  title.textContent =
    movie.title;

  overview.textContent =
    movie.overview;

  poster.src =
    `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  banner.src =
    `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;


  // 📅 AÑO
  const yearText =
    movie.release_date
      ? movie.release_date.split("-")[0]
      : "—";

  year.textContent =
    yearText;


  // 🎬 DIRECTOR
  const director =
    credits.crew.find(
      p => p.job === "Director"
    );

  directorEl.textContent =
    director
      ? director.name
      : "—";


  // 🏷️ GÉNEROS
  genresEl.innerHTML = "";

  movie.genres.forEach(g => {

    const p =
      document.createElement("p");

    p.textContent =
      g.name;

    genresEl.appendChild(p);

  });


  // ⭐ RATING TMDB
  ratingEl.textContent =
    `   ${movie.vote_average.toFixed(1)}/10`;


    hideLoader();
}


// ⏱ TIEMPO RELATIVO
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


// 💬 CARGAR POSTS
function cargarPosts() {

  // 📦 CONTENEDOR
  const postsContainer =
    document.querySelector(
      ".community-posts"
    );

  // 📚 COLLECTION
  const postsRef =
    collection(db, "posts");

  // 🎬 QUERY — sin where para atrapar tanto string como número
  const q = query(postsRef, orderBy("fecha", "desc"));

  // 🔥 TIEMPO REAL
  onSnapshot(q, (snapshot) => {

    // 🧹 LIMPIAR
    postsContainer.innerHTML = "";

    // 🎯 FILTRAR — compara como string para cubrir movieId guardado como número o string
    const docs = snapshot.docs.filter(doc =>
      String(doc.data().movieId) === String(movieId)
    );

    if (docs.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-posts">
          <p class="empty-icon">🎬</p>
          <p class="empty-text">Todavía no hay posts para esta película.<br>¡Sé el primero en opinar!</p>
        </div>
      `;
      return;
    }

    // 🔁 POSTS
    docs.forEach((doc, idx) => {

      const post = doc.data();

      // ⏱ TIEMPO
      const tiempoTexto = tiempoRelativo(post.fecha);

      // ⭐ ESTRELLAS
      let starsHTML = "";
      for (let i = 1; i <= 7; i++) {
        starsHTML += `<span class="${i <= (post.rating || 0) ? "star-filled" : "star-empty"}">★</span>`;
      }

      // 🏷️ SPOILER BADGE
      const spoilerBadge = post.spoiler
        ? `<span class="spoiler-tag">⚠ Spoiler</span>` : "";

      // 🎬 MOVIE PILL — solo visual, sin link
      const moviePill = post.moviePoster
        ? `<div class="movie-pill movie-pill--static">
            <img src="https://image.tmdb.org/t/p/w92${post.moviePoster}" alt="${post.movieTitle}">
            <div class="pill-info">
              <p class="pill-label">Película</p>
              <p class="pill-title">${post.movieTitle}</p>
            </div>
           </div>` : "";

      // ⭐ RATING BADGE
      const ratingBadge = post.rating > 0
        ? `<div class="post-rating-badge">
             <span class="post-rating-num">${post.rating}</span>
             <span class="post-rating-max">/7</span>
           </div>` : "";

      // 👁 TEXTO / SPOILER
      const textoDisplay = post.spoiler ? "⚠ Tocar para revelar el spoiler" : post.texto;
      const spoilerClass = post.spoiler ? "is-spoiler" : "";

      // 🧱 POST
      const postDiv = document.createElement("div");
      postDiv.classList.add("post");
      postDiv.style.animationDelay = `${idx * 35}ms`;

      postDiv.innerHTML = `
        <div class="post-header">
          <div class="post-avatar">${post.user?.charAt(0).toUpperCase() || "?"}</div>
          <div class="post-meta">
            <p class="post-user">@${post.user} ${spoilerBadge}</p>
            <p class="post-fecha">${tiempoTexto}</p>
          </div>
          ${ratingBadge}
        </div>
        ${moviePill}
        <div class="post-stars">${starsHTML}</div>
        <p class="post-text ${spoilerClass}">${textoDisplay}</p>
      `;

      // 👁 REVELAR SPOILER
      if (post.spoiler) {
        const textEl = postDiv.querySelector(".post-text");
        textEl.addEventListener("click", () => {
          textEl.textContent = post.texto;
          textEl.classList.remove("is-spoiler");
        });
      }

      // ➕ AGREGAR
      postsContainer.appendChild(postDiv);

    });

  });

}


// 🚀 INIT
document.addEventListener(
  "DOMContentLoaded",
  () => {

    showLoader();


    // ❌ SIN ID
    if (!movieId) return;

    // 🎬 CARGAR MOVIE
    cargarPelicula(movieId);

    // 💬 CARGAR POSTS
    cargarPosts();


    // 🎥 TRAILER
    const trailerBtn =
      document.getElementById(
        "trailer-btn"
      );

    trailerBtn.addEventListener(
      "click",
      () => {

        if (!trailerKey) return;

        const container =
          document.getElementById(
            "trailer-container"
          );

        // 🧹 LIMPIAR
        container.innerHTML = "";

        // 🎬 IFRAME
        const iframe =
          document.createElement(
            "iframe"
          );

        iframe.src =
          `https://www.youtube.com/embed/${trailerKey}`;

        iframe.width = "100%";

        iframe.height = "400";

        iframe.allowFullscreen =
          true;

        // ➕ AGREGAR
        container.appendChild(
          iframe
        );

      }
    );


    // 📖 DESCRIPCIÓN
    const descripcion =
      document.querySelector(
        ".descripcion"
      );

    let abierta = false;

    descripcion.addEventListener(
      "click",
      () => {

        if (!abierta) {

          descripcion.style.maxHeight =
            descripcion.scrollHeight +
            "px";

          abierta = true;

        } else {

          descripcion.style.maxHeight =
            "80px";

          abierta = false;

        }

      }
    );


    // 🎞️ TABS
    const buttons =
      document.querySelectorAll(
        ".tab-btn"
      );

    const pages =
      document.querySelectorAll(
        ".tab-page"
      );

    // 🚀 EVENTOS
    buttons.forEach(
      (btn, index) => {

        btn.addEventListener(
          "click",
          () => {

            // 👁 OCULTAR TODAS
            pages.forEach(p => {
              p.style.display = "none";
            });

            // 👁 MOSTRAR ACTIVA
            pages[index].style.display = "block";

            // ❌ REMOVE ACTIVE
            buttons.forEach(b => {
              b.classList.remove(
                "active"
              );
            });

            // ✅ ACTIVE
            btn.classList.add(
              "active"
            );

          }
        );

      }
    );


    // ⭐ ESTRELLAS
    const stars =
      document.querySelectorAll(
        ".star"
      );

    stars.forEach(star => {

      star.addEventListener(
        "click",
        () => {

          // ⭐ VALOR
          selectedRating =
            Number(
              star.dataset.value
            );

          // ❌ LIMPIAR
          stars.forEach(s => {
            s.classList.remove(
              "active"
            );
          });

          // ✅ ACTIVAR
          stars.forEach(s => {

            if (
              Number(
                s.dataset.value
              ) <= selectedRating
            ) {

              s.classList.add(
                "active"
              );

            }

          });

        }
      );

    });


    // 💬 PUBLICAR
    const publishBtn =
      document.getElementById(
        "publish-post-btn"
      );

    const postText =
      document.getElementById(
        "post-text"
      );

    publishBtn.addEventListener(
      "click",
      async () => {

        // ✍️ TEXTO
        const texto =
          postText.value.trim();

        // ❌ VALIDACIONES
        if (!texto) return;

        if (selectedRating === 0) {
          // 🌟 SHAKE en las estrellas para avisar
          const starsContainer = document.querySelector(".stars-container");
          starsContainer.classList.add("shake");
          setTimeout(() => starsContainer.classList.remove("shake"), 500);
          return;
        }

        try {

          // 👤 USER
          const username =
            localStorage.getItem(
              "username"
            );

          // 🚀 FIREBASE
          await addDoc(
            collection(db, "posts"),
            {

              texto: texto,

              rating: selectedRating,

              spoiler: isSpoiler,

              user: username,

              movieId: movieId,

              movieTitle: currentMovie.title,

              moviePoster: currentMovie.poster_path,

              fecha: Date.now()

            }
          );

          // 🧹 LIMPIAR
          postText.value = "";

          selectedRating = 0;

          stars.forEach(s => {
            s.classList.remove(
              "active"
            );
          });

          console.log(
            "Post publicado"
          );

        } catch (error) {

          console.error(error);

        }

      }
    );

  }
);

// ⚠ SPOILER
const spoilerBtn =
  document.getElementById("spoiler-btn");

let isSpoiler = false;


// 🚀 CLICK
spoilerBtn.addEventListener("click", () => {

  // 🔄 CAMBIAR ESTADO
  isSpoiler = !isSpoiler;

  // 🎨 ACTIVE
  spoilerBtn.classList.toggle("activo-boton-spoiler");

});