const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const { SECRET_KEY } = require("../config.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username) return false;
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate a JWT token for the user
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  return res.status(200).json({ message: "Login successful.", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  // Check if the user is authenticated (username in the session)
  const username = req.user?.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or modify the review for the book
  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Check if the user is authenticated (username in the session)
  const username = req.user?.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user's review exists
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user." });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
