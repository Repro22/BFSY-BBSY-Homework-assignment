const { createDtoOut } = require("../utils/dtoOut");

function validate(schema, source = "body") {
    return (req, res, next) => {
        const toValidate =
            source === "body"
                ? req.body
                : source === "query"
                    ? req.query
                    : req.params;

        const { error, value } = schema.validate(toValidate, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "validationFailed",
                        message: "Input validation failed",
                        details: error.details,
                    },
                ])
            );
        }

        if (source === "body") req.body = value;
        else if (source === "query") req.query = value;
        else req.params = value;

        next();
    };
}

module.exports = { validate };
