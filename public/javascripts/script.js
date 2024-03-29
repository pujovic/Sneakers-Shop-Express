"use strict";

//assigning dom elemets to variables
const cartBtn = document.getElementById("cart");
const hamburgerBtn = document.getElementById("hamburger-btn");

const cartDiv = document.getElementById("cart-div");
const discount = document.getElementById("discount");
const oldPrice = document.getElementById("old-price");
const cartItemsDiv = document.querySelector(".cart-down");
const cartItem = document.querySelector(".cart-item");
const hamburgerMenu = document.getElementById("hamburger-menu");
const productSection = document.querySelector(".main-product-section");
const productName = document.getElementById("product-name");
const productPageDOM = document.querySelector(".right-div");
const productDiv = document.querySelectorAll("#product");
const imageDiv = document.querySelector(".left-div");
const thumbnailsDiv = document.querySelector(".thumbnails");
const productImage = document.getElementById("product-image");
const cartTotalDOM = document.getElementById("cart-total");
const itemsTotalDOM = document.getElementById("items-total");
const cartAmountIcon = document.querySelector(".cart-items");
const checkoutItems = document.getElementById("checkout-items");
const searchBtn = document.getElementById("search-button");
const searchBtnHam = document.getElementById("search-button-ham");

const url = document.URL;
let deleteItemBtn = [];
let selectedSize = null;

//setup cart and populate it on page reload
let cart = [];
if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
}

//cart button functionality
cartDiv.style.visibility = "hidden";
cartBtn.onclick = function () {
  if (cartDiv.style.visibility === "hidden") {
    hamburgerMenu.style.visibility = "hidden";
    cartDiv.style.visibility = "visible";
  } else {
    cartDiv.style.visibility = "hidden";
  }
};

//hamburger button functionality
hamburgerMenu.style.visibility = "hidden";
hamburgerBtn.onclick = function () {
  if (hamburgerMenu.style.visibility === "hidden") {
    cartDiv.style.visibility = "hidden";
    hamburgerMenu.style.visibility = "visible";
  } else {
    hamburgerMenu.style.visibility = "hidden";
  }
};

//contact page submit message
const contactForm = document.getElementById("form-send-message-contact");
const contactDialog = document.getElementById("contact-dialog");
if (contactForm) {
  const timeStamp = new Date(Date.now()).toLocaleString();
  const name = document.getElementById("input-name-contact");
  const email = document.getElementById("input-email-contact");
  const subject = document.getElementById("input-subject-contact");
  const message = document.getElementById("input-message-contact");
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let contactData = {
      name: name.value,
      email: email.value,
      subject: subject.value,
      message: message.value,
      timeStamp: timeStamp,
    };
    fetch("/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    })
      .then(function (response) {
        if (response.ok) {
          name.value = "";
          email.value = "";
          subject.value = "";
          message.value = "";
          return response.json();
        }
        return Promise.reject(response);
      })
      .then(function (data) {
        contactDialog.showModal();
        console.log(data);
      })
      .catch(function (error) {
        console.warn("Something went wrong.", error);
      });
  });
}

//checkout page - place order
const orderForm = document.getElementById("place-order-form");
const checkoutDialog = document.getElementById("checkout-dialog");
const checkoutDialogOkBtn = document.getElementById("checkout-ok");
if (orderForm) {
  const checkoutTime = new Date(Date.now()).toLocaleString();
  const checkoutFname = document.getElementById("input-fname-checkout");
  const checkoutLname = document.getElementById("input-lname-checkout");
  const checkoutEmail = document.getElementById("input-email-checkout");
  const checkoutPhone = document.getElementById("input-telephone-checkout");
  const checkoutMessage = document.getElementById("input-message-checkout");
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let orderData = {
      firstName: checkoutFname.value,
      lastName: checkoutLname.value,
      email: checkoutEmail.value,
      phone: checkoutPhone.value,
      message: checkoutMessage.value,
      checkoutTime: checkoutTime,
      items: cart,
    };

    if (cart.length === 0) return;

    fetch("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then(function (data) {
        console.log(data);
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        checkoutDialog.showModal();
        checkoutDialogOkBtn.addEventListener("click", (e) => {
          event.preventDefault();
          location.reload();
        });
      })
      .catch(function (error) {
        console.warn("Something went wrong.", error);
      });
  });
}

