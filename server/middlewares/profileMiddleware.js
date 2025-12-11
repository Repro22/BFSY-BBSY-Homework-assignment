const { createDtoOut } = require("../utils/dtoOut");

function requireProfile(allowedProfiles) {
    return (req, res, next) => {
        const profile = req.user?.profile;

        if (!profile || !allowedProfiles.includes(profile)) {
            return res.status(403).json(
                createDtoOut(null, [
                    {
                        code: "notAuthorized",
                        message: `Profile '${profile}' is not allowed for this endpoint`,
                    },
                ])
            );
        }
        next();
    };
}

module.exports = { requireProfile };
