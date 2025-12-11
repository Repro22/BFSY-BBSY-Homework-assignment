const { createDtoOut } = require("../utils/dtoOut");

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json(
            createDtoOut(null, [
                {
                    code: "unauthenticated",
                    message: "Missing Authorization header",
                },
            ])
        );
    }

    const [, token] = authHeader.split(" ");
    const [userId, profile = "user"] = (token || "").split("|");

    if (!userId) {
        return res.status(401).json(
            createDtoOut(null, [
                {
                    code: "unauthenticated",
                    message:
                        "Invalid Authorization token format, expected '<userId>|<profile>'",
                },
            ])
        );
    }

    req.user = {
        id: userId,
        profile, // "user" or "admin"
    };

    next();
}

module.exports = { authMiddleware };
