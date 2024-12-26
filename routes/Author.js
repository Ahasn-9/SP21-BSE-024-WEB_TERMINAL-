const express = require("express");
const mongoose = require("mongoose");
const { Author, Book } = require("../models/base_schema");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    const newAuthor = new Author({ name, email, phoneNumber });
    await newAuthor.save();

    res
      .status(201)
      .json({ message: "Author added successfully", author: newAuthor });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding author", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      { name, email, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    res
      .status(200)
      .json({ message: "Author updated successfully", author: updatedAuthor });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating author", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const bookCount = await Book.countDocuments({ author: id });

    if (bookCount > 0) {
      return res.status(400).json({
        message: `Cannot delete author. Author is linked to ${bookCount} books.`,
      });
    }

    const deletedAuthor = await Author.findByIdAndDelete(id);

    if (!deletedAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    res
      .status(200)
      .json({ message: "Author deleted successfully", author: deletedAuthor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting author", error: error.message });
  }
});

router.get("/overbooked", async (req, res) => {
  try {
    const authors = await Author.find({
      "books.5": { $exists: true },
    }).populate("books");
    if (authors.length === 0) {
      return res
        .status(404)
        .json({ message: "No authors found with more than 5 books." });
    }

    res.status(200).json(authors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
