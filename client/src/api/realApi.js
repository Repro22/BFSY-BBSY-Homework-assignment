import { API_BASE_URL, CURRENT_USER_ID, CURRENT_PROFILE } from "../config/currentUser.js";

const BASE = API_BASE_URL;

function authHeader() {
    return `Bearer ${CURRENT_USER_ID}|${CURRENT_PROFILE}`;
}

async function request(path, { method = "GET", body } = {}) {
    const headers = {
        Authorization: authHeader(),
    };
    if (body) headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg =
            json?.errorMap?.[0]?.message ||
            json?.error?.message ||
            json?.message ||
            `Request failed (${res.status})`;

        const err = new Error(msg);
        err.status = res.status;
        err.payload = json;
        throw err;
    }

    return json;
}

function normalizeListOverview(l) {
    const isOwner = !!l.isOwner;

    return {
        id: l.id,
        name: l.name,
        isArchived: !!l.archived,
        ownerId: isOwner ? CURRENT_USER_ID : undefined,
        isOwner,
        itemsCount: l.itemsCount ?? 0,
        unresolvedItemsCount: l.unresolvedItemsCount ?? 0,
    };
}

function normalizeMembers(members) {
    return (members || []).map((m) => ({
        id: m.userId ?? m.id,
        name: (m.userId ?? m.id), // no names in BE yet
        role: m.role,
    }));
}

function normalizeItems(items) {
    return (items || []).map((i) => ({
        id: i.id ?? i._id,
        name: i.name,
        quantity: i.quantity ?? 1,
        resolved: !!i.resolved,
    }));
}

function normalizeListDetail(list) {
    const members = normalizeMembers(list.members);
    const owner = members.find((m) => m.role === "owner");

    return {
        id: list.id,
        name: list.name,
        ownerId: owner?.id,
        members,
        items: normalizeItems(list.items),
        isArchived: !!list.archived,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
    };
}

export async function listActiveLists() {
    const dtoOut = await request(`/lists`);
    return (dtoOut?.data?.lists || []).map(normalizeListOverview);
}

export async function listArchivedLists() {
    const dtoOut = await request(`/lists/archived`);
    return (dtoOut?.data?.lists || []).map(normalizeListOverview);
}

export async function createList({ name }) {
    const dtoOut = await request(`/lists`, { method: "POST", body: { name } });
    const detail = dtoOut?.data?.list;

    if (!detail) throw new Error("Unexpected response from POST /lists (missing data.list)");

    const items = detail.items || [];
    const unresolved = items.filter((i) => !i.resolved);
    const owner = (detail.members || []).find((m) => m.role === "owner");
    const ownerId = owner?.userId ?? owner?.id;

    return {
        id: detail.id,
        name: detail.name,
        isArchived: !!detail.archived,
        ownerId,
        isOwner: ownerId === CURRENT_USER_ID,
        itemsCount: items.length,
        unresolvedItemsCount: unresolved.length,
    };
}

export async function deleteList({ listId }) {
    await request(`/lists/${encodeURIComponent(listId)}`, { method: "DELETE" });
    return { ok: true };
}

export async function archiveList({ listId }) {
    const dtoOut = await request(`/lists/${encodeURIComponent(listId)}/archive`, { method: "POST" });
    const updated = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(updated);
}

export async function unarchiveList({ listId }) {
    const dtoOut = await request(`/lists/${encodeURIComponent(listId)}/unarchive`, { method: "POST" });
    const updated = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(updated);
}

export async function getListDetail({ listId, includeResolved = false }) {
    const dtoOut = await request(
        `/lists/${encodeURIComponent(listId)}?includeResolved=${includeResolved ? "true" : "false"}`
    );
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function renameList({ listId, name }) {
    const dtoOut = await request(`/lists/${encodeURIComponent(listId)}`, {
        method: "PATCH",
        body: { name },
    });
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function addMember({ listId, userId }) {
    const dtoOut = await request(`/lists/${encodeURIComponent(listId)}/members`, {
        method: "POST",
        body: { userId },
    });
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function removeMember({ listId, userId }) {
    const dtoOut = await request(
        `/lists/${encodeURIComponent(listId)}/members/${encodeURIComponent(userId)}`,
        { method: "DELETE" }
    );
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function addItem({ listId, name, quantity }) {
    const dtoOut = await request(`/lists/${encodeURIComponent(listId)}/items`, {
        method: "POST",
        body: { name, quantity },
    });
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function updateItem({ listId, itemId, patch }) {
    const dtoOut = await request(
        `/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
        { method: "PATCH", body: patch }
    );
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function removeItem({ listId, itemId }) {
    const dtoOut = await request(
        `/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`,
        { method: "DELETE" }
    );
    const detail = dtoOut?.data?.list ?? dtoOut?.data;
    return normalizeListDetail(detail);
}

export async function listUsers() {
    const dtoOut = await request("/users");
    return dtoOut?.data?.users || [];
}
