require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");


    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

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
app.use("/", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Shopping List API listening on port ${PORT}`);
});

module.exports = { app };
