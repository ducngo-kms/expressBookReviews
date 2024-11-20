const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const { SECRET_KEY } = require("./config.js");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: SECRET_KEY,
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token after "Bearer"
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send("Invalid token");
      } else {
        req.user = decoded; // Attach decoded user to the request
        next(); // Allow the request to proceed
      }
    });
  } else {
    return res.status(401).send("Token missing");
  }
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
