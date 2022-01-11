const shop = document.querySelector("#products-container");
const cartTable = document.querySelector("#products table tbody");
const items = [];
let cartItems = [];
let itemPrices = [];

// Initialisation des frais de plateforme
const platformFees = 0.01;
// Initialisation des frais de transaction
const transactionFees = 0.012;
// Initialisation du prix avant que les frais de plateforme soit offert
const platformFeesFree = 0.2;

fetch("./assets/data/products.json")
	.then((res) => res.json())
	.then((res) => {
		res.forEach((product) => {
			// Crée et affiche le produit dans le DOM
			createProduct(product);
			// Stocke le produit dans un tableau
			items.push(product);
		});
	});

function createProduct(product) {
	// Création de la carte du produit
	const article = document.createElement("article");

	// Mise en place de l'image
	const header = document.createElement("header");
	const img = document.createElement("img");
	img.src = product.img;
	header.append(img);
	article.append(header);

	// Création de la partie avec le contenu
	const content = document.createElement("div");
	content.classList = "content";

	// Mise en place de l'ID du produit
	const productId = document.createElement("p");
	productId.classList = "product-id";
	productId.textContent = `#${product.id}`;
	content.append(productId);

	// Mise en place du nom du produit
	const productTitle = document.createElement("h3");
	productTitle.textContent = product.name;
	content.append(productTitle);

	// Mise en place du stock restant
	const stock = document.createElement("p");
	stock.classList = "stock";
	stock.setAttribute("id", `stock-${product.id}`);
	stock.innerHTML = `<span class="clock-icon"></span>${product.quantity} Restant`;
	content.append(stock);

	// Mise en place du <hr />
	const hr = document.createElement("hr");
	content.append(hr);

	// Mise en place du prix et du bouton pour ajouter au panier
	const contentButton = document.createElement("div");
	contentButton.classList = "content-button";
	const priceTitle = document.createElement("h4");
	priceTitle.innerHTML = `<span class="ethereum-icon"></span>${product.price}`;
	contentButton.append(priceTitle);
	const addToCartButton = document.createElement("button");
	addToCartButton.setAttribute("id", `add-button-${product.id}`);
	addToCartButton.setAttribute("onClick", `addToCart(${product.id})`);
	const addToCartIcon = document.createElement("i");
	addToCartIcon.classList = "shipping-cart-plus-icon";
	addToCartButton.append(addToCartIcon);
	contentButton.append(addToCartButton);
	content.append(contentButton);

	article.append(content);

	shop.appendChild(article);
}

function addToCart(product) {
	// Vérifie si le produit est déjà dans le panier
	if (cartItems.includes(items[product - 1])) {
		// Si le produit est déjà dans le panier
		updateItem(items[product - 1]);
	} else {
		// Si le produit n'est pas dans le panier
		cartItems.push(items[product - 1]);
		addItem(product);

		// const temp = JSON.parse(JSON.stringify(items[product - 1]));
		// temp.quantity = 1;
	}

	// Récupère la quantité indiqué du produit correspondant
	const quantity = document.querySelector(`#product-${product}`).value;

	updateStock(product, quantity, items[product - 1].quantity);
}

function ckeckQuantity(item, maxQuantity) {
	// Récupère l'input du produit correspondant
	const inputProduct = document.querySelector(`#product-${item}`);

	// Regarde si la valeur est suppérieur à 0 et ne dépasse pas la quantité maximale
	if (inputProduct.value > maxQuantity) {
		inputProduct.value = maxQuantity;
	} else if (inputProduct.value < 0) {
		inputProduct.value = 0;
	} else if (inputProduct.value == 0) {
		// Supprime le produit si la quantité est égale à zéro
		deleteProduct(inputProduct.parentNode.parentNode.parentNode);
	}

	// Met à jours la quantité disponible
	updateStock(item, inputProduct.value, maxQuantity);
}

function cartBubble() {
	// Bulle de notification du nombre de produit dans le panier
	let productNumber = 0;
	// Sélectionne tout les produits présents dans le panier
	const cartProduct = document.querySelectorAll("#products table tbody tr");
	// Pour chaque produit, incrémente productNumber
	cartProduct.forEach((product) => {
		const quantity = Number(product.childNodes[2].childNodes[0].childNodes[1].value);
		productNumber += quantity;
	});
	// Met à jours la bulle de notification
	const bubble = document.querySelector("#open-cart");
	bubble.setAttribute("data-product-number", productNumber);
}

function updateStock(product, quantity, maxQuantity) {
	// Met à jours la quantité disponible
	const availableStock = document.querySelector(`#stock-${product}`);
	const addToCartButton = document.querySelector(`#add-button-${product}`);

	// Si la quantité disponible est égale à 0
	if (maxQuantity - quantity == 0) {
		availableStock.classList.add("out-of-stock");
		availableStock.innerHTML = `Rupture de stock`;
		addToCartButton.style.display = "none";
	} else {
		availableStock.classList.remove("out-of-stock");
		availableStock.innerHTML = `<span class="clock-icon"></span>${maxQuantity - quantity} Restant`;
		addToCartButton.style.display = "block";
	}

	// Met à jours la bulle de notification
	cartBubble();

	// Met à jours le prix
	const productDom = document.querySelector(`#${items[product - 1].name}`);
	// Vérifie que le produit est toujours présent dans le panier et dans le DOM
	calcItemPrice(product, quantity, items[product - 1].price);
}

function updateItem(product) {
	// Récupère la quantité présente dans le panier
	const item = document.querySelector(`#product-${product.id}`);
	if (item.value < product.quantity) {
		// Si la quantité du panier est strictement inférieur à la quantité disponible
		// Incrémente la quantité de 1
		item.value++;
	}
}

