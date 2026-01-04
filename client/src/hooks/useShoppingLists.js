import { useCallback, useEffect, useMemo, useState } from "react";
import { CURRENT_USER_ID } from "../config/currentUser";
import { shoppingListService } from "../services/shoppingListService";
import {api} from "../api/index.js";

function cloneOverviewList(l) {
    return l ? { ...l } : l;
}

export function useShoppingLists() {
    const [lists, setLists] = useState([]);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [loading, setLoading] = useState(false);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const active = await shoppingListService.listActiveLists();
            if (includeArchived) {
                const archived = await shoppingListService.listArchivedLists();
                setLists([...active, ...archived].map(cloneOverviewList));
            } else {
                setLists(active);
            }
        } finally {
            setLoading(false);
        }
    }, [includeArchived]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const active = await shoppingListService.listActiveLists();
                if (cancelled) return;

                if (includeArchived) {
                    const archived = await shoppingListService.listArchivedLists();
                    if (cancelled) return;
                    setLists([...active, ...archived].map(cloneOverviewList));
                } else {
                    setLists(active);
                }
            } catch (e) {
                console.error("Failed to load lists:", e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [includeArchived]);

    const visibleLists = useMemo(() => {
        if (includeArchived) return lists;
        return lists.filter((l) => !l.isArchived);
    }, [lists, includeArchived]);

    async function createList(name) {
        const created = await api.createList({ name });

        setLists((prev) => [cloneOverviewList(created), ...prev]);
        return created;
    }

    async function deleteList(id) {
        await api.deleteList({ listId: id });
        setLists((prev) => prev.filter((l) => l.id !== id));
    }

    async function toggleArchive(listId, isArchived) {
        const updatedDetail = isArchived
            ? await api.unarchiveList({ listId })
            : await api.archiveList({ listId });

        await reload();
        return updatedDetail;
    }

    return {
        loading,
        lists: visibleLists,
        includeArchived,
        setIncludeArchived,
        createList,
        deleteList,
        toggleArchive,
        reload,
    };
}
