const { createDtoOut } = require("../utils/dtoOut");
const {
    getListOverview,
    createList,
    deleteListService,
    getListDetail,
    addMember,
    removeMember,
    addItem,
    updateItem,
    removeItem,
    updateListService,
    setArchivedService,
} = require("../services/shoppingListService");
const { mapListToDetail } = require("../mappers/shoppingListMappers");

async function getLists(req, res) {
    const dtoIn = {
        ...req.query,
        userId: req.user.id,
    };

    try {
        const result = await getListOverview(dtoIn, false);
        return res.json(createDtoOut(result.data, [], dtoIn));
    } catch (err) {
        console.error("GET /lists error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to load lists" },
            ], dtoIn)
        );
    }
}

async function getArchivedLists(req, res) {
    const dtoIn = {
        ...req.query,
        userId: req.user.id,
    };

    try {
        const result = await getListOverview(dtoIn, true);
        return res.json(createDtoOut(result.data, [], dtoIn));
    } catch (err) {
        console.error("GET /lists/archived error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to load archived lists" },
            ], dtoIn)
        );
    }
}

async function createListController(req, res) {
    const dtoIn = {
        ...req.body,
        userId: req.user.id,
    };

    try {
        const result = await createList(dtoIn);
        return res.status(201).json(createDtoOut(result.data, [], dtoIn));
    } catch (err) {
        console.error("POST /lists error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to create list" },
            ], dtoIn)
        );
    }
}

async function getListDetailController(req, res) {
    const dtoIn = {
        ...req.params,
        includeResolved: req.query.includeResolved === "true",
        userId: req.user.id,
    };

    try {
        const result = await getListDetail(dtoIn);

        if (result.notFound) {
            return res.status(404).json(
                createDtoOut(
                    result.data,
                    [result.error],
                    dtoIn
                )
            );
        }

        return res.json(createDtoOut(result.data, [], dtoIn));
    } catch (err) {
        console.error("GET /lists/:listId error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to load list detail" },
            ], dtoIn)
        );
    }
}

async function updateListController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        ...req.body,
        userId: req.user.id,
    };

    try {
        const result = await updateListService(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "invalidId",
                            message: "listId is not a valid ObjectId",
                        },
                    ],
                    dtoIn
                )
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "listNotFound",
                            message: `List ${dtoIn.listId} not found`,
                        },
                    ],
                    dtoIn
                )
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("PATCH /lists/:listId error:", err);
        return res.status(500).json(
            createDtoOut(
                null,
                [
                    {
                        code: "internalError",
                        message: "Failed to update list",
                    },
                ],
                dtoIn
            )
        );
    }
}

async function deleteListController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        userId: req.user.id,
    };

    try {
        const result = await deleteListService(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "invalidId",
                            message: "listId is not a valid ObjectId",
                        },
                    ],
                    dtoIn
                )
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "listNotFound",
                            message: `List ${dtoIn.listId} not found`,
                        },
                    ],
                    dtoIn
                )
            );
        }

        // We could return the deleted list, but for deletion a simple flag is enough.
        const data = {
            listId: dtoIn.listId,
            deleted: true,
            // optional: deletedList: mapListToDetail(result.list),
        };

        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("DELETE /lists/:listId error:", err);
        return res.status(500).json(
            createDtoOut(
                null,
                [
                    {
                        code: "internalError",
                        message: "Failed to delete list",
                    },
                ],
                dtoIn
            )
        );
    }
}

async function archiveListController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        userId: req.user.id,
    };

    try {
        const result = await setArchivedService(dtoIn, true);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "invalidId",
                            message: "listId is not a valid ObjectId",
                        },
                    ],
                    dtoIn
                )
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "listNotFound",
                            message: `List ${dtoIn.listId} not found`,
                        },
                    ],
                    dtoIn
                )
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("POST /lists/:listId/archive error:", err);
        return res.status(500).json(
            createDtoOut(
                null,
                [
                    {
                        code: "internalError",
                        message: "Failed to archive list",
                    },
                ],
                dtoIn
            )
        );
    }
}

async function unarchiveListController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        userId: req.user.id,
    };

    try {
        const result = await setArchivedService(dtoIn, false);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "invalidId",
                            message: "listId is not a valid ObjectId",
                        },
                    ],
                    dtoIn
                )
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(
                    null,
                    [
                        {
                            code: "listNotFound",
                            message: `List ${dtoIn.listId} not found`,
                        },
                    ],
                    dtoIn
                )
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("POST /lists/:listId/unarchive error:", err);
        return res.status(500).json(
            createDtoOut(
                null,
                [
                    {
                        code: "internalError",
                        message: "Failed to unarchive list",
                    },
                ],
                dtoIn
            )
        );
    }
}

