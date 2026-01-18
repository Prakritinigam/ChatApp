require("dotenv").config();
const mongoose = require("mongoose");

const DB = process.env.MONGO_URI;

if (!DB) {
  console.error("❌ MongoDB URI is missing. Check your .env file.");
  process.exit(1);
}

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) =>
    console.error("❌ MongoDB Connection error:", error.message)
  );
