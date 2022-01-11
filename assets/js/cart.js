const openButton = document.querySelector("#open-cart");
const closeButton = document.querySelector("#close-cart");
const cart = document.querySelector("#cart");

openButton.addEventListener("click", () => {
	cart.classList.toggle("is-active");
});

closeButton.addEventListener("click", () => {
	cart.classList.toggle("is-active");
});
