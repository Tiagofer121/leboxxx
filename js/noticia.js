const newsContainer = document.getElementById("news-container");

// Obtener ID de la película desde la URL
const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

// API TMDB
const TMDB_API_KEY = "446e4bd3b832f95dbc4a0839a483513c";


// ======================
// TOGGLE NOTICIAS
// ======================

const newsToggle = document.querySelector(".news-toggle-container");
const newsPanel  = document.querySelector(".news-panel");
const newsBtn    = document.querySelector(".news-toggle-btn");

let newsLoaded = false;
let panelOpen  = false;

if (newsToggle) {
  newsToggle.addEventListener("click", () => {
    panelOpen = !panelOpen;

    if (panelOpen) {
      newsPanel.classList.add("open");
      newsBtn.textContent = "Ocultar noticias";
      if (!newsLoaded) {
        getMovieData();
        newsLoaded = true;
      }
    } else {
      newsPanel.classList.remove("open");
      newsBtn.textContent = "Mostrar noticias";
    }
  });
}


// ======================
// OBTENER DATOS PELÍCULA
// ======================

async function getMovieData() {

  try {

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES`
    );

    const movie = await response.json();
    const movieTitle = movie.title;

    loadNews(movieTitle);

  } catch (error) {

    console.error("Error obteniendo película:", error);

    newsContainer.innerHTML = `
      <p class="no-news">Error cargando película.</p>
    `;

  }

}


// ======================
// CARGAR NOTICIAS
// ======================

async function loadNews(movieTitle) {

  newsContainer.innerHTML = `<p class="no-news">Cargando noticias...</p>`;

  try {

    const response = await fetch(
      `/api/news?q=${encodeURIComponent(movieTitle + " pelicula")}`
    );

    const data = await response.json();

    if (!data.news_results || data.news_results.length === 0) {
      newsContainer.innerHTML = `<p class="no-news">No se encontraron noticias.</p>`;
      return;
    }

    newsContainer.innerHTML = "";

    data.news_results.forEach((article, index) => {

      const card = document.createElement("div");
      card.className = "news-card";
      card.style.animationDelay = `${index * 60}ms`;

      card.innerHTML = `
        <div class="news-image-wrap">
          <img
            class="news-image"
            src="${article.thumbnail || 'https://via.placeholder.com/80x80/140721/9b6fff?text=N'}"
            alt="${article.title}"
            onerror="this.src='https://via.placeholder.com/80x80/140721/9b6fff?text=N'"
          >
        </div>
        <div class="news-info">
          <h3 class="news-title">${article.title}</h3>
          <p class="news-description">${article.snippet || ""}</p>
          <div class="news-footer">
            <span class="news-source">${article.source || ""}</span>
            <span class="news-date">${article.date || ""}</span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openNewsReader(article);
      });

      newsContainer.appendChild(card);
    });

  } catch (error) {

    console.error("Error cargando noticias:", error);

    newsContainer.innerHTML = `<p class="no-news">Error cargando noticias.</p>`;

  }

}


// ======================
// LECTOR INTERNO DE NOTICIA
// ======================

function openNewsReader(article) {

  // Crear el reader si no existe
  let reader = document.getElementById("news-reader");

  if (!reader) {
    reader = document.createElement("div");
    reader.id = "news-reader";
    reader.className = "news-reader";
    document.body.appendChild(reader);
  }

  const thumbnail = article.thumbnail || "";
  const heroHTML  = thumbnail
    ? `<div class="news-reader-hero">
         <img src="${thumbnail}" alt="${article.title}" onerror="this.parentElement.style.display='none'">
         <div class="news-reader-hero-gradient"></div>
       </div>`
    : "";

  reader.innerHTML = `
    <div class="news-reader-header">
      <div class="news-reader-back" id="news-reader-back">&#8592;</div>
      <span class="news-reader-source-badge">${article.source || "Noticia"}</span>
    </div>

    ${heroHTML}

    <div class="news-reader-body">
      <h1 class="news-reader-title">${article.title}</h1>

      <div class="news-reader-meta">
        <span class="news-reader-meta-source">${article.source || ""}</span>
        <span class="news-reader-meta-date">${article.date || ""}</span>
      </div>

      <p class="news-reader-snippet">
        ${article.snippet || "Sin descripción disponible."}
      </p>

      <a
        href="${article.link}"
        target="_blank"
        rel="noopener noreferrer"
        class="news-reader-link-btn"
      >
        Leer nota completa &nbsp;↗
      </a>
    </div>
  `;

  // Abrir con animación
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reader.classList.add("open");
    });
  });

  // Bloquear scroll del body
  document.body.style.overflow = "hidden";

  // Botón volver
  document.getElementById("news-reader-back").addEventListener("click", closeNewsReader);
}


function closeNewsReader() {
  const reader = document.getElementById("news-reader");
  if (!reader) return;

  reader.classList.remove("open");
  document.body.style.overflow = "";
}