function calcItemPrice(product, quantity, price) {
	// Calcul du prix
	const priceDom = document.querySelector(`#${items[product - 1].name} .price p`);

	// Met à jours le prix du produit par rapport à la quantité
	if (priceDom) {
		priceDom.innerHTML = `<span class="ethereum-icon"></span>${(
			items[product - 1].price * quantity
		).toFixed(3)}`;
	}

	const allPrices = [];
	let priceWithoutFees = 0;

	// Pour chaque produit dans le panier récupère son prix
	cartItems.forEach((item) => {
		const priceDom = document.querySelector(`#${items[item.id - 1].name} .price p`);
		allPrices.push(Number(priceDom.innerHTML.split(">")[2]));
	});

	// Calcul du prix sans les frais
	allPrices.forEach((itemPrice) => {
		priceWithoutFees += itemPrice;
	});

	// Fais une copie des frais de plateforme pour le modifier par la suite
	let platformFeesCopy = platformFees;

	// Si le prix sans les frais est supérieur ou égal prix initialisé des frais offerts
	if (priceWithoutFees >= platformFeesFree) {
		platformFeesCopy = 0;
	} else {
		platformFeesCopy = platformFees;
	}

	let finalPrice = Number(priceWithoutFees + platformFeesCopy + transactionFees);

	// Met en place les frais de plateforme, de transaction et du prix final
	const platformFeesDom = document.querySelector("#platform-fees .price");
	const transactionFeesDom = document.querySelector("#transaction-fees .price");
	const finalPriceDom = document.querySelector("#total .price");

	if (allPrices.length != 0) {
		platformFeesDom.innerHTML = `<span class="ethereum-icon"></span>${platformFeesCopy}`;
		transactionFeesDom.innerHTML = `<span class="ethereum-icon"></span>${transactionFees}`;
		finalPriceDom.innerHTML = `<span class="ethereum-icon"></span>${finalPrice.toFixed(3)}`;
	} else {
		platformFeesDom.innerHTML = `<span class="ethereum-icon"></span>0`;
		transactionFeesDom.innerHTML = `<span class="ethereum-icon"></span>0`;
		finalPriceDom.innerHTML = `<span class="ethereum-icon"></span>0`;
	}
}

function resetAll() {
	// Suppression de tout les produits du panier
	const temp = [];
	// Récupère chaque produit dans le DOM et le stock dans temp
	for (let i = 0; i < cartItems.length; i++) {
		temp.push(document.querySelector(`#${cartItems[i].name}`));
	}
	// Pour chaque produit, supprime le
	temp.forEach((product) => {
		deleteProduct(product);
	});
}

function deleteProduct(product) {
	// Suppression du produit dans le panier
	let productObject;
	let index = 0;
	// Récupère l'objet du produit
	while (productObject == null) {
		if (items[index].name == product.getAttribute("id")) {
			productObject = items[index];
		}
		index++;
	}
	// Si l'objet du produit est présent dans cartItems
	if (cartItems.indexOf(productObject) !== -1) {
		// Supprime le produit dans cartItems
		const temp = cartItems.filter(function (f) {
			return f !== productObject;
		});
		cartItems = [].concat(temp);

		// Supprime le produit dans le DOM
		product.remove();

		// Rénitialise la quantité disponible
		updateStock(productObject.id, 0, productObject.quantity);
	}
}

function addItem(product) {
	// Création du produit dans le panier
	const row = document.createElement("tr");
	row.setAttribute("id", `${items[product - 1].name}`);

	// Mise en place de l'image du produit
	const dataImg = document.createElement("td");
	dataImg.classList = "image";
	const img = document.createElement("img");
	img.src = items[product - 1].img;
	dataImg.append(img);
	row.append(dataImg);

	// Mise en place de l'ID et du nom du produit
	const dataTitle = document.createElement("td");
	dataTitle.classList = "title";
	const productId = document.createElement("p");
	productId.classList = "product-id";
	productId.textContent = `#${items[product - 1].id}`;
	dataTitle.append(productId);
	const productTitle = document.createElement("h4");
	productTitle.textContent = items[product - 1].name;
	dataTitle.append(productTitle);
	row.append(dataTitle);

	// Mise en place de la quantité du produit
	const dataNumber = document.createElement("td");
	dataNumber.classList = "number";
	const span = document.createElement("span");
	const cross = document.createElement("p");
	cross.textContent = "x";
	span.append(cross);
	const input = document.createElement("input");
	input.type = "number";
	input.value = 1;
	input.min = 0;
	input.max = items[product - 1].quantity;
	input.setAttribute(
		"oninput",
		`ckeckQuantity(${items[product - 1].id}, ${items[product - 1].quantity})`
	);
	input.setAttribute("id", `product-${items[product - 1].id}`);
	span.append(input);
	dataNumber.append(span);
	row.append(dataNumber);

	// Mise en place du bouton de suppression
	const dataDelete = document.createElement("td");
	dataDelete.classList = "delete";
	const deleteButton = document.createElement("button");
	deleteButton.setAttribute("onClick", `deleteProduct(${items[product - 1].name})`);
	const deleteIcon = document.createElement("i");
	deleteIcon.classList = "trash-icon";
	deleteButton.append(deleteIcon);
	dataDelete.append(deleteButton);
	row.append(dataDelete);

	// Mise en place du prix
	const dataPrice = document.createElement("td");
	dataPrice.classList = "price";
	const price = document.createElement("p");
	price.innerHTML = `<span class="ethereum-icon"></span>${items[product - 1].price}`;
	dataPrice.append(price);
	row.append(dataPrice);

	cartTable.append(row);
}
