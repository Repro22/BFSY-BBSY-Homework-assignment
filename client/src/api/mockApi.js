import { CURRENT_USER_ID } from "../config/currentUser.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const latency = () => sleep(120);

const users = [
    { id: "user-1", name: "Tom" },
    { id: "user-2", name: "Alice" },
    { id: "user-3", name: "Bob" },
];

function ensureMockUser(id) {
    if (!users.find((u) => u.id === id)) {
        users.push({ id, name: id });
    }
}

ensureMockUser(CURRENT_USER_ID);

let lists = [
    {
        id: "list-1",
        name: "Mock groceries",
        isArchived: false,
        ownerId: "user-1",
        members: [
            { id: "user-1", name: "Tom", role: "owner" },
            { id: "user-2", name: "Alice", role: "member" },
        ],
        items: [
            { id: "item-1", name: "Milk", quantity: 2, resolved: false },
            { id: "item-2", name: "Bread", quantity: 1, resolved: true },
        ],
    },
    {
        id: "list-2",
        name: "Mock party",
        isArchived: true,
        ownerId: "user-2",
        members: [
            { id: "user-2", name: "Alice", role: "owner" },
            { id: "user-1", name: "Tom", role: "member" },
        ],
        items: [{ id: "item-3", name: "Chips", quantity: 3, resolved: false }],
    },
];

function isOwner(list) {
    return list.ownerId === CURRENT_USER_ID;
}
function isMember(list) {
    return list.members.some((m) => m.id === CURRENT_USER_ID);
}
function assertMember(list) {
    if (!isMember(list)) throw new Error("Not a member of this list");
}
function assertOwner(list) {
    if (!isOwner(list)) throw new Error("Only owner can perform this action");
}
function computeCounts(list) {
    const itemsCount = list.items.length;
    const unresolvedItemsCount = list.items.filter((i) => !i.resolved).length;
    return { itemsCount, unresolvedItemsCount };
}
function toOverview(list) {
    const counts = computeCounts(list);
    return {
        id: list.id,
        name: list.name,
        isArchived: list.isArchived,
        ownerId: list.ownerId,
        isOwner: isOwner(list),
        ...counts,
    };
}
function toDetail(list, includeResolved) {
    const items = includeResolved ? list.items : list.items.filter((i) => !i.resolved);
    return { ...list, items };
}

export async function listActiveLists() {
    await latency();
    return lists.filter((l) => !l.isArchived && isMember(l)).map(toOverview);
}

export async function listArchivedLists() {
    await latency();
    return lists.filter((l) => l.isArchived && isMember(l)).map(toOverview);
}

export async function createList({ name }) {
    await latency();
    ensureMockUser(CURRENT_USER_ID);

    const id = `list-${Date.now()}`;
    const newList = {
        id,
        name,
        isArchived: false,
        ownerId: CURRENT_USER_ID,
        members: [{ id: CURRENT_USER_ID, name: CURRENT_USER_ID, role: "owner" }],
        items: [],
    };

    lists = [newList, ...lists];
    return toOverview(newList);
}

export async function deleteList({ listId }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) return { ok: true };
    assertOwner(list);
    lists = lists.filter((l) => l.id !== listId);
    return { ok: true };
}

export async function archiveList({ listId }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertOwner(list);
    list.isArchived = true;
    return list;
}

export async function unarchiveList({ listId }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertOwner(list);
    list.isArchived = false;
    return list;
}

export async function getListDetail({ listId, includeResolved = false }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertMember(list);
    return toDetail(list, includeResolved);
}

export async function renameList({ listId, name }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertOwner(list);
    list.name = name;
    return list;
}

export async function addMember({ listId, userId }) {
    await latency();
    ensureMockUser(userId);

    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertOwner(list);

    if (!list.members.some((m) => m.id === userId)) {
        list.members.push({ id: userId, name: userId, role: "member" });
    }
    return list;
}

export async function removeMember({ listId, userId }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");

    if (!(isOwner(list) || userId === CURRENT_USER_ID)) {
        throw new Error("Not allowed to remove this member");
    }

    if (userId === list.ownerId) throw new Error("Owner cannot be removed");

    list.members = list.members.filter((m) => m.id !== userId);
    return list;
}

export async function addItem({ listId, name, quantity }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertMember(list);

    const id = `item-${Date.now()}`;
    list.items.push({
        id,
        name,
        quantity: Number(quantity) >= 1 ? Number(quantity) : 1,
        resolved: false,
    });
    return list;
}

export async function updateItem({ listId, itemId, patch }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertMember(list);

    const item = list.items.find((i) => i.id === itemId);
    if (!item) throw new Error("Item not found");

    Object.assign(item, patch);
    return list;
}

export async function removeItem({ listId, itemId }) {
    await latency();
    const list = lists.find((l) => l.id === listId);
    if (!list) throw new Error("List not found");
    assertMember(list);

    list.items = list.items.filter((i) => i.id !== itemId);
    return list;
}

export async function listUsers() {
    await latency();
    return users.map((u) => ({ id: u.id, name: u.name }));
}

