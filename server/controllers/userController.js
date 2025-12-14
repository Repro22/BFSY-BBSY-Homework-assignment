const { createDtoOut } = require("../utils/dtoOut");
const { listUsers } = require("../services/userService");

async function listUsersController(req, res) {
    const dtoIn = { userId: req.user.id };

    try {
        const users = await listUsers();
        return res.json(createDtoOut({ users }, [], dtoIn));
    } catch (err) {
        console.error("GET /users error:", err);
        return res.status(500).json(
            createDtoOut(
                null,
                [{ code: "internalError", message: "Failed to load users" }],
                dtoIn
            )
        );
    }
}

module.exports = { listUsersController };
