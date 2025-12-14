import { api } from "../api";


function normalizeError(e) {
    const message =
        e?.payload?.errorMap?.[0]?.message ||
        e?.message ||
        "Unexpected error";

    const code =
        e?.payload?.errorMap?.[0]?.code ||
        e?.payload?.error?.code ||
        "unexpectedError";

    return {
        message,
        code,
        status: e?.status,
        payload: e?.payload,
        original: e,
    };
}

async function wrap(fn) {
    try {
        return await fn();
    } catch (e) {
        throw normalizeError(e);
    }
}

export const shoppingListService = {
    listActiveLists() {
        return wrap(() => api.listActiveLists());
    },
    listArchivedLists() {
        return wrap(() => api.listArchivedLists());
    },
    createList(name) {
        return wrap(() => api.createList({ name }));
    },
    deleteList(listId) {
        return wrap(() => api.deleteList({ listId }));
    },
    archiveList(listId) {
        return wrap(() => api.archiveList({ listId }));
    },
    unarchiveList(listId) {
        return wrap(() => api.unarchiveList({ listId }));
    },

    getListDetail(listId, includeResolved) {
        return wrap(() => api.getListDetail({ listId, includeResolved }));
    },
    renameList(listId, name) {
        return wrap(() => api.renameList({ listId, name }));
    },

    addMember(listId, userId) {
        return wrap(() => api.addMember({ listId, userId }));
    },
    removeMember(listId, userId) {
        return wrap(() => api.removeMember({ listId, userId }));
    },

    addItem(listId, name, quantity) {
        return wrap(() => api.addItem({ listId, name, quantity }));
    },
    updateItem(listId, itemId, patch) {
        return wrap(() => api.updateItem({ listId, itemId, patch }));
    },
    removeItem(listId, itemId) {
        return wrap(() => api.removeItem({ listId, itemId }));
    },
};
