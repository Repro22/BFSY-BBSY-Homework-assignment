import React, { useMemo, useState } from "react";
import { useShoppingLists } from "../hooks/useShoppingLists";
import { CURRENT_USER_ID } from "../config/currentUser";
import { useBusy } from "../hooks/useBusy";
import { useError } from "../hooks/useError";
import ErrorBanner from "../components/ErrorBanner";

import ListTile from "../components/ListTile";
import NewListModal from "../components/NewListModal";
import DeleteListDialog from "../components/DeleteListDialog";

export default function ShoppingListsOverview({ onOpenList }) {
    const {
        lists,
        loading,
        includeArchived,
        setIncludeArchived,
        createList,
        deleteList,
        toggleArchive,
    } = useShoppingLists();

    const { isBusy, run } = useBusy();
    const { error, setFromException, clearError } = useError();

    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);

    const listsWithOwnerFlag = useMemo(() => {
        return lists.map((l) => ({
            ...l,
            canOwnerActions: l.ownerId === CURRENT_USER_ID || l.isOwner,
        }));
    }, [lists]);

    const handleCreate = async (name) => {
        try {
            await run("createList", () => createList(name));
            setIsNewModalOpen(false);
        } catch (e) {
            setFromException(e);
        }
    };

    const requestDelete = (listId) => {
        const list = listsWithOwnerFlag.find((l) => l.id === listId);
        if (!list || !list.canOwnerActions) return;
        setListToDelete(list);
    };

    const confirmDelete = async () => {
        if (!listToDelete) return;
        try {
            await run("deleteList", () => deleteList(listToDelete));
        } catch (e) {
            setFromException(e);
        } finally {
            setListToDelete(null);
        }
    };

    const handleToggleArchive = async (list) => {
        try {
            await run(`archive:${list.id}`, () => toggleArchive(list));
        } catch (e) {
            setFromException(e);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.toolbar}>
                    <h1 style={styles.title}>Shopping Lists</h1>

                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={includeArchived}
                                onChange={() => setIncludeArchived((p) => !p)}
                            />
                            Include archived
                        </label>

                        <button
                            type="button"
                            style={{
                                ...styles.primaryButton,
                                opacity: isBusy("createList") ? 0.7 : 1,
                                cursor: isBusy("createList") ? "not-allowed" : "pointer",
                            }}
                            onClick={() => setIsNewModalOpen(true)}
                            disabled={isBusy("createList")}
                        >
                            {isBusy("createList") ? "Creating…" : loading ? "Loading…" : "+ New list"}
                        </button>
                    </div>
                </div>

                <ErrorBanner error={error} onDismiss={clearError} />

                {!listsWithOwnerFlag.length && !loading && (
                    <div style={{ opacity: 0.75, marginTop: 12 }}>No shopping lists to display.</div>
                )}

                <div style={styles.grid}>
                    {listsWithOwnerFlag.map((list) => (
                        <ListTile
                            key={list.id}
                            list={list}
                            canOwnerActions={list.canOwnerActions}
                            onOpen={onOpenList}
                            onArchiveToggle={handleToggleArchive}
                            onDelete={requestDelete}
                        />
                    ))}
                </div>
            </div>

            <NewListModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSubmit={handleCreate}
                submitting={isBusy("createList")}
            />

            <DeleteListDialog
                isOpen={!!listToDelete}
                listName={listToDelete?.name}
                onCancel={() => setListToDelete(null)}
                onConfirm={confirmDelete}
                submitting={isBusy("deleteList")}
            />
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: 24,
        display: "flex",
        justifyContent: "center",
    },
    card: {
        background: "#ffffff",
        borderRadius: 12,
        padding: 24,
        maxWidth: 900,
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        margin: 0,
        fontSize: "1.6rem",
    },
    checkboxLabel: {
        fontSize: "0.85rem",
        display: "flex",
        gap: 6,
        alignItems: "center",
    },
    primaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: "0.9rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 16,
        marginTop: 16,
    },
};
