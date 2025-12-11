require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shoppingListRoutes = require("./routes/shoppingListRoutes");

const app = express();

app.use(express.json());

// Mongo connection
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/shopping-list";
mongoose
    .connect(mongoUri, { autoIndex: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Health endpoint
app.get("/", (req, res) => {
    res.send("Shopping List API is running 🚀");
});

// Routes
app.use("/", shoppingListRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Shopping List API listening on port ${PORT}`);
});

module.exports = { app };
