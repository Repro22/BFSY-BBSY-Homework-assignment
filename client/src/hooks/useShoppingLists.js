import { useCallback, useEffect, useMemo, useState } from "react";
import { CURRENT_USER_ID } from "../config/currentUser";
import { shoppingListService } from "../services/shoppingListService";

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
                setLists([...active, ...archived]);
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
                    setLists([...active, ...archived]);
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

    const createList = useCallback(async (name) => {
        const trimmed = String(name || "").trim();
        if (!trimmed) return null;

        const created = await shoppingListService.createList(trimmed);
        setLists((prev) => [created, ...prev]);
        return created;
    }, []);

    const deleteList = useCallback(async (list) => {
        if (!list) return;

        if (list.ownerId !== CURRENT_USER_ID && !list.isOwner) return;

        await shoppingListService.deleteList(list.id);
        setLists((prev) => prev.filter((l) => l.id !== list.id));
    }, []);

    const toggleArchive = useCallback(
        async (list) => {
            if (!list) return;

            if (list.ownerId !== CURRENT_USER_ID && !list.isOwner) return;

            if (list.isArchived) {
                await shoppingListService.unarchiveList(list.id);
            } else {
                await shoppingListService.archiveList(list.id);
            }

            await reload();
        },
        [reload]
    );

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
