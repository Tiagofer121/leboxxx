
window.showLoader = function () {

  document
    .getElementById("loader")
    .classList.remove("hide-loader");

};

window.hideLoader = function () {

  const loader =
    document.getElementById("loader");

  loader.classList.add("hide-loader");

  setTimeout(() => {

    loader.style.display = "none";

  }, 300);

};