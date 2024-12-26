require("dotenv").config();
const express = require("express");
const app = express();
const connection = require("./db");
const author = require("./routes/Author");
const books = require("./routes/Books");
const brow = require("./routes/Brow");

app.use(express.json());

app.use("/api/author", author);
app.use("/api/books", books);
app.use("/api/brow", brow);

connection()
  .then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