// Members
async function addMemberController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        userId: req.body.userId,
        currentUserId: req.user.id,
    };

    try {
        const result = await addMember(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "invalidId",
                        message: "listId or userId is not a valid ObjectId",
                    },
                ], dtoIn)
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    {
                        code: "listNotFound",
                        message: `List ${dtoIn.listId} not found`,
                    },
                ], dtoIn)
            );
        }

        if (result.status === "membershipExists") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "membershipAlreadyExists",
                        message: `User ${dtoIn.userId} is already a member of list ${dtoIn.listId}`,
                    },
                ], dtoIn)
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.status(201).json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("POST /lists/:listId/members error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to add member" },
            ], dtoIn)
        );
    }
}

async function removeMemberController(req, res) {
    const { listId, userId } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.listRole;

    const dtoIn = { listId, userId, currentUserId };

    if (userId !== currentUserId && currentUserRole !== "owner") {
        return res.status(403).json(
            createDtoOut(null, [
                {
                    code: "cannotRemoveOtherMember",
                    message: "Only list owners can remove other members from the list",
                },
            ], dtoIn)
        );
    }

    try {
        const result = await removeMember(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "invalidId",
                        message: "listId or userId is not a valid ObjectId",
                    },
                ], dtoIn)
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    {
                        code: "listNotFound",
                        message: `List ${listId} not found`,
                    },
                ], dtoIn)
            );
        }

        if (result.status === "membershipMissing") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "memberNotFoundOnList",
                        message: `User ${userId} is not a member of list ${listId}`,
                    },
                ], dtoIn)
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("DELETE /lists/:listId/members/:userId error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to remove member" },
            ], dtoIn)
        );
    }
}

// Items
async function addItemController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        name: req.body.name,
        quantity: req.body.quantity,
        userId: req.user.id,
    };

    try {
        const result = await addItem(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(null, [
                    { code: "invalidId", message: "listId is not a valid ObjectId" },
                ], dtoIn)
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    {
                        code: "listNotFound",
                        message: `List ${dtoIn.listId} not found`,
                    },
                ], dtoIn)
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.status(201).json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("POST /lists/:listId/items error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to add item to list" },
            ], dtoIn)
        );
    }
}

async function updateItemController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        itemId: req.params.itemId,
        ...req.body,
        userId: req.user.id,
    };

    try {
        const result = await updateItem(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "invalidId",
                        message: "listId or itemId is not a valid ObjectId",
                    },
                ], dtoIn)
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    { code: "listNotFound", message: `List ${dtoIn.listId} not found` },
                ], dtoIn)
            );
        }

        if (result.status === "itemNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    {
                        code: "itemNotFound",
                        message: `Item ${dtoIn.itemId} not found on list ${dtoIn.listId}`,
                    },
                ], dtoIn)
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("PATCH /lists/:listId/items/:itemId error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to update item" },
            ], dtoIn)
        );
    }
}

async function removeItemController(req, res) {
    const dtoIn = {
        listId: req.params.listId,
        itemId: req.params.itemId,
        userId: req.user.id,
    };

    try {
        const result = await removeItem(dtoIn);

        if (result.status === "invalidId") {
            return res.status(400).json(
                createDtoOut(null, [
                    {
                        code: "invalidId",
                        message: "listId or itemId is not a valid ObjectId",
                    },
                ], dtoIn)
            );
        }

        if (result.status === "listNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    { code: "listNotFound", message: `List ${dtoIn.listId} not found` },
                ], dtoIn)
            );
        }

        if (result.status === "itemNotFound") {
            return res.status(404).json(
                createDtoOut(null, [
                    {
                        code: "itemNotFound",
                        message: `Item ${dtoIn.itemId} not found on list ${dtoIn.listId}`,
                    },
                ], dtoIn)
            );
        }

        const data = { list: mapListToDetail(result.list) };
        return res.json(createDtoOut(data, [], dtoIn));
    } catch (err) {
        console.error("DELETE /lists/:listId/items/:itemId error:", err);
        return res.status(500).json(
            createDtoOut(null, [
                { code: "internalError", message: "Failed to delete item" },
            ], dtoIn)
        );
    }
}

module.exports = {
    getLists,
    deleteListController,
    getArchivedLists,
    createListController,
    getListDetailController,
    updateListController,
    archiveListController,
    unarchiveListController,
    addMemberController,
    removeMemberController,
    addItemController,
    updateItemController,
    removeItemController,
};
