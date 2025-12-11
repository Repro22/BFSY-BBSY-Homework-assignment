const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const { requireProfile } = require("../middlewares/profileMiddleware");
const { requireListRoleMiddleware } = require("../middlewares/listRoleMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const validation = require("../validation/shoppingListValidation");
const controller = require("../controllers/shoppingListController");

// lists overview
router.get(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listListDtoInSchema, "query"),
    controller.getLists
);

router.delete(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    controller.deleteListController
);

router.get(
    "/lists/archived",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listListDtoInSchema, "query"),
    controller.getArchivedLists
);

// create & detail
router.post(
    "/lists",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listCreateDtoInSchema, "body"),
    controller.createListController
);

router.get(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    controller.getListDetailController
);

router.patch(
    "/lists/:listId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(validation.listUpdateDtoInSchema, "body"),
    controller.updateListController
);

router.post(
    "/lists/:listId/archive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    controller.archiveListController
);

router.post(
    "/lists/:listId/unarchive",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    controller.unarchiveListController
);

// members
router.post(
    "/lists/:listId/members",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner"]),
    validate(validation.memberAddDtoInSchema, "body"),
    controller.addMemberController
);

router.delete(
    "/lists/:listId/members/:userId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.memberParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    controller.removeMemberController
);

// items
router.post(
    "/lists/:listId/items",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.listIdParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(validation.itemCreateDtoInSchema, "body"),
    controller.addItemController
);

router.patch(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    validate(validation.itemUpdateDtoInSchema, "body"),
    controller.updateItemController
);

router.delete(
    "/lists/:listId/items/:itemId",
    authMiddleware,
    requireProfile(["user", "admin"]),
    validate(validation.itemParamsSchema, "params"),
    requireListRoleMiddleware(["owner", "member"]),
    controller.removeItemController
);

module.exports = router;
