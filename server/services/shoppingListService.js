const shoppingListDao = require("../dao/shoppingListDao");
const {
    mapListToSummary,
    mapListToDetail,
} = require("../mappers/shoppingListMappers");
const { HttpError } = require("../errors/HttpError");

async function getListOverview(dtoIn, archived) {
    const page = Number(dtoIn.page ?? 1);
    const pageSize = Number(dtoIn.pageSize ?? 20);
    const search = dtoIn.search || "";
    const userId = dtoIn.userId;

    const { total, lists } = await shoppingListDao.findListsForUser(userId, {
        archived,
        search,
        page,
        pageSize,
    });

    const summaries = lists.map((l) => mapListToSummary(l, userId));

    return {
        data: {
            page,
            pageSize,
            total,
            lists: summaries,
        },
    };
}

async function createList(dtoIn) {
    const list = await shoppingListDao.createList(dtoIn.userId, dtoIn.name);
    return {
        data: {
            list: mapListToDetail(list),
        },
    };
}
async function deleteListService(dtoIn) {
    const result = await shoppingListDao.deleteList(dtoIn.listId);
    return result;
}

async function getListDetail(dtoIn) {
    const list = await shoppingListDao.findListByIdForUser(
        dtoIn.listId,
        dtoIn.userId,
        { includeResolved: dtoIn.includeResolved }
    );

    if (!list) {
        throw new HttpError(
            404,
            "listNotFound",
            `List ${listId} not found or not accessible`
        );
    }

    return {
        data: {
            list: mapListToDetail(list),
        },
    };
}

// Members
async function addMember(dtoIn) {
    const result = await shoppingListDao.addMember(
        dtoIn.listId,
        dtoIn.userId,
        "member"
    );

    return result;
}

async function removeMember(dtoIn) {
    const result = await shoppingListDao.removeMember(dtoIn.listId, dtoIn.userId);
    return result;
}

// Items
async function addItem(dtoIn) {
    const result = await shoppingListDao.addItem(dtoIn.listId, {
        name: dtoIn.name,
        quantity: dtoIn.quantity,
    });
    return result;
}

async function updateItem(dtoIn) {
    const result = await shoppingListDao.updateItem(
        dtoIn.listId,
        dtoIn.itemId,
        {
            name: dtoIn.name,
            quantity: dtoIn.quantity,
            resolved: dtoIn.resolved,
        }
    );
    return result;
}

async function removeItem(dtoIn) {
    const result = await shoppingListDao.removeItem(dtoIn.listId, dtoIn.itemId);
    return result;
}

async function updateListService(dtoIn) {
    const result = await shoppingListDao.updateList(dtoIn.listId, {
        name: dtoIn.name,
    });

    return result;
}

async function setArchivedService(dtoIn, archived) {
    const result = await shoppingListDao.setArchived(dtoIn.listId, archived);
    return result;
}

module.exports = {
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
};