//getting the products from database
class Products {
  async getProducts() {
    try {
      const response = await fetch("/product-data.json");
      if (!response.ok) {
        throw new Error("Something went wrong!");
      }
      const data = await response.json();

      const productsW = data.women.map((item) => {
        const {
          id,
          name,
          price,
          description,
          hasDiscount,
          discount,
          images,
          tag = "women",
        } = item;

        return {
          name,
          price,
          id,
          description,
          images,
          discount,
          hasDiscount,
          tag,
        };
      });

      const productsM = data.men.map((item) => {
        const {
          id,
          name,
          price,
          description,
          hasDiscount,
          discount,
          images,
          tag = "men",
        } = item;

        return {
          name,
          price,
          id,
          description,
          discount,
          images,
          hasDiscount,
          tag,
        };
      });

      const products = productsW.concat(productsM);
      return products;
    } catch (error) {
      return { error: error, message: "Database error!" };
    }
  }

  async getSingleProduct(id) {
    try {
      let singleProduct;
      const products = await this.getProducts();
      products.forEach((product) => {
        if (product.id === +id) {
          singleProduct = product;
        }
      });
      return singleProduct;
    } catch (error) {
      throw new Error("Product id error!");
    }
  }

  async searchProducts(searchQuery) {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      return;
    }
    try {
      let searchResults = [];
      const products = await this.getProducts();

      products.forEach((product) => {
        const productName = product.name.toLowerCase();
        const searchName = searchQuery.toLowerCase();
        if (productName.match(searchName)) {
          searchResults.push(product);
        }
      });
      sessionStorage.setItem("searchResults", JSON.stringify(searchResults));
      window.location.href = "/search-results";
    } catch (error) {
      throw new Error("Product search error!");
    }
  }
}

//class for rendering elements
class UI {
  //render men/women products page
  displayProducts(products, tag) {
    let result = "";
    let discountArr = [];

    if (products.error) {
      productSection.innerHTML = `<h1>${products.message}</h1>`;
    }

    products.forEach((product) => {
      let price;
      let discountVis;
      if (product.tag === tag || tag === "search") {
        if (product.hasDiscount) {
          price = (1 - product.discount / 100) * product.price;
          discountVis = "visible";
          discountArr.push({ id: product.id, price: price, vis: discountVis });
        } else {
          price = product.price;
          discountVis = "hidden";
          discountArr.push({ id: product.id, price: price, vis: discountVis });
        }
        result += `
            <div id="product" data-id="${product.id}">
              <a href="${"/" + product.id}">
                <img
                  id="product-image"
                  src=${product.images}?q=10&fit=pad
                  alt="Sneaker image"
                />
              </a>
              <p id="name">${product.name}</p>
              <div id="price-and-discount">
                <span id="price">$</span>
                <span id="discount">${product.discount}%</span>
              </div>
              <p id="old-price">$${product.price}</p>
            </div>
            `;
      }
    });
    if (result) {
      productSection.innerHTML = result;
      const productDivArr = document.querySelectorAll("#product");
      productDivArr.forEach((product) => {
        const priceDiscountChildren = product.children["price-and-discount"];
        discountArr.forEach((element) => {
          if (+product.dataset.id === element.id) {
            priceDiscountChildren.children["price"].innerText += element.price;
            priceDiscountChildren.children["discount"].style.visibility =
              element.vis;
            product.children["old-price"].style.visibility = element.vis;
          }
        });
      });
    }
  }
  //render single product page
  displaySingleProduct(entry) {
    let productPage;
    let images;
    let price;
    let discountVis;
    let sizes;

    if (!entry) {
      document.querySelector(
        "main"
      ).innerHTML = `<h1>Sorry, cannot find any product with this id.</h1>`;
    }

    //calculating price and assigning visibility property
    if (entry.hasDiscount) {
      price = (1 - entry.discount / 100) * entry.price;
      discountVis = "visible";
    } else {
      price = entry.price;
      discountVis = "hidden";
    }

    productPage = `
            <h3>Sneaker Company</h3>
            <h1 id="product-name">${entry.name}</h1>
            <p id="product-discription">${entry.description}</p>

            <div class="price-div">
              <p id="price">$${price}</p>
              <p id="discount" >${entry.discount}%</p>
            </div>
            <p id="old-price">$${entry.price}</p>
            
            <p id="size-p">Size:</p>
            <div id="sizes">${sizes}</div>

            <div class="button-section">
              <div id="amount-div">
                <button id="minus">-</button>
                <p id="amount">1</p>
                <button id="plus">+</button>
              </div>
              <button id="add-to-cart" data-id="${productPageDOM.id}">
                <img src="../images/icon-cart.svg" alt="cart-button-icon"/>
                Add to cart
              </button>
            </div>`;
    images = `
            <a id="product-image-link" href=${
              entry.images
            }?fit=pad data-lightbox="roadtrip">
              <img id="product-image" src=${
                entry.images
              }?fit=pad alt="Product picture" />
            </a>
            <a href=${
              entry.images.slice(0, -1) + "2"
            }?fit=pad data-lightbox="roadtrip" ></a>
            <a href=${
              entry.images.slice(0, -1) + "3"
            }?fit=pad data-lightbox="roadtrip" ></a>
            <a href=${
              entry.images.slice(0, -1) + "4"
            }?fit=pad data-lightbox="roadtrip" ></a>
            
            <div class="thumbnails">
              <img id="product1" src=${
                entry.images
              }?&fit=pad&q=10  alt="Product picture" />
              <img id="product2" src=${
                entry.images.slice(0, -1) + "2"
              }?&fit=pad&q=10  alt="Product picture" />
              <img id="product3" src=${
                entry.images.slice(0, -1) + "3"
              }?&fit=pad&q=10  alt="Product picture" />
              <img id="product4" src=${
                entry.images.slice(0, -1) + "4"
              }?&fit=pad&q=10  alt="Product picture" />
            </div>`;
    productPageDOM.innerHTML = productPage;
    imageDiv.innerHTML = images;
    //setting visibility of discount and price before discount elements
    document.querySelector("#discount").style.visibility = discountVis;
    document.querySelector("#old-price").style.visibility = discountVis;
    //image switching function
    document.querySelector(".thumbnails").addEventListener("click", (event) => {
      let mainImage = document.getElementById("product-image");
      mainImage.src = event.target.src.slice(0, event.target.src.length - 5);
    });
    //setting sneaker sizes based od gender
    if (entry.tag === "women") {
      document.querySelector("#sizes").innerHTML = `
      <p class="size">35</p>
      <p class="size">36</p>
      <p class="size">37</p>
      <p class="size">38</p>
      <p class="size">39</p>
      <p class="size">40</p>
      <p class="size">41</p>`;
    } else {
      document.querySelector("#sizes").innerHTML = `
      <p class="size">40</p>
      <p class="size">41</p>
      <p class="size">42</p>
      <p class="size">43</p>
      <p class="size">44</p>
      <p class="size">45</p>
      <p class="size">46</p>`;
    }
  }

