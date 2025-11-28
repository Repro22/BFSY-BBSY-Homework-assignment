require("dotenv").config();

const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Shopping List API is running 🚀");
});


const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shopping-list";

mongoose
    .connect(MONGODB_URI, { autoIndex: true })
    .then(() => console.log("Connected to DB:", mongoose.connection.name))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// User collection – simplified version
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        login: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);
const User = mongoose.model("User", userSchema);

// core list entity
const shoppingListSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        archived: { type: Boolean, default: false },
    },
    { timestamps: true }
);
const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

// Membership/Ownership relational object
const listMembershipSchema = new mongoose.Schema(
    {
        listId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShoppingList",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["owner", "member"],
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

listMembershipSchema.index({ listId: 1, userId: 1 }, { unique: true });

const ListMembership = mongoose.model("ListMembership", listMembershipSchema);

// items with quantity function
const listItemSchema = new mongoose.Schema(
    {
        listId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ShoppingList",
            required: true,
            index: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, default: 1, min: 1 },
        resolved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index to support “items with quantity > 1”
listItemSchema.index({ listId: 1, quantity: 1 });

const ListItem = mongoose.model("ListItem", listItemSchema);



function createDtoOut(dtoIn, errors = []) {
    return {
        dtoIn: dtoIn ?? null,
        errorMap: errors,
    };
}

/**
 * Very simple authentication:
 * - We expect header:  Authorization: Bearer <userId>|<profile>
 */
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
                    message: "Invalid Authorization token format, expected '<userId>|<profile>'",
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


async function requireListRole(allowedRoles, req, res, next) {
    try {
        const listId = req.params.listId;

        if (!mongoose.Types.ObjectId.isValid(listId) || !mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json(
                createDtoOut(
                    { listId },
                    [
                        {
                            code: "invalidId",
                            message: "listId or userId is not a valid ObjectId",
                        },
                    ]
                )
            );
        }

        const membership = await ListMembership.findOne({
            listId,
            userId: req.user.id,
        }).lean();

        const role = membership?.role || null;

        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json(
                createDtoOut(
                    { listId },
                    [
                        {
                            code: "insufficientListRole",
                            message: `User is not allowed to access list ${listId} as one of [${allowedRoles.join(
                                ", "
                            )}]`,
                            details: { role },
                        },
                    ]
                )
            );
        }

        req.listRole = role;
        next();
    } catch (err) {
        console.error("requireListRole error:", err);
        return res.status(500).json(
            createDtoOut(
                { listId: req.params.listId },
                [
                    {
                        code: "internalError",
                        message: "Failed to verify list membership",
                    },
                ]
            )
        );
    }
}

// Wrap requireListRole for use as Express middleware
function requireListRoleMiddleware(allowedRoles) {
    return (req, res, next) => requireListRole(allowedRoles, req, res, next);
}

/**
 * Validation middleware using Joi schemas
 */
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
/**DTOs
*/

/** lists
*/
const listListDtoInSchema = Joi.object({
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
});

const listCreateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
});

const listIdParamsSchema = Joi.object({
    listId: Joi.string().required(),
});

const listGetQuerySchema = Joi.object({
    includeResolved: Joi.boolean().default(false),
});

const listUpdateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
}).min(1); // at least one field

// flattened membership in API
const memberAddDtoInSchema = Joi.object({
    userId: Joi.string().required(),
});

const memberParamsSchema = Joi.object({
    listId: Joi.string().required(),
    userId: Joi.string().required(),
});

// quantity function & resolved flag
const itemCreateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(200).required(),
    quantity: Joi.number().integer().min(1).default(1),
});

const itemUpdateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    quantity: Joi.number().integer().min(1).optional(),
    resolved: Joi.boolean().optional(),
}).min(1);

const itemParamsSchema = Joi.object({
    listId: Joi.string().required(),
    itemId: Joi.string().required(),
});

// active lists
app.get(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listListDtoInSchema, "query"),
    (req, res) => {
        const dtoIn = {
            ...req.query,
            // In later logic you would also imply filter by current user and archived:false
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// archived lists
app.get(
    "/lists/archived",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listListDtoInSchema, "query"),
    (req, res) => {
        const dtoIn = {
            ...req.query,
            // Later: archived:true filter
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// create list
app.post(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listCreateDtoInSchema, "body"),
    (req, res) => {
        const dtoIn = {
            ...req.body,
            // Our design implies the creator becomes owner:
            // ownerId: req.user.id (through membership)
        };
        return res.status(201).json(createDtoOut(dtoIn, []));
    }
);

// list detail
app.get(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    validate(listGetQuerySchema, "query"),
    requireListRoleMiddleware(["owner", "member"]),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            includeResolved: req.query.includeResolved,
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// rename list
app.patch(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(listUpdateDtoInSchema, "body"),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            ...req.body,
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// archive
app.post(
    "/lists/:listId/archive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    (req, res) => {
        const dtoIn = { listId: req.params.listId };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// unarchive
app.post(
    "/lists/:listId/unarchive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    (req, res) => {
        const dtoIn = { listId: req.params.listId };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// add member
app.post(
    "/lists/:listId/members",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(memberAddDtoInSchema, "body"),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            userId: req.body.userId,
        };
        return res.status(201).json(createDtoOut(dtoIn, []));
    }
);

// delete user
app.delete(
    "/lists/:listId/members/:userId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(memberParamsSchema, "params"),
    async (req, res) => {
        const { listId, userId } = req.params;
        const currentUserId = req.user.id;

        // (not yet implemented in DB):
        // - if userId === currentUserId: member/owner can leave
        // - if userId !== currentUserId: must be owner

        const dtoIn = { listId, userId, currentUserId };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// add list
app.post(
    "/lists/:listId/items",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(itemCreateDtoInSchema, "body"),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            ...req.body,
        };
        return res.status(201).json(createDtoOut(dtoIn, []));
    }
);

// update list
app.patch(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(itemUpdateDtoInSchema, "body"),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            itemId: req.params.itemId,
            ...req.body,
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

// delete list
app.delete(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    (req, res) => {
        const dtoIn = {
            listId: req.params.listId,
            itemId: req.params.itemId,
        };
        return res.json(createDtoOut(dtoIn, []));
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Shopping List API listening on port ${PORT}`);
});

