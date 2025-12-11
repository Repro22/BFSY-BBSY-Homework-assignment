const mongoose = require("mongoose");
const { ShoppingList } = require("../models/shoppingListModel");

async function createList(ownerId, name) {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new Error("Invalid ownerId");
    }

    const list = await ShoppingList.create({
        name,
        archived: false,
        members: [
            {
                userId: ownerId,
                role: "owner",
            },
        ],
        items: [],
    });

    return list.toObject();
}

async function deleteList(listId) {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findByIdAndDelete(listId).lean();
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    return { status: "ok", list };
}

async function findListsForUser(userId, { archived, search, page, pageSize }) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }

    const filter = {
        archived: !!archived,
        "members.userId": userId,
    };

    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * pageSize;

    const [total, lists] = await Promise.all([
        ShoppingList.countDocuments(filter),
        ShoppingList.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),
    ]);

    return { total, lists };
}

async function findListByIdForUser(listId, userId, { includeResolved }) {
    if (
        !mongoose.Types.ObjectId.isValid(listId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        throw new Error("Invalid id");
    }

    const list = await ShoppingList.findOne({
        _id: listId,
        "members.userId": userId,
    }).lean();

    if (!list) return null;

    if (!includeResolved) {
        list.items = list.items.filter((i) => !i.resolved);
    }

    return list;
}
async function addMember(listId, userId, role = "member") {
    if (
        !mongoose.Types.ObjectId.isValid(listId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    const exists = list.members.some(
        (m) => m.userId.toString() === userId.toString()
    );
    if (exists) {
        return { status: "membershipExists", list: null };
    }

    list.members.push({ userId, role });
    await list.save();

    return { status: "ok", list: list.toObject() };
}

async function removeMember(listId, userId) {
    if (
        !mongoose.Types.ObjectId.isValid(listId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    const before = list.members.length;
    list.members = list.members.filter(
        (m) => m.userId.toString() !== userId.toString()
    );

    if (list.members.length === before) {
        return { status: "membershipMissing", list: null };
    }

    await list.save();
    return { status: "ok", list: list.toObject() };
}

async function addItem(listId, { name, quantity }) {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    list.items.push({
        name,
        quantity: quantity ?? 1,
        resolved: false,
    });

    await list.save();
    return { status: "ok", list: list.toObject() };
}

async function updateItem(listId, itemId, patch) {
    if (
        !mongoose.Types.ObjectId.isValid(listId) ||
        !mongoose.Types.ObjectId.isValid(itemId)
    ) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    const item = list.items.id(itemId);
    if (!item) {
        return { status: "itemNotFound", list: null };
    }

    if (patch.name !== undefined) item.name = patch.name;
    if (patch.quantity !== undefined) item.quantity = patch.quantity;
    if (patch.resolved !== undefined) item.resolved = patch.resolved;

    await list.save();
    return { status: "ok", list: list.toObject() };
}

async function removeItem(listId, itemId) {
    if (
        !mongoose.Types.ObjectId.isValid(listId) ||
        !mongoose.Types.ObjectId.isValid(itemId)
    ) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    const index = list.items.findIndex(
        (i) => i._id.toString() === itemId.toString()
    );

    if (index === -1) {
        return { status: "itemNotFound", list: null };
    }

    list.items.splice(index, 1);

    await list.save();

    return { status: "ok", list: list.toObject() };
}


async function updateList(listId, patch) {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    if (patch.name !== undefined) {
        list.name = patch.name;
    }

    await list.save();
    return { status: "ok", list: list.toObject() };
}

async function setArchived(listId, archived) {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return { status: "invalidId", list: null };
    }

    const list = await ShoppingList.findById(listId);
    if (!list) {
        return { status: "listNotFound", list: null };
    }

    list.archived = !!archived;
    await list.save();

    return { status: "ok", list: list.toObject() };
}

module.exports = {
    createList,
    deleteList,
    findListsForUser,
    findListByIdForUser,
    addMember,
    removeMember,
    addItem,
    updateItem,
    removeItem,
    updateList,
    setArchived,
};
