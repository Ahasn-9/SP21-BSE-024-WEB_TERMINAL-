const express = require("express");
const mongoose = require("mongoose");
const { Book, Author } = require("../models/base_schema");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, author, isbn, availableCopies, borrowCount } = req.body;

    const authorExists = await Author.findById(author);
    if (!authorExists) {
      return res.status(400).json({ error: "Author not found" });
    }

    const bookCount = await Book.countDocuments({ author: author });
    if (bookCount >= 5) {
      return res.status(400).json({
        error: "An author can only be linked to up to 5 books at a time.",
      });
    }

    const newBook = new Book({
      title,
      author,
      isbn,
      availableCopies,
      borrowCount,
    });

    await newBook.save();
    res
      .status(201)
      .json({ message: "Book created successfully", book: newBook });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await Book.find().populate("author", "name email");
    res.status(200).json(books);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, author, isbn, availableCopies, borrowCount } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, availableCopies, borrowCount },
      { new: true }
    ).populate("author", "name email");

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
