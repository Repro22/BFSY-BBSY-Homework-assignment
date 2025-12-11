const mongoose = require("mongoose");
const { ShoppingList } = require("../models/shoppingListModel");
const { createDtoOut } = require("../utils/dtoOut");

async function requireListRole(allowedRoles, req, res, next) {
    try {
        const listId = req.params.listId;

        if (
            !mongoose.Types.ObjectId.isValid(listId) ||
            !mongoose.Types.ObjectId.isValid(req.user.id)
        ) {
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

        const list = await ShoppingList.findOne(
            {
                _id: listId,
                "members.userId": req.user.id,
            },
            { members: 1 }
        ).lean();

        const member = list?.members?.find(
            (m) => m.userId.toString() === req.user.id.toString()
        );

        const role = member?.role || null;

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

function requireListRoleMiddleware(allowedRoles) {
    return (req, res, next) => requireListRole(allowedRoles, req, res, next);
}

module.exports = { requireListRoleMiddleware };
