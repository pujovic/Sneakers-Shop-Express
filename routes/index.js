var express = require("express");
var router = express.Router();
var crypto = require("crypto");
const { findSourceMap } = require("module");
const nodeMailer = require("nodemailer");
const { getMaxListeners } = require("process");

/* GET Home page. */
router.get("/", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("index", { title: "Sneakers Shop - Home", nonce: nonce });
});
/* GET Man page. */
router.get("/men", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("men", { title: "Sneakers Shop - Men", nonce: nonce });
});
/* GET Women page. */
router.get("/women", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("women", { title: "Sneakers Shop - Women", nonce: nonce });
});
/* GET About page. */
router.get("/about", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("about", { title: "Sneakers Shop - About", nonce: nonce });
});
/* GET Contact page. */
router.get("/contact", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("contact", { title: "Sneakers Shop - Contact", nonce: nonce });
});
/* GET Profile page. */
router.get("/profile", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("profile", { title: "Sneakers Shop - Profile", nonce: nonce });
});
/* GET Checkout page. */
router.get("/checkout", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("checkout", { title: "Sneakers Shop - Checkout", nonce: nonce });
});
/* GET Single product. */
router.get("/men/:id", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("single-product", {
    output: req.params.id,
    title: "Sneakers Shop - Product",
    nonce: nonce,
  });
});
router.get("/women/:id", function (req, res, next) {
  // Set the strict nonce-based CSP response header
  const nonce = csp(res);
  res.render("single-product", {
    output: req.params.id,
    title: "Sneakers Shop - Product",
    nonce: nonce,
  });
});

/* Order form */
router.post("/checkout", function (req, res) {
  console.log(req.body);
  res.status(201).send(req.body);
});

/* Contact form */
router.post("/contact", function (req, res) {
  console.log(req.body);
  res.status(201).send(req.body);
  //res.sendStatus(200);
  // Sending e-mail with contact form data
  // const transporter = new nodeMailer.createTransport({
  //   host: "your-host-url",
  //   auth: {
  //     user: "info@sneakercompany.com",
  //     pass: "insert-password",
  //   },
  // });
  // const mailOptions = {
  //   from: req.body.email,
  //   to: "info@sneakercompany.com",
  //   subject: req.body.subject,
  //   text: req.body.message,
  // };
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //     res.send("error");
  //   } else {
  //     console.log("Email sent: ", info.response);
  //     res.send("success");
  //   }
  // });
});

//Content-Security-Policy function
function csp(res) {
  // Generate a new random nonce value for every response.
  const nonce = crypto.randomBytes(16).toString("base64");
  // Set the strict nonce-based CSP response header
  const csp = `script-src 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'; object-src 'none'; base-uri 'none'; style-src 'nonce-${nonce}'`;
  res.set("Content-Security-Policy", csp);
  return nonce;
}

module.exports = router;
