const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => resolve(books), 200);
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books." });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (books[isbn]) resolve(books[isbn]);
        else reject("Book not found");
      }, 200);
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on author
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = Object.values(books).filter(
        (book) => book.author === author
      );
      if (result.length > 0) resolve(result);
      else reject("No books found for the given author");
    }, 200); // Simulate async operation
  })
    .then((booksByAuthor) => res.status(200).json(booksByAuthor))
    .catch((error) => res.status(404).json({ message: error }));
});

// Get all books based on title
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const result = Object.values(books).filter(
        (book) => book.title === title
      );
      if (result.length > 0) resolve(result);
      else reject("No books found for the given title");
    }, 200); // Simulate async operation
  })
    .then((booksByTitle) => res.status(200).json(booksByTitle))
    .catch((error) => res.status(404).json({ message: error }));
});
//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn]?.reviews);
});

module.exports.general = public_users;