  //render cart
  displayCart(cart) {
    cart.forEach((cartItem) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
                <a href="${cartItem.url}">
                    <img src=${cartItem.image} alt="Product picture" />
                </a>
                <div id="cart-item-info">
                    <h5 id="cart-item-title">${cartItem.title}</h5>
                    <span id="cart-item-size">Size:${cartItem.size}</span>
                    <span id="quantity-item">Quantity: ${cartItem.amount}</span>
                    <p id="price-item" class="total-item">Price: $${cartItem.price}</p>
                </div>
                <img id="delete-item-btn" src="../images/icon-delete.svg" alt="delete" data-id=${cartItem.cartId} />`;
      cartItemsDiv.appendChild(div);
    });
  }
  //update cart values
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotalDOM.innerText = "Total: $" + tempTotal;
    itemsTotalDOM.innerText = "Items in cart: " + itemsTotal;
    cartAmountIcon.innerText = itemsTotal;
  }
  //get delete product buttons and add functionality
  getDeleteBtns(cart) {
    deleteItemBtn = [...document.querySelectorAll("#delete-item-btn")];
    deleteItemBtn.forEach((button) => {
      let id = button.dataset.id;
      button.addEventListener("click", (event) => {
        cart = cart.filter((item) => item.cartId !== id);
        localStorage.setItem("cart", JSON.stringify(cart));
        while (cartItemsDiv.hasChildNodes()) {
          cartItemsDiv.removeChild(cartItemsDiv.firstChild);
        }
        this.displayCart(cart);
        this.setCartValues(cart);
        this.getDeleteBtns(cart);
      });
    });
  }

  //render checkout page
  displayCheckout(cart) {
    let subtotal = 0;
    let shipping = cart.length === 0 ? 0 : 10;
    cart.forEach((cartItem) => {
      subtotal += cartItem.price;
      const div = document.createElement("div");
      div.classList.add("checkout-item");
      div.innerHTML = `
                <a href="${cartItem.url}">
                    <img src=${cartItem.image} alt="Product picture" />
                </a>
                <div id="checkout-item-info">
                    <p id="checkout-item-title">${cartItem.title}</p>
                    <span id="checkout-item-size">Size: ${cartItem.size}</span>
                    <span id="checkout-item-quant">Quantity: ${cartItem.amount}</span>
                    <span id="checkout-item-price">Price: $${cartItem.price}</span>
                    <p id="remove-item" data-id=${cartItem.cartId}>Remove item</p>
                </div>`;
      checkoutItems.appendChild(div);
      const id = cartItem.cartId;
      const removeItem = checkoutItems.querySelector(`[data-id="${id}"]`);
      removeItem.addEventListener("click", (event) => {
        cart = cart.filter((item) => item.cartId !== id);
        localStorage.setItem("cart", JSON.stringify(cart));
        while (cartItemsDiv.hasChildNodes()) {
          cartItemsDiv.removeChild(cartItemsDiv.firstChild);
          checkoutItems.removeChild(checkoutItems.firstChild);
        }
        this.displayCart(cart);
        this.setCartValues(cart);
        this.getDeleteBtns(cart);
        this.displayCheckout(cart);
      });
    });
    document.getElementById(
      "checkout-subtotal"
    ).innerHTML = `<strong>SUBTOTAL: </strong>$${subtotal}`;
    document.getElementById(
      "checkout-shipping"
    ).innerHTML = `<strong>SHIPPING: </strong>$${shipping}`;
    document.getElementById(
      "checkout-total"
    ).innerHTML = `<strong>TOTAL: </strong>$${subtotal + shipping}`;
  }
}

const ui = new UI();
const products = new Products();

//render men page if products have tag "men"
if (document.title === "Sneakers Shop - Men") {
  products
    .getProducts()
    .then((products) => ui.displayProducts(products, "men"));
}

//render women page if products have tag "women"
if (document.title === "Sneakers Shop - Women") {
  products
    .getProducts()
    .then((products) => ui.displayProducts(products, "women"));
}

//render individual product page
if (document.title === "Sneakers Shop - Product") {
  products
    .getSingleProduct(productPageDOM.id)
    .then((product) => ui.displaySingleProduct(product));
}

//search functionality
const searchInput = document.querySelector("#search");
const searchInputHam = document.querySelector("#search-input-ham");
searchBtn.addEventListener("click", () => {
  products.searchProducts(searchInput.value);
});
searchBtnHam.addEventListener("click", () => {
  products.searchProducts(searchInputHam.value);
});

//render search results page
if (document.title === "Sneakers Shop - Search") {
  const products = JSON.parse(sessionStorage.getItem("searchResults"));
  ui.displayProducts(products, "search");
}

//render cart
ui.displayCart(cart);
ui.setCartValues(cart);
ui.getDeleteBtns(cart);

//render checkout page
if (document.title === "Sneakers Shop - Checkout") {
  ui.displayCheckout(cart);
}

//adding event listeners to buttons after the elements have been loaded
waitForElm("#add-to-cart").then(() => {
  const addToCartBtn = document.getElementById("add-to-cart");
  const plusBtn = document.getElementById("plus");
  const minusBtn = document.getElementById("minus");
  const amountStr = document.getElementById("amount");
  const id = productPageDOM.id;
  let amountInt = parseInt(amountStr.innerText);
  const size = [...document.querySelectorAll(".size")];
  let sizeP = document.getElementById("size-p");

  size.forEach((button) => {
    button.addEventListener("click", (event) => {
      sizeP.style.color = "black";
      sizeP.innerText = "Size:";
      if (event.target.style.color != "white" && selectedSize == null) {
        event.target.style.backgroundColor = "black";
        event.target.style.color = "white";
        selectedSize = event.target.innerText;
      } else if (event.target.style.color === "white") {
        event.target.style.backgroundColor = "white";
        event.target.style.color = "black";
        selectedSize = null;
      }
    });
  });

  minusBtn.addEventListener("click", () => {
    if (amountInt > 1) {
      amountInt--;
      amountStr.innerText = amountInt;
    }
  });
  plusBtn.addEventListener("click", () => {
    amountInt++;
    amountStr.innerText = amountInt;
  });
  addToCartBtn.addEventListener("click", () => {
    if (JSON.parse(localStorage.getItem("cart"))) {
      cart = JSON.parse(localStorage.getItem("cart"));
    }
    if (cart.find((item) => item.cartId === id + selectedSize)) {
      let index = cart.findIndex((item) => item.cartId === id + selectedSize);
      cart[index].amount += amountInt;
      localStorage.setItem("cart", JSON.stringify(cart));
    } else if (selectedSize) {
      let cartItem = {
        id: id,
        amount: amountInt,
        price: parseInt(document.getElementById("price").innerText.slice(1)),
        title: document.getElementById("product-name").innerText,
        image: document.getElementById("product1").src,
        size: selectedSize,
        url: document.URL,
        cartId: id + selectedSize,
      };
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      sizeP.style.color = "red";
      sizeP.innerText = "Please select a size";
    }
    while (cartItemsDiv.hasChildNodes()) {
      cartItemsDiv.removeChild(cartItemsDiv.firstChild);
    }
    ui.displayCart(cart);
    ui.setCartValues(cart);
    ui.getDeleteBtns(cart);
    selectedSize = null;
    size.forEach((button) => {
      button.style.backgroundColor = "white";
      button.style.color = "black";
    });
  });
});

//waiting for last DOM element to load function
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
