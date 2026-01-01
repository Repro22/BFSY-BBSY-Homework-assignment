const { HttpError } = require("../errors/HttpError");

function errorHandlerMiddleware(err, req, res, next) {
    if (
        err instanceof HttpError ||
        (err && typeof err.status === "number" && typeof err.code === "string")
    ) {
        return res.status(err.status).json({
            errorMap: [
                {
                    code: err.code,
                    message: err.message,
                },
            ],
        });
    }

    if (err?.isJoi) {
        return res.status(400).json({
            errorMap: [
                {
                    code: "validationFailed",
                    message: err.message,
                },
            ],
        });
    }

    console.error("Unhandled error:", err);

    return res.status(500).json({
        errorMap: [
            {
                code: "internalServerError",
                message: "Unexpected server error",
            },
        ],
    });
}

module.exports = { errorHandlerMiddleware };
