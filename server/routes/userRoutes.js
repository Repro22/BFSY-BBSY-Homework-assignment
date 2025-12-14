const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const { requireProfile } = require("../middlewares/profileMiddleware");
const controller = require("../controllers/userController");

router.get(
    "/users",
    authMiddleware,
    requireProfile(["user", "admin"]),
    controller.listUsersController
);

module.exports = router;
