
const API_KEY = "446e4bd3b832f95dbc4a0839a483513c";

const BASE_URL = "https://api.themoviedb.org/3";

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");


async function cargarCasting() {

  try {

    const res = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=es-ES`
    );

    const data = await res.json();

    const castContainer =
      document.querySelector(".cast-container");

    castContainer.innerHTML = "";


    data.cast.slice(0, 30).forEach(actor => {

      // 🎬 CARD PRINCIPAL
      const actorCard = document.createElement("div");
      actorCard.classList.add("actor-card");


      // 🖼 IMAGEN
      const img = document.createElement("img");
      img.src = actor.profile_path
        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
        : "../assets/placeholder.png";


      // 🧱 CONTENEDOR INFO
      const info = document.createElement("div");
      info.classList.add("actor-info");


      const name = document.createElement("p");
      name.textContent = actor.name;

      const character = document.createElement("span");
      character.textContent = actor.character;


      // 📦 ARMADO
      info.appendChild(name);
      info.appendChild(character);

      actorCard.appendChild(img);
      actorCard.appendChild(info);

      castContainer.appendChild(actorCard);

    });

  } catch (error) {

    console.error("Error cargando casting:", error);

  }

}


// 🚀 INIT
cargarCasting();