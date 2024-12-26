const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(`${process.env.DB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
