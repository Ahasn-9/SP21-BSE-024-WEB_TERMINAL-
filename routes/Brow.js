const express = require("express");
const { Borrower, Book } = require("../models/base_schema");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { borrowerId, borrowedBooks, name, membershipType } = req.body;

    let borrower;

    if (borrowerId) {
      borrower = await Borrower.findById(borrowerId);
      if (!borrower) {
        return res.status(404).json({ error: "Borrower not found." });
      }
    } else {
      borrower = new Borrower({
        name,
        membershipType,
        borrowedBooks: [],
      });
    }

    const borrowedBooksCount =
      borrower.borrowedBooks.length + borrowedBooks.length;

    if (borrower.membershipType === "Standard" && borrowedBooksCount > 5) {
      return res.status(400).json({
        error: "Standard members can borrow up to 5 books at a time.",
      });
    }

    if (borrower.membershipType === "Premium" && borrowedBooksCount > 10) {
      return res.status(400).json({
        error: "Premium members can borrow up to 10 books at a time.",
      });
    }

    for (let bookId of borrowedBooks) {
      const book = await Book.findById(bookId);
      if (!book) {
        return res
          .status(404)
          .json({ error: `Book with ID ${bookId} not found` });
      }

      if (book.copiesAvailable <= 0) {
        return res
          .status(400)
          .json({ error: `No available copies of the book: ${book.title}` });
      }

      book.copiesAvailable -= 1;
      await book.save();
    }

    borrower.borrowedBooks.push(...borrowedBooks);
    await borrower.save();

    res.status(200).json(borrower);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const borrowerId = req.params.id;
    const updatedData = req.body;

    const borrower = await updateBorrower(borrowerId, updatedData);
    res.json(borrower);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

async function updateBorrower(borrowerId, updatedData) {
  try {
    const borrower = await Borrower.findById(borrowerId);
    if (!borrower) {
      throw new Error("Borrower not found");
    }

    const updatedBorrowedBooksCount = updatedData.borrowedBooks.length;

    if (
      updatedData.membershipType === "Standard" &&
      updatedBorrowedBooksCount > 5
    ) {
      throw new Error("Standard members can borrow up to 5 books at a time.");
    }

    if (
      updatedData.membershipType === "Premium" &&
      updatedBorrowedBooksCount > 10
    ) {
      throw new Error("Premium members can borrow up to 10 books at a time.");
    }

    if (
      updatedData.borrowedBooks &&
      updatedData.borrowedBooks !== borrower.borrowedBooks
    ) {
      const booksToReturn = borrower.borrowedBooks.filter(
        (bookId) => !updatedData.borrowedBooks.includes(bookId)
      );
      await handleBookReturns(booksToReturn);
    }

    Object.assign(borrower, updatedData);
    await borrower.save();

    return borrower;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function handleBookReturns(bookIds) {
  try {
    for (const bookId of bookIds) {
      const book = await Book.findById(bookId);
      if (book) {
        book.availableCopies += 1;
        await book.save();
      } else {
        console.log(`Book with ID ${bookId} not found.`);
      }
    }
  } catch (error) {
    throw new Error("Error while returning books: " + error.message);
  }
}

module.exports = router;
