const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const { requireProfile } = require("../middlewares/profileMiddleware");
const { requireListRoleMiddleware } = require("../middlewares/listRoleMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const { asyncHandler } = require("../middlewares/asyncHandler");
const validation = require("../validation/shoppingListValidation");
const controller = require("../controllers/shoppingListController");

router.get(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listListDtoInSchema, "query"),
    asyncHandler(controller.getLists)
);

router.delete(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    asyncHandler(controller.deleteListController)
);

router.get(
    "/lists/archived",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listListDtoInSchema, "query"),
    asyncHandler(controller.getArchivedLists)
);

// create & detail
router.post(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listCreateDtoInSchema, "body"),
    asyncHandler(controller.createListController)
);

router.get(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    asyncHandler(controller.getListDetailController)
);

router.patch(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(validation.listUpdateDtoInSchema, "body"),
    asyncHandler(controller.updateListController)
);

router.post(
    "/lists/:listId/archive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    asyncHandler(controller.archiveListController)
);

router.post(
    "/lists/:listId/unarchive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    asyncHandler(controller.unarchiveListController)
);

// members
router.post(
    "/lists/:listId/members",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(validation.memberAddDtoInSchema, "body"),
    asyncHandler(controller.addMemberController)
);

router.delete(
    "/lists/:listId/members/:userId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.memberParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    asyncHandler(controller.removeMemberController)
);

// items
router.post(
    "/lists/:listId/items",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(validation.itemCreateDtoInSchema, "body"),
    asyncHandler(controller.addItemController)
);

router.patch(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(validation.itemUpdateDtoInSchema, "body"),
    asyncHandler(controller.updateItemController)
);

router.delete(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    asyncHandler(controller.removeItemController)
);

module.exports = router;