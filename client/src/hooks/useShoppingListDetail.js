import { useCallback, useEffect, useMemo, useState } from "react";
import { CURRENT_USER_ID } from "../config/currentUser";
import { shoppingListService } from "../services/shoppingListService";

export function useShoppingListDetail(listId) {
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(false);

    const [itemFilter, setItemFilter] = useState("unresolved");
    const includeResolved = itemFilter === "all";

    const reload = useCallback(async () => {
        if (!listId) return;
        setLoading(true);
        try {
            const detail = await shoppingListService.getListDetail(listId, includeResolved);
            setList(detail);
        } finally {
            setLoading(false);
        }
    }, [listId, includeResolved]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!listId) return;
            setLoading(true);
            try {
                const detail = await shoppingListService.getListDetail(listId, includeResolved);
                if (!cancelled) setList(detail);
            } catch (e) {
                console.error("Failed to load list detail:", e);
                if (!cancelled) setList(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [listId, includeResolved]);

    const isOwner = useMemo(() => {
        if (!list) return false;
        return list.ownerId === CURRENT_USER_ID;
    }, [list]);

    const isMember = useMemo(() => {
        if (!list) return false;
        return (list.members || []).some((m) => m.id === CURRENT_USER_ID);
    }, [list]);

    const canInteract = isOwner || isMember;

    const visibleItems = useMemo(() => {
        if (!list) return [];
        const items = list.items || [];
        if (itemFilter === "all") return items;
        return items.filter((i) => !i.resolved);
    }, [list, itemFilter]);


    const renameList = useCallback(
        async (name) => {
            if (!list || !isOwner) return null;

            const trimmed = String(name || "").trim();
            if (!trimmed) return null;

            const updated = await shoppingListService.renameList(list.id, trimmed);
            setList(updated);
            return updated;
        },
        [list, isOwner]
    );

    const addMember = useCallback(
        async (userId) => {
            if (!list || !isOwner) return null;

            const trimmed = String(userId || "").trim();
            if (!trimmed) return null;

            const updated = await shoppingListService.addMember(list.id, trimmed);
            setList(updated);
            return updated;
        },
        [list, isOwner]
    );

    const removeMember = useCallback(
        async (userId) => {
            if (!list) return null;

            const trimmed = String(userId || "").trim();
            if (!trimmed) return null;

            const isSelf = trimmed === CURRENT_USER_ID;
            if (!isOwner && !isSelf) return null;

            const updated = await shoppingListService.removeMember(list.id, trimmed);
            setList(updated);
            return updated;
        },
        [list, isOwner]
    );

    const addItem = useCallback(
        async ({ name, quantity }) => {
            if (!list || !canInteract) return null;

            const trimmedName = String(name || "").trim();
            if (!trimmedName) return null;

            const qtyNum = Number(quantity);
            const safeQty = Number.isFinite(qtyNum) && qtyNum >= 1 ? qtyNum : 1;

            const updated = await shoppingListService.addItem(list.id, trimmedName, safeQty);
            setList(updated);
            return updated;
        },
        [list, canInteract]
    );

    const toggleResolved = useCallback(
        async (item) => {
            if (!list || !canInteract || !item?.id) return null;

            const updated = await shoppingListService.updateItem(list.id, item.id, {
                resolved: !item.resolved,
            });

            setList(updated);
            return updated;
        },
        [list, canInteract]
    );

    const removeItem = useCallback(
        async (itemId) => {
            if (!list || !canInteract) return null;

            const trimmed = String(itemId || "").trim();
            if (!trimmed) return null;

            const updated = await shoppingListService.removeItem(list.id, trimmed);
            setList(updated);
            return updated;
        },
        [list, canInteract]
    );

    return {
        list,
        loading,

        itemFilter,
        setItemFilter,
        visibleItems,

        isOwner,
        isMember,
        canInteract,

        reload,

        renameList,
        addMember,
        removeMember,

        addItem,
        toggleResolved,
        removeItem,
    };
}
